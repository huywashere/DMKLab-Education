"""
DMKLab AI Service - JWT Auth Middleware
Verify JWT token giống Java backend (HMAC-SHA512, same secret)
"""
import logging
import uuid
from typing import Optional

from fastapi import HTTPException, Security, Header
from jose import JWTError, jwt

from app.core.config import settings

logger = logging.getLogger("auth")

ALGORITHM = "HS512"  # Phải khớp với Java JwtTokenProvider (HMAC-SHA512)
GUEST_USER_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")


def get_user_id_from_token(authorization: Optional[str] = Header(default=None)) -> uuid.UUID:
    """
    FastAPI dependency: trích xuất userId từ Bearer JWT token.
    Verify bằng cùng secret với Java backend.
    Nếu không có token → trả về GUEST UUID (cho môi trường dev).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return GUEST_USER_ID

    token = authorization[len("Bearer "):]
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},
        )
        subject = payload.get("sub")
        if subject:
            return uuid.UUID(str(subject))
    except JWTError as ex:
        logger.warning("[AUTH] JWT invalid: %s", ex)
        raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn.")
    except Exception as ex:
        logger.warning("[AUTH] JWT parse error: %s", ex)

    return GUEST_USER_ID


def require_user_id(authorization: Optional[str] = Header(default=None)) -> uuid.UUID:
    """
    Strict version: bắt buộc phải có JWT hợp lệ, từ chối GUEST.
    """
    user_id = get_user_id_from_token(authorization)
    if user_id == GUEST_USER_ID:
        raise HTTPException(status_code=401, detail="Yêu cầu đăng nhập để sử dụng AI Tutor.")
    return user_id
