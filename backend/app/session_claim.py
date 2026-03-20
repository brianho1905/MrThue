from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .models import FunnelSession


def claim_funnel_session(db: Session, session_id: int, user_id: int) -> FunnelSession:
    session = db.query(FunnelSession).filter(FunnelSession.id == session_id).one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Phiên tư vấn không tồn tại")
    if session.user_id is None:
        session.user_id = user_id
    elif session.user_id != user_id:
        raise HTTPException(status_code=403, detail="Phiên đã gắn với tài khoản khác")
    db.commit()
    db.refresh(session)
    return session
