from __future__ import annotations

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .auth_utils import decode_token
from .database import get_db
from .models import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_optional_user_id(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> int | None:
    if not creds or creds.scheme.lower() != "bearer":
        return None
    payload = decode_token(creds.credentials)
    if not payload or "sub" not in payload:
        return None
    try:
        return int(payload["sub"])
    except (TypeError, ValueError):
        return None


def get_current_user(
    user_id: int | None = Depends(get_optional_user_id),
    db: Session = Depends(get_db),
) -> User:
    if user_id is None:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập hoặc token không hợp lệ")
    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Người dùng không tồn tại")
    return user
