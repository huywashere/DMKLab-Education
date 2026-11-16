"""
DMKLab AI Service - Pydantic Schemas (request/response)
Tương đương với AiChatDto.java
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ============ Request Models ============

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[UUID] = None
    lesson_id: Optional[UUID] = None
    context_lesson_title: Optional[str] = None
    context_subject: Optional[str] = None
    custom_knowledge: Optional[str] = None  # In-Context Grounding (tài liệu bài học tải lên)
    mode: Optional[str] = "SOCRATIC"        # SOCRATIC | GRADE_ADAPTED | PRACTICE | ERROR_DIAGNOSIS | CITE_LESSON
    grade_level: Optional[int] = 5          # 1-12
    student_answer: Optional[str] = None    # Cho ERROR_DIAGNOSIS mode


class MessageFeedbackRequest(BaseModel):
    rating: str  # HELPFUL | UNHELPFUL
    comment: Optional[str] = None


# ============ Response Models ============

class InteractiveQuizDto(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    points: int = 10


class CitationDto(BaseModel):
    title: str
    chapter: Optional[str] = None
    source_book: Optional[str] = None
    video_time: Optional[str] = None
    target_url: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: UUID
    message_id: UUID
    reply: str
    is_socratic_hint: bool = True
    daily_quota_remaining: int
    timestamp: datetime
    mode: str
    grade_level: int
    step_by_step_hints: List[str] = []
    interactive_quiz: Optional[InteractiveQuizDto] = None
    citations: List[CitationDto] = []
    misconception_reason: Optional[str] = None
    safety_warning: Optional[str] = None
    quick_replies: List[str] = []


class MessageItem(BaseModel):
    id: UUID
    sender_role: str
    content: str
    created_at: datetime


class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[object] = None
    message: Optional[str] = None

    @classmethod
    def ok(cls, data):
        return cls(success=True, data=data)

    @classmethod
    def error(cls, msg: str):
        return cls(success=False, message=msg)
