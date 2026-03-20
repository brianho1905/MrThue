from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_admin
from ..funnel_service import admin_graph_payload, replace_funnel_graph
from ..models import Funnel
from ..schemas import AdminFunnelCreate, AdminFunnelGraph, AdminFunnelSummary

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/funnels", response_model=list[AdminFunnelSummary])
def list_funnels(db: Session = Depends(get_db)) -> list[AdminFunnelSummary]:
    rows = db.query(Funnel).order_by(Funnel.id.desc()).all()
    return [
        AdminFunnelSummary(
            id=f.id,
            name=f.name,
            slug=f.slug,
            is_published=f.is_published,
            start_node_key=f.start_node_key,
            updated_at=f.updated_at.isoformat() if f.updated_at else None,
        )
        for f in rows
    ]


@router.post("/funnels", response_model=AdminFunnelSummary)
def create_funnel(payload: AdminFunnelCreate, db: Session = Depends(get_db)) -> AdminFunnelSummary:
    exists = db.query(Funnel).filter(Funnel.slug == payload.slug).one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail="Slug đã tồn tại")

    funnel = Funnel(
        name=payload.name,
        slug=payload.slug,
        is_published=payload.is_published,
        start_node_key=payload.start_node_key,
        config_json="{}",
    )
    db.add(funnel)
    db.commit()
    db.refresh(funnel)

    graph = {
        "name": payload.name,
        "slug": payload.slug,
        "is_published": payload.is_published,
        "start_node_key": payload.start_node_key,
        "config": payload.config,
        "nodes": payload.nodes,
    }
    replace_funnel_graph(db, funnel, graph)
    db.refresh(funnel)
    return AdminFunnelSummary(
        id=funnel.id,
        name=funnel.name,
        slug=funnel.slug,
        is_published=funnel.is_published,
        start_node_key=funnel.start_node_key,
        updated_at=funnel.updated_at.isoformat() if funnel.updated_at else None,
    )


@router.get("/funnels/{funnel_id}/graph", response_model=AdminFunnelGraph)
def get_graph(funnel_id: int, db: Session = Depends(get_db)) -> AdminFunnelGraph:
    funnel = db.query(Funnel).filter(Funnel.id == funnel_id).one_or_none()
    if not funnel:
        raise HTTPException(status_code=404, detail="Không tìm thấy funnel")
    data = admin_graph_payload(funnel)
    return AdminFunnelGraph(
        name=data["name"],
        slug=data["slug"],
        is_published=data["is_published"],
        start_node_key=data["start_node_key"],
        config=data["config"],
        nodes=data["nodes"],
    )


@router.put("/funnels/{funnel_id}/graph", response_model=AdminFunnelGraph)
def put_graph(funnel_id: int, payload: AdminFunnelGraph, db: Session = Depends(get_db)) -> AdminFunnelGraph:
    funnel = db.query(Funnel).filter(Funnel.id == funnel_id).one_or_none()
    if not funnel:
        raise HTTPException(status_code=404, detail="Không tìm thấy funnel")

    other = db.query(Funnel).filter(Funnel.slug == payload.slug, Funnel.id != funnel_id).one_or_none()
    if other:
        raise HTTPException(status_code=400, detail="Slug đã được funnel khác sử dụng")

    replace_funnel_graph(
        db,
        funnel,
        {
            "name": payload.name,
            "slug": payload.slug,
            "is_published": payload.is_published,
            "start_node_key": payload.start_node_key,
            "config": payload.config,
            "nodes": payload.nodes,
        },
    )
    db.refresh(funnel)
    data = admin_graph_payload(funnel)
    return AdminFunnelGraph(
        name=data["name"],
        slug=data["slug"],
        is_published=data["is_published"],
        start_node_key=data["start_node_key"],
        config=data["config"],
        nodes=data["nodes"],
    )
