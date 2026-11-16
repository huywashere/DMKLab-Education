"""
DMKLab AI Service - API Routes (Full standalone - không cần Java proxy)
Frontend gọi thẳng Python service (port 8000)
JWT được verify trực tiếp tại Python service
"""
import uuid
import json
import asyncio
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from starlette.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import ChatMessage
from app.models.schemas import (
    ChatRequest, ChatResponse, MessageFeedbackRequest,
    MessageItem, ApiResponse,
)
from app.services.ai_service import AiService
from app.core.auth import get_user_id_from_token, require_user_id

logger = logging.getLogger("ai_routes")
router = APIRouter(prefix="/api/v1/ai", tags=["AI Chatbots"])


def get_ai_service(request: Request) -> AiService:
    return request.app.state.ai_service


# ================================================================
# POST /api/v1/ai/learning/chat
# ================================================================
@router.post("/learning/chat", response_model=ApiResponse, response_model_by_alias=True)
async def learning_chat(
    req: ChatRequest,
    request: Request,
    user_id: uuid.UUID = Depends(get_user_id_from_token),
    db: AsyncSession = Depends(get_db),
    ai_service: AiService = Depends(get_ai_service),
):
    """
    Chatbot học tập Socratic dành cho học sinh
    Auth: Bearer JWT (same secret as Java backend)
    """
    try:
        result = await ai_service.process_learning_chat(user_id, req, db)
        return ApiResponse.ok(result)
    except ValueError as ex:
        raise HTTPException(status_code=429, detail=str(ex))
    except Exception as ex:
        logger.error("[LEARNING_CHAT_ERROR] %s", ex, exc_info=True)
        raise HTTPException(status_code=500, detail="Lỗi xử lý AI, vui lòng thử lại.")


# ================================================================
# GET / POST /api/v1/ai/learning/chat/stream (SSE Streaming)
# ================================================================
@router.get("/learning/chat/stream")
@router.post("/learning/chat/stream")
async def stream_learning_chat(
    request: Request,
    message: Optional[str] = Query(default=None),
    lesson_title: Optional[str] = Query(default=None, alias="lessonTitle"),
    subject: Optional[str] = Query(default=None),
    grade_level: int = Query(default=5, alias="gradeLevel"),
    session_id: Optional[uuid.UUID] = Query(default=None, alias="sessionId"),
    user_id: uuid.UUID = Depends(get_user_id_from_token),
    db: AsyncSession = Depends(get_db),
    ai_service: AiService = Depends(get_ai_service),
):
    """
    Streaming Socratic AI Response qua Server-Sent Events (SSE)
    """
    # Nếu là POST request và có JSON body
    if request.method == "POST":
        try:
            body = await request.json()
            message = body.get("message") or message
            lesson_title = body.get("contextLessonTitle") or body.get("lessonTitle") or lesson_title
            subject = body.get("contextSubject") or body.get("subject") or subject
            grade_level = body.get("gradeLevel", grade_level)
            sid_raw = body.get("sessionId")
            if sid_raw:
                try:
                    session_id = uuid.UUID(str(sid_raw))
                except ValueError:
                    pass
        except Exception:
            pass

    if not message:
        raise HTTPException(status_code=400, detail="Thiếu nội dung câu hỏi (message)")

    req = ChatRequest(
        message=message,
        sessionId=session_id,
        contextLessonTitle=lesson_title,
        contextSubject=subject,
        gradeLevel=grade_level,
    )

    async def event_generator():
        try:
            resp = await ai_service.process_learning_chat(user_id, req, db)
            full_text = resp.reply or ""
            words = full_text.split(" ")
            for i, word in enumerate(words):
                piece = word + (" " if i < len(words) - 1 else "")
                yield f"event: token\ndata: {piece}\n\n"
                await asyncio.sleep(0.02)  # 20ms typing effect

            done_payload = json.dumps(resp.model_dump(by_alias=True), ensure_ascii=False)
            yield f"event: done\ndata: {done_payload}\n\n"
        except Exception as ex:
            logger.error("[STREAM_ERROR] %s", ex, exc_info=True)
            yield f"event: error\ndata: {str(ex)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ================================================================
# POST /api/v1/ai/admin/chat
# ================================================================
@router.post("/admin/chat", response_model=ApiResponse, response_model_by_alias=True)
async def admin_chat(
    req: ChatRequest,
    user_id: uuid.UUID = Depends(get_user_id_from_token),
    db: AsyncSession = Depends(get_db),
    ai_service: AiService = Depends(get_ai_service),
):
    """Chatbot hướng dẫn nghiệp vụ dành cho Quản trị viên & Giáo viên"""
    result = await ai_service.process_admin_chat(user_id, req, db)
    return ApiResponse.ok(result)


# ================================================================
# GET /api/v1/ai/sessions/{sessionId}/history
# ================================================================
@router.get("/sessions/{session_id}/history", response_model=ApiResponse, response_model_by_alias=True)
async def get_history(
    session_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_user_id_from_token),
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
@router.post("/messages/{message_id}/feedback", response_model=ApiResponse, response_model_by_alias=True)
async def submit_feedback(
    message_id: uuid.UUID,
    req: MessageFeedbackRequest,
    db: AsyncSession = Depends(get_db),
    ai_service: AiService = Depends(get_ai_service),
):
    """Đánh giá chất lượng câu trả lời của AI (RLHF Feedback)"""
    ok = await ai_service.record_message_feedback(message_id, req.rating, req.comment, db)
    return ApiResponse.ok(ok)


# ================================================================
# GET /api/v1/ai/health
# ================================================================
@router.get("/health")
async def health():
    return {"status": "ok", "service": "DMKLab AI Service (Python/FastAPI)", "version": "2.0.0"}
