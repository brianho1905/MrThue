from __future__ import annotations

import json
from typing import Any

from sqlalchemy.orm import Session

from .models import Funnel, FunnelChoice, FunnelNode, FunnelSession, FunnelSessionAnswer


def _parse_config(funnel: Funnel) -> dict[str, Any]:
    try:
        return json.loads(funnel.config_json or "{}")
    except json.JSONDecodeError:
        return {}


def _clamp_score(score: int, cfg: dict[str, Any]) -> int:
    bounds = cfg.get("score_bounds") or {}
    lo = int(bounds.get("min", 0))
    hi = int(bounds.get("max", 100))
    return max(lo, min(hi, score))


def _band_for_score(score: int, cfg: dict[str, Any]) -> dict[str, Any]:
    bands: list[dict[str, Any]] = list(cfg.get("bands") or [])
    bands_sorted = sorted(bands, key=lambda b: int(b.get("max", 100)))
    for band in bands_sorted:
        if score <= int(band.get("max", 100)):
            return band
    return bands_sorted[-1] if bands_sorted else {"risk": "Không xác định", "action": "", "advice": ""}


def _node_by_key(db: Session, funnel_id: int, node_key: str) -> FunnelNode | None:
    return (
        db.query(FunnelNode)
        .filter(FunnelNode.funnel_id == funnel_id, FunnelNode.node_key == node_key)
        .one_or_none()
    )


def node_public_dict(node: FunnelNode) -> dict[str, Any]:
    choices = [
        {"label": c.label, "value": c.value}
        for c in sorted(node.choices, key=lambda x: x.display_order)
    ]
    return {
        "key": node.node_key,
        "kind": node.kind,
        "title": node.title,
        "body": node.body or "",
        "choices": choices,
    }


def start_session(db: Session, funnel: Funnel, user_id: int | None = None) -> tuple[FunnelSession, dict[str, Any]]:
    cfg = _parse_config(funnel)
    base = int(cfg.get("base_score", 0))
    start_key = funnel.start_node_key
    node = _node_by_key(db, funnel.id, start_key)
    if not node:
        raise ValueError("start_node_key không tồn tại")

    session = FunnelSession(
        funnel_id=funnel.id,
        user_id=user_id,
        current_node_key=start_key,
        score=base,
        status="in_progress",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session, node_public_dict(node)


def submit_answer(db: Session, session: FunnelSession, choice_value: str) -> dict[str, Any]:
    funnel = session.funnel
    cfg = _parse_config(funnel)
    node = _node_by_key(db, funnel.id, session.current_node_key)
    if not node or node.kind != "question":
        raise ValueError("Trạng thái phiên không hợp lệ")

    choice: FunnelChoice | None = None
    for c in node.choices:
        if c.value == choice_value:
            choice = c
            break
    if not choice:
        raise ValueError("Lựa chọn không hợp lệ")

    next_key = choice.next_node_key
    session.score = _clamp_score(session.score + int(choice.score_delta), cfg)

    db.add(
        FunnelSessionAnswer(
            session_id=session.id,
            node_key=node.node_key,
            choice_value=choice_value,
            insight_after=choice.insight_after,
        )
    )
    session.current_node_key = next_key

    next_node = _node_by_key(db, funnel.id, next_key)
    if not next_node:
        raise ValueError("next_node_key không hợp lệ")

    result_payload: dict[str, Any] | None = None
    if next_node.kind == "result":
        session.status = "completed"
        result_payload = _build_result_snapshot(session, next_node, cfg)
        session.result_snapshot_json = json.dumps(result_payload, ensure_ascii=False)

    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "score": session.score,
        "insight_after": choice.insight_after,
        "completed": session.status == "completed",
        "node": node_public_dict(next_node),
        "result": result_payload,
    }


def submit_lead(db: Session, session: FunnelSession, full_name: str, phone: str) -> dict[str, Any]:
    funnel = session.funnel
    cfg = _parse_config(funnel)
    node = _node_by_key(db, funnel.id, session.current_node_key)
    if not node or node.kind != "lead":
        raise ValueError("Không phải bước thu thông tin liên hệ")

    if not node.lead_next_node_key:
        raise ValueError("lead_next_node_key chưa cấu hình")

    session.full_name = full_name
    session.phone = phone
    session.current_node_key = node.lead_next_node_key

    next_node = _node_by_key(db, funnel.id, node.lead_next_node_key)
    if not next_node:
        raise ValueError("lead_next_node_key không tồn tại")

    db.add(
        FunnelSessionAnswer(
            session_id=session.id,
            node_key=node.node_key,
            choice_value="lead_submitted",
            insight_after=None,
        )
    )

    result_payload: dict[str, Any] | None = None
    if next_node.kind == "result":
        session.status = "completed"
        result_payload = _build_result_snapshot(session, next_node, cfg)
        session.result_snapshot_json = json.dumps(result_payload, ensure_ascii=False)

    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "score": session.score,
        "completed": session.status == "completed",
        "node": node_public_dict(next_node),
        "result": result_payload,
    }


