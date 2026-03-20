from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps_auth import get_optional_user_id
from ..funnel_service import get_report, public_manifest, start_session, submit_answer, submit_lead
from ..models import Funnel, FunnelSession, User
from ..schemas import (
    AnswerRequest,
    AnswerResponse,
    FunnelChoicePublic,
    FunnelManifestResponse,
    FunnelNodePublic,
    LeadRequest,
    ReportResponse,
    StartSessionResponse,
)

router = APIRouter(prefix="/api/public/funnels", tags=["public"])


def _get_published_funnel(db: Session, slug: str) -> Funnel:
    funnel = db.query(Funnel).filter(Funnel.slug == slug, Funnel.is_published.is_(True)).one_or_none()
    if not funnel:
        raise HTTPException(status_code=404, detail="Funnel không tồn tại hoặc chưa publish")
    return funnel


def _to_node_public(node: dict) -> FunnelNodePublic:
    return FunnelNodePublic(
        key=node["key"],
        kind=node["kind"],
        title=node["title"],
        body=node["body"],
        choices=[FunnelChoicePublic(**c) for c in node["choices"]],
    )


@router.get("/{slug}/manifest", response_model=FunnelManifestResponse)
def get_manifest(slug: str, db: Session = Depends(get_db)) -> FunnelManifestResponse:
    funnel = _get_published_funnel(db, slug)
    data = public_manifest(funnel)
    nodes = [_to_node_public(n) for n in data["nodes"]]
    return FunnelManifestResponse(
        slug=data["slug"],
        name=data["name"],
        start_node_key=data["start_node_key"],
        nodes=nodes,
    )


@router.post("/{slug}/sessions", response_model=StartSessionResponse)
def create_session(
    slug: str,
    db: Session = Depends(get_db),
    user_id: int | None = Depends(get_optional_user_id),
) -> StartSessionResponse:
    funnel = _get_published_funnel(db, slug)
    resolved_user_id = user_id
    if resolved_user_id is not None:
        user = db.query(User).filter(User.id == resolved_user_id, User.is_active.is_(True)).one_or_none()
        if user is None:
            resolved_user_id = None
    try:
        session, node = start_session(db, funnel, user_id=resolved_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return StartSessionResponse(session_id=session.id, node=_to_node_public(node), score=session.score)


@router.post("/sessions/{session_id}/answer", response_model=AnswerResponse)
def answer_step(session_id: int, payload: AnswerRequest, db: Session = Depends(get_db)) -> AnswerResponse:
    session = db.query(FunnelSession).filter(FunnelSession.id == session_id).one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Phiên không tồn tại")
    try:
        data = submit_answer(db, session, payload.choice_value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return AnswerResponse(
        session_id=data["session_id"],
        score=data["score"],
        insight_after=data.get("insight_after"),
        completed=data["completed"],
        node=_to_node_public(data["node"]),
        result=data.get("result"),
    )


@router.post("/sessions/{session_id}/lead", response_model=AnswerResponse)
def lead_step(session_id: int, payload: LeadRequest, db: Session = Depends(get_db)) -> AnswerResponse:
    session = db.query(FunnelSession).filter(FunnelSession.id == session_id).one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Phiên không tồn tại")
    try:
        data = submit_lead(db, session, payload.full_name, payload.phone)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return AnswerResponse(
        session_id=data["session_id"],
        score=data["score"],
        insight_after=None,
        completed=data["completed"],
        node=_to_node_public(data["node"]),
        result=data.get("result"),
    )


@router.get("/sessions/{session_id}/report", response_model=ReportResponse)
def report(session_id: int, db: Session = Depends(get_db)) -> ReportResponse:
    try:
        data = get_report(db, session_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ReportResponse(**data)
