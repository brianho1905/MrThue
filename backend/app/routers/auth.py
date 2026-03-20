from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth_utils import create_access_token, hash_password, verify_password
from ..database import get_db
from ..deps_auth import get_current_user
from ..models import FunnelSession, User
from ..schemas import (
    ConsultationSummary,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    TokenResponse,
    UserPublic,
)
from ..session_claim import claim_funnel_session

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _to_user_public(u: User) -> UserPublic:
    return UserPublic(
        id=u.id,
        email=u.email,  # type: ignore[arg-type]
        full_name=u.full_name,
        phone=u.phone,
        plan_tier=u.plan_tier,
    )


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    exists = db.query(User).filter(User.email == str(payload.email).lower().strip()).one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")

    phone_norm = (payload.phone or "").strip() or None
    if phone_norm:
        p_taken = db.query(User).filter(User.phone == phone_norm).one_or_none()
        if p_taken:
            raise HTTPException(status_code=400, detail="Số điện thoại đã được dùng cho tài khoản khác")

    user = User(
        email=str(payload.email).lower().strip(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        phone=phone_norm,
        plan_tier="free",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if payload.funnel_session_id is not None:
        s = db.query(FunnelSession).filter(FunnelSession.id == payload.funnel_session_id).one_or_none()
        if s is not None and s.user_id is None:
            s.user_id = user.id
            db.commit()

    token = create_access_token(subject_user_id=user.id)
    return TokenResponse(access_token=token, user=_to_user_public(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = str(payload.email).lower().strip()
    user = db.query(User).filter(User.email == email, User.is_active.is_(True)).one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

    token = create_access_token(subject_user_id=user.id)
    return TokenResponse(access_token=token, user=_to_user_public(user))


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)) -> UserPublic:
    return _to_user_public(user)


@router.post("/sessions/{session_id}/claim", response_model=MessageResponse)
def claim_session(session_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MessageResponse:
    claim_funnel_session(db, session_id, user.id)
    return MessageResponse(message="Đã gắn phiên tư vấn vào tài khoản của bạn.")


@router.get("/consultations", response_model=list[ConsultationSummary])
def list_consultations(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ConsultationSummary]:
    rows = (
        db.query(FunnelSession)
        .filter(FunnelSession.user_id == user.id)
        .order_by(FunnelSession.created_at.desc())
        .all()
    )
    out: list[ConsultationSummary] = []
    for s in rows:
        title = None
        compliance = s.score
        if s.result_snapshot_json:
            try:
                data = json.loads(s.result_snapshot_json)
                title = data.get("title")
                if data.get("compliance_score") is not None:
                    compliance = int(data["compliance_score"])
            except (json.JSONDecodeError, TypeError, ValueError):
                pass
        out.append(
            ConsultationSummary(
                session_id=s.id,
                funnel_id=s.funnel_id,
                status=s.status,
                score=s.score,
                report_title=title,
                compliance_score=compliance,
                created_at=s.created_at.isoformat() if s.created_at else None,
            )
        )
    return out