def _build_result_snapshot(session: FunnelSession, result_node: FunnelNode, cfg: dict[str, Any]) -> dict[str, Any]:
    band = _band_for_score(session.score, cfg)
    risk = str(band.get("risk", ""))
    action = str(band.get("action", ""))
    advice = str(band.get("advice", ""))

    body = result_node.body or ""
    body = (
        body.replace("{{score}}", str(session.score))
        .replace("{{risk_level}}", risk)
        .replace("{{next_action}}", action)
        .replace("{{advice}}", advice)
    )

    return {
        "title": result_node.title,
        "body": body,
        "compliance_score": session.score,
        "risk_level": risk,
        "next_best_action": action,
        "preliminary_advice": advice or body,
        "contact": {"full_name": session.full_name, "phone": session.phone},
    }


def get_report(db: Session, session_id: int) -> dict[str, Any]:
    session = db.query(FunnelSession).filter(FunnelSession.id == session_id).one_or_none()
    if not session:
        raise ValueError("Không tìm thấy phiên")
    if session.status != "completed" or not session.result_snapshot_json:
        raise ValueError("Phiên chưa hoàn tất")

    data = json.loads(session.result_snapshot_json)
    data["session_id"] = session.id
    data["funnel_id"] = session.funnel_id
    return data


def admin_graph_payload(funnel: Funnel) -> dict[str, Any]:
    cfg = _parse_config(funnel)
    nodes = sorted(funnel.nodes, key=lambda n: n.display_order)
    out_nodes = []
    for n in nodes:
        out_nodes.append(
            {
                "key": n.node_key,
                "kind": n.kind,
                "title": n.title,
                "body": n.body or "",
                "display_order": n.display_order,
                "lead_next_node_key": n.lead_next_node_key,
                "choices": [
                    {
                        "label": c.label,
                        "value": c.value,
                        "next_node_key": c.next_node_key,
                        "score_delta": c.score_delta,
                        "insight_after": c.insight_after,
                        "display_order": c.display_order,
                    }
                    for c in sorted(n.choices, key=lambda x: x.display_order)
                ],
            }
        )
    return {
        "id": funnel.id,
        "name": funnel.name,
        "slug": funnel.slug,
        "is_published": funnel.is_published,
        "start_node_key": funnel.start_node_key,
        "config": cfg,
        "nodes": out_nodes,
    }


def replace_funnel_graph(db: Session, funnel: Funnel, payload: dict[str, Any]) -> None:
    funnel.name = payload.get("name", funnel.name)
    funnel.slug = payload.get("slug", funnel.slug)
    funnel.is_published = bool(payload.get("is_published", funnel.is_published))
    funnel.start_node_key = payload.get("start_node_key", funnel.start_node_key)
    funnel.config_json = json.dumps(payload.get("config") or _parse_config(funnel), ensure_ascii=False)

    for node in list(funnel.nodes):
        db.delete(node)
    db.flush()

    for idx, n in enumerate(payload.get("nodes") or []):
        node = FunnelNode(
            funnel_id=funnel.id,
            node_key=n["key"],
            kind=n["kind"],
            title=n.get("title", ""),
            body=n.get("body", ""),
            display_order=int(n.get("display_order", idx)),
            lead_next_node_key=n.get("lead_next_node_key"),
        )
        db.add(node)
        db.flush()
        for cidx, c in enumerate(n.get("choices") or []):
            db.add(
                FunnelChoice(
                    node_id=node.id,
                    label=c["label"],
                    value=c["value"],
                    next_node_key=c["next_node_key"],
                    score_delta=int(c.get("score_delta", 0)),
                    insight_after=c.get("insight_after"),
                    display_order=int(c.get("display_order", cidx)),
                )
            )

    db.commit()
    db.refresh(funnel)


def public_manifest(funnel: Funnel) -> dict[str, Any]:
    nodes = sorted(funnel.nodes, key=lambda n: n.display_order)
    return {
        "slug": funnel.slug,
        "name": funnel.name,
        "start_node_key": funnel.start_node_key,
        "nodes": [node_public_dict(n) for n in nodes],
    }
