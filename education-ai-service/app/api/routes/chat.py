"""
DMKLab AI Service - API Routes
Tương đương AiController.java: /api/v1/ai/*
"""
import uuid
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import ChatMessage
from app.models.schemas import (
    ChatRequest, ChatResponse, MessageFeedbackRequest,
    MessageItem, ApiResponse,
)
from app.services.ai_service import AiService

logger = logging.getLogger("ai_routes")
router = APIRouter(prefix="/api/v1/ai", tags=["AI Chatbots"])

# Dependency injection: AiService (redis được inject từ app state)
def get_ai_service(request) -> AiService:
    return request.app.state.ai_service


GUEST_USER_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")
ADMIN_USER_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")


def _extract_user_id(x_user_id: str | None) -> uuid.UUID:
    """
    Lấy userId từ header X-User-Id (được Java backend inject sau khi verify JWT).
    Fallback sang guest UUID nếu không có.
    """
    if x_user_id:
        try:
            return uuid.UUID(x_user_id)
        except ValueError:
            pass
    return GUEST_USER_ID


# ================================================================
# POST /api/v1/ai/learning/chat
# ================================================================
@router.post("/learning/chat", response_model=ApiResponse)
async def learning_chat(
    req: ChatRequest,
    request=None,
    x_user_id: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
    ai_service: AiService = Depends(get_ai_service),
):
    """
    Chatbot học tập Socratic dành cho học sinh (Có kiểm soát quota & ngữ cảnh)
    """
    user_id = _extract_user_id(x_user_id)
    try:
        result = await ai_service.process_learning_chat(user_id, req, db)
        return ApiResponse.ok(result)
    except ValueError as ex:
        raise HTTPException(status_code=429, detail=str(ex))
    except Exception as ex:
        logger.error("[LEARNING_CHAT_ERROR] %s", ex, exc_info=True)
        raise HTTPException(status_code=500, detail="Lỗi xử lý AI, vui lòng thử lại.")


# ================================================================
# POST /api/v1/ai/admin/chat
# ================================================================
@router.post("/admin/chat", response_model=ApiResponse)
async def admin_chat(
    req: ChatRequest,
    x_user_id: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
    ai_service: AiService = Depends(get_ai_service),
):
    """
    Chatbot hướng dẫn nghiệp vụ dành cho Quản trị viên & Giáo viên
    """
    user_id = _extract_user_id(x_user_id) or ADMIN_USER_ID
    result = await ai_service.process_admin_chat(user_id, req, db)
    return ApiResponse.ok(result)


# ================================================================
# GET /api/v1/ai/sessions/{sessionId}/history
# ================================================================
@router.get("/sessions/{session_id}/history", response_model=ApiResponse)
async def get_history(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    ai_service: AiService = Depends(get_ai_service),
):
    """Lấy lịch sử tin nhắn của một phiên hội thoại AI"""
    messages: List[ChatMessage] = await ai_service.get_session_history(session_id, db)
    items = [
        MessageItem(
            id=m.id,
            sender_role=m.sender_role,
            content=m.content,
            created_at=m.created_at,
        )
        for m in messages
    ]
    return ApiResponse.ok(items)


# ================================================================
# POST /api/v1/ai/messages/{messageId}/feedback
# ================================================================
@router.post("/messages/{message_id}/feedback", response_model=ApiResponse)
async def submit_feedback(
    message_id: uuid.UUID,
    req: MessageFeedbackRequest,
    db: AsyncSession = Depends(get_db),
    ai_service: AiService = Depends(get_ai_service),
):
    """Đánh giá chất lượng câu trả lời của AI (RLHF Feedback thu thập dữ liệu huấn luyện)"""
    ok = await ai_service.record_message_feedback(message_id, req.rating, req.comment, db)
    return ApiResponse.ok(ok)


# ================================================================
# GET /api/v1/ai/health
# ================================================================
@router.get("/health")
async def health():
    return {"status": "ok", "service": "DMKLab AI Service (Python)"}
