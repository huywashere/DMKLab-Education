"""
DMKLab AI Service - Core AI Service
Tương đương AiService.java: multi-tier fallback, quota check, Redis cache,
Socratic pedagogy, 5 tutor modes, PII protection, multi-turn memory.
"""
import hashlib
import logging
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from dataclasses import dataclass, field

import httpx
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import ChatSession, ChatMessage
from app.models.schemas import (
    ChatRequest, ChatResponse,
    InteractiveQuizDto, CitationDto,
)
from app.services.knowledge_crawler import KnowledgeCrawlerService, KnowledgeCrawlResult

logger = logging.getLogger("ai_service")

# ===== PII & Safety Patterns =====
PHONE_RE = re.compile(r"(\+84|0)(3|5|7|8|9)[0-9]{8}")
ID_CARD_RE = re.compile(r"\b[0-9]{9,12}\b")
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
INJECTION_RE = re.compile(
    r"(?i)(ignore previous instructions|bỏ qua hướng dẫn|bỏ qua quy tắc"
    r"|jailbreak|DAN mode|system prompt|hack hệ thống"
    r"|đưa luôn đáp án không cần giải thích|bypass filter)"
)

# ===== Off-topic keywords =====
OFF_TOPIC_RE = re.compile(
    r"(?i)(game|youtube|tiktok|facebook|instagram|zalo|chơi|giải trí"
    r"|phim|nhạc|ca sĩ|diễn viên|bóng đá|thể thao|nấu ăn|nói chuyện riêng)"
)


@dataclass
class TutorOutput:
    reply: str = ""
    step_by_step_hints: list = field(default_factory=list)
    interactive_quiz: Optional[InteractiveQuizDto] = None
    citations: list = field(default_factory=list)
    misconception_reason: Optional[str] = None
    quick_replies: list = field(default_factory=list)


class AiService:
    """
    Core AI Service - Python rewrite of AiService.java
    Fallback chain: Gemini → Groq → OpenAI → Offline Socratic rules
    """

    def __init__(self, redis=None):
        self.redis = redis
        self._http = httpx.AsyncClient(timeout=15.0)
        self.crawler = KnowledgeCrawlerService()

    # =========================================================
    # PUBLIC: processLearningChat
    # =========================================================
    async def process_learning_chat(
        self,
        user_id: uuid.UUID,
        req: ChatRequest,
        db: AsyncSession,
    ) -> ChatResponse:
        # 1. Quota check
        start_of_day = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        used_today = await self._count_user_messages_since(db, user_id, start_of_day)
        if used_today >= settings.student_daily_quota:
            raise ValueError(
                f"Bạn đã dùng hết hạn mức {settings.student_daily_quota} câu hỏi "
                f"trợ lý AI trong ngày. Hạn mức sẽ tự động đặt lại vào ngày mai!"
            )

        # 2. PII + safety check
        raw_message = (req.message or "").strip()
        safety_warning = self._detect_pii_and_harmful(raw_message)

        # 3. Session management
        session = await self._get_or_create_session(db, user_id, req)

        # 4. Save user message
        user_msg = ChatMessage(
            id=uuid.uuid4(),
            session_id=session.id,
            sender_role="USER",
            content=raw_message,
            tokens_used=len(raw_message) // 4,
        )
        db.add(user_msg)
        await db.flush()

        # 5. Resolve lesson knowledge (nếu có lesson_id)
        effective_knowledge = req.custom_knowledge
        lesson_title = req.context_lesson_title
        subject = req.context_subject

        if req.lesson_id:
            try:
                res = await db.execute(
                    text("SELECT l.title, l.description, s.name FROM lessons l LEFT JOIN subjects s ON l.subject_id = s.id WHERE l.id = :lid"),
                    {"lid": str(req.lesson_id)}
                )
                row = res.fetchone()
                if row:
                    ltitle, ldesc, sname = row
                    if not lesson_title and ltitle:
                        lesson_title = ltitle
                    if not subject and sname:
                        subject = sname
                    if ldesc:
                        lesson_desc = f"Tài liệu bài học '{ltitle}': {ldesc}"
                        effective_knowledge = (
                            f"{effective_knowledge}\n\n{lesson_desc}" if effective_knowledge else lesson_desc
                        )
            except Exception as ex:
                logger.warning("[AI_LESSON_RESOLVE_WARN] Không thể nạp bài học %s: %s", req.lesson_id, ex)

        # 6. Determine mode & grade
        mode = (req.mode or "SOCRATIC").upper()
        grade_level = req.grade_level or 5
        context_title = lesson_title or "Toán học K-12"
        subj = subject or "Toán học"

        # 7. Crawl tri thức hệ thống & Rào cản bảo vệ chủ đề (System Crawler & Topic Guardrail)
        crawl_result = self.crawler.crawl_and_ground_knowledge(
            raw_message, grade_level, subj, context_title, effective_knowledge
        )

        # Xử lý rào cản bảo vệ chủ đề nếu câu hỏi bị xác định là lạc đề / phi học thuật
        if not crawl_result.on_topic and crawl_result.off_topic_redirect_advice:
            out = TutorOutput()
            out.reply = crawl_result.off_topic_redirect_advice
            out.misconception_reason = "OFF_TOPIC_REDIRECT"
            out.quick_replies = [
                f"📖 Trở lại bài học: {context_title}",
                "💡 Cho em xem công thức SGK trọng tâm",
                "📝 Thử một câu hỏi luyện tập",
                "✨ Em đã sẵn sàng tiếp tục!",
            ]
            out.step_by_step_hints = [
                f"Bước 1: Tập trung vào mục tiêu bài học: {context_title}",
                "Bước 2: Xem lại các định nghĩa và công thức cơ bản trong SGK.",
                "Bước 3: Đặt câu hỏi cho thầy/cô về phần em chưa hiểu trong bài nhé.",
            ]
            out.citations = crawl_result.citations if crawl_result.citations else self._standard_citations(grade_level, context_title)
            return await self._build_response(db, session, out, mode, grade_level, used_today, safety_warning)

        # 8. Retrieve multi-turn history (tối đa 6 tin nhắn gần nhất)
        recent_history = await self._get_recent_history(db, session.id, limit=7)

        # 9. Build Socratic system prompt (với In-Context Grounding từ SGK)
        grounded_knowledge = crawl_result.grounded_prompt_knowledge or effective_knowledge
        system_prompt = self._build_socratic_system_prompt(
            grade_level, subj, context_title, mode, grounded_knowledge
        )

        # 10. Redis semantic cache check
        cache_key = None
        if not effective_knowledge:
            cache_key = self._build_cache_key(grade_level, mode, subj, context_title, raw_message)
            cached = await self._cache_get(cache_key)
            if cached:
                logger.info("[AI_CACHE_HIT] Redis cache hit cho câu hỏi: %s", raw_message)
                out = TutorOutput(
                    reply=cached,
                    step_by_step_hints=self._standard_hints(context_title),
                    citations=crawl_result.citations if crawl_result.citations else self._standard_citations(grade_level, context_title),
                    quick_replies=self._standard_quick_replies(),
                )
                return await self._build_response(db, session, out, mode, grade_level, used_today, safety_warning)

        # 11. Multi-tier AI fallback
        live_reply = await self._call_with_fallback(
            recent_history, mode, grade_level, raw_message,
            context_title, subj, req.student_answer, grounded_knowledge, system_prompt
        )

        # 12. Build TutorOutput
        out = TutorOutput()
        out.quick_replies = self._standard_quick_replies()
        out.citations = crawl_result.citations if crawl_result.citations else self._standard_citations(grade_level, context_title)

        if live_reply:
            out.reply = live_reply
            out.step_by_step_hints = self._standard_hints(context_title)
            if cache_key:
                await self._cache_set(cache_key, live_reply, ttl_hours=24)
        else:
            # Offline fallback Socratic rules
            self._apply_offline_fallback(out, mode, grade_level, raw_message, context_title, req.student_answer)

        return await self._build_response(db, session, out, mode, grade_level, used_today, safety_warning)

    # =========================================================
    # PUBLIC: processAdminChat
    # =========================================================
    async def process_admin_chat(
        self,
        user_id: uuid.UUID,
        req: ChatRequest,
        db: AsyncSession,
    ) -> ChatResponse:
        session = await self._get_or_create_typed_session(db, user_id, "ADMIN", "Tra cứu quản trị")
        user_msg = ChatMessage(
            id=uuid.uuid4(), session_id=session.id,
            sender_role="USER", content=req.message or "",
            tokens_used=len(req.message or "") // 4,
        )
        db.add(user_msg)
        await db.flush()

        reply = (
            "Xin chào! Tôi là trợ lý nghiệp vụ của DMKLab Education dành cho Quản trị viên & Giáo viên. "
            "Tôi có thể hỗ trợ bạn quản lý bài học, xem báo cáo học sinh, cài đặt hệ thống và hướng dẫn "
            "sử dụng các tính năng của nền tảng. Bạn cần hỗ trợ gì hôm nay?"
        )

        assistant_msg = ChatMessage(
            id=uuid.uuid4(), session_id=session.id,
            sender_role="ASSISTANT", content=reply,
            tokens_used=len(reply) // 4,
        )
        db.add(assistant_msg)
        await db.commit()

        return ChatResponse(
            session_id=session.id,
            message_id=assistant_msg.id,
            reply=reply,
            is_socratic_hint=False,
            daily_quota_remaining=999,
            timestamp=datetime.now(timezone.utc),
            mode="ADMIN",
            grade_level=0,
        )

    # =========================================================
    # PUBLIC: getSessionHistory
    # =========================================================
    async def get_session_history(self, session_id: uuid.UUID, db: AsyncSession):
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
        )
        return result.scalars().all()

    # =========================================================
    # PUBLIC: recordMessageFeedback (RLHF)
    # =========================================================
    async def record_message_feedback(
        self,
        message_id: uuid.UUID,
        rating: str,
        comment: Optional[str],
        db: AsyncSession,
    ) -> bool:
        result = await db.execute(
            select(ChatMessage).where(ChatMessage.id == message_id)
        )
        msg = result.scalar_one_or_none()
        if not msg:
            return False
        msg.feedback_rating = rating
        msg.feedback_comment = comment
        await db.commit()
        logger.info("[AI_RLHF_FEEDBACK] Đã ghi nhận phản hồi %s cho tin nhắn %s", rating, message_id)
        return True

    # =========================================================
    # PRIVATE: AI fallback chain
    # =========================================================
    async def _call_with_fallback(
        self, history, mode, grade_level, message, context, subject,
        student_answer, custom_knowledge, system_prompt
    ) -> Optional[str]:
        """
        Fallback chain: Gemini → Groq → OpenAI
        Provider ưu tiên theo AI_PROVIDER env var
        """
        provider = settings.ai_provider.lower()
        reply = None

        if provider == "groq" or (settings.groq_api_key and settings.groq_api_key.startswith("gsk_")):
            reply = await self._call_groq(history, system_prompt, message, student_answer)

        if reply is None and provider == "openai":
            reply = await self._call_openai(history, system_prompt, message, student_answer)
            if reply is None:
                reply = await self._call_gemini(history, system_prompt, message, student_answer)
        elif reply is None:
            # Mặc định: Gemini → Groq → OpenAI
            reply = await self._call_gemini(history, system_prompt, message, student_answer)
            if reply is None:
                reply = await self._call_groq(history, system_prompt, message, student_answer)
            if reply is None:
                reply = await self._call_openai(history, system_prompt, message, student_answer)

        return reply

    async def _call_gemini(self, history, system_prompt, message, student_answer=None) -> Optional[str]:
        if not settings.gemini_api_key or settings.gemini_api_key in ("", "mock-key"):
            return None
        try:
            user_prompt = message
            if student_answer:
                user_prompt += f" (Câu trả lời học sinh đã chọn: {student_answer})"

            model = settings.gemini_model or "gemini-2.5-flash"
            endpoint = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={settings.gemini_api_key}"
            )

            contents = []
            for m in (history or []):
                role = "user" if m.sender_role == "USER" else "model"
                if m.content:
                    contents.append({"role": role, "parts": [{"text": m.content}]})
            contents.append({"role": "user", "parts": [{"text": user_prompt}]})

            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": contents,
                "generationConfig": {"temperature": 0.6, "maxOutputTokens": 800},
            }
            resp = await self._http.post(endpoint, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        reply = parts[0].get("text", "").strip()
                        if reply:
                            logger.info("[GEMINI_LIVE_OK] Phản hồi thành công từ Gemini (%s)", model)
                            return reply
            else:
                logger.warning("[GEMINI_WARN] HTTP %s: %s", resp.status_code, resp.text[:200])
        except Exception as ex:
            logger.warning("[GEMINI_FALLBACK] Lỗi Gemini API: %s", ex)
        return None

    async def _call_groq(self, history, system_prompt, message, student_answer=None) -> Optional[str]:
        if not settings.groq_api_key or settings.groq_api_key in ("", "mock-key"):
            return None
        try:
            user_prompt = message
            if student_answer:
                user_prompt += f" (Câu trả lời học sinh đã chọn: {student_answer})"

            base_url = (settings.groq_base_url or "https://api.groq.com/openai/v1").rstrip("/")
            model = settings.groq_model or "llama-3.3-70b-versatile"

            messages = [{"role": "system", "content": system_prompt}]
            for m in (history or []):
                role = "user" if m.sender_role == "USER" else "assistant"
                if m.content:
                    messages.append({"role": role, "content": m.content})
            messages.append({"role": "user", "content": user_prompt})

            payload = {"model": model, "messages": messages, "temperature": 0.6, "max_tokens": 800}
            resp = await self._http.post(
                f"{base_url}/chat/completions",
                json=payload,
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    reply = choices[0].get("message", {}).get("content", "").strip()
                    if reply:
                        logger.info("[GROQ_LIVE_OK] Phản hồi thành công từ Groq (%s)", model)
                        return reply
            else:
                logger.warning("[GROQ_WARN] HTTP %s: %s", resp.status_code, resp.text[:200])
        except Exception as ex:
            logger.warning("[GROQ_FALLBACK] Lỗi Groq API: %s", ex)
        return None

    async def _call_openai(self, history, system_prompt, message, student_answer=None) -> Optional[str]:
        if not settings.openai_api_key or settings.openai_api_key in ("", "mock-key"):
            return None
        try:
            user_prompt = message
            if student_answer:
                user_prompt += f" (Câu trả lời học sinh đã chọn: {student_answer})"

            base_url = (settings.openai_base_url or "https://api.openai.com/v1").rstrip("/")
            model = settings.openai_model or "gpt-4o-mini"

            messages = [{"role": "system", "content": system_prompt}]
            for m in (history or []):
                role = "user" if m.sender_role == "USER" else "assistant"
                if m.content:
                    messages.append({"role": role, "content": m.content})
            messages.append({"role": "user", "content": user_prompt})

            payload = {"model": model, "messages": messages, "temperature": 0.6, "max_tokens": 800}
            resp = await self._http.post(
                f"{base_url}/chat/completions",
                json=payload,
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    reply = choices[0].get("message", {}).get("content", "").strip()
                    if reply:
                        logger.info("[OPENAI_LIVE_OK] Phản hồi thành công từ OpenAI (%s)", model)
                        return reply
            else:
                logger.warning("[OPENAI_WARN] HTTP %s: %s", resp.status_code, resp.text[:200])
        except Exception as ex:
            logger.warning("[OPENAI_FALLBACK] Lỗi OpenAI API: %s", ex)
        return None

    # =========================================================
    # PRIVATE: Socratic System Prompt
    # =========================================================
    def _build_socratic_system_prompt(
        self, grade_level: int, subject: str, context: str, mode: str, custom_knowledge: Optional[str]
    ) -> str:
        if grade_level <= 5:
            persona = (
                "Bạn là thầy/cô giáo tiểu học hiền từ, vui vẻ của DMKLab Education. "
                "Xưng 'thầy/cô' và gọi học sinh là 'con'. "
                "Hãy dùng ví dụ trực quan như cái kẹo, quả táo, que tính, đồng hồ để con dễ hình dung."
            )
        elif grade_level <= 9:
            persona = (
                "Bạn là giáo viên THCS giàu kinh nghiệm của DMKLab Education. "
                "Xưng 'thầy/cô' và gọi học sinh là 'em'. "
                "Dẫn dắt em từng bước logic, khơi gợi tư duy phản biện và liên hệ thực tế."
            )
        else:
            persona = (
                "Bạn là chuyên gia sư phạm THPT của DMKLab Education. "
                "Xưng 'thầy/cô' và gọi học sinh là 'em'. "
                "Dẫn dắt tư duy hệ thống, phân tích bản chất định lý và liên hệ dạng bài thi tốt nghiệp THPT/Đại học."
            )

        prompt = (
            f"{persona}\n\n"
            f"BỐI CẢNH HỌC TẬP: Lớp {grade_level}, Môn: {subject}, Bài học: '{context}', Chế độ: '{mode}'.\n\n"
            "QUY TẮC SƯ PHẠM SOCRATIC KHẮT KHE (KHANMIGO & HARVARD STANDARD):\n"
            "1. TUYỆT ĐỐI KHÔNG giải hộ hay đưa luôn đáp số cuối cùng cho học sinh, ngay cả khi học sinh nài nỉ.\n"
            "2. NGUYÊN TẮC 'MỘT BƯỚC MỖI LẦN' (ONE STEP AT A TIME): Chỉ đặt đúng 01 câu hỏi gợi mở tiếp theo "
            "ở cuối câu trả lời để học sinh tự suy nghĩ và phản hồi, không đặt dồn dập nhiều câu hỏi.\n"
            "3. CHẨN ĐOÁN ĐIỂM NGỘ NHẬN (MISCONCEPTION DIAGNOSIS): Nếu học sinh tính sai hoặc chọn sai đáp án, "
            "đừng chỉ nói 'Sai rồi'. Hãy chỉ ra chính xác điểm em đang nhầm lẫn.\n"
            "4. ĐỊNH DẠNG TOÁN HỌC CHUẨN LATEX (KATEX): Toàn bộ công thức toán, biến số và phân số "
            "PHẢI được bọc trong cặp dấu $...$ (ví dụ: $x^2 - 4 = 0$, $\\frac{1}{2}$, $\\sqrt{3}$) "
            "để giao diện web hiển thị công thức sắc nét.\n"
            "5. KHÍCH LỆ TÍCH CỰC: Luôn ghi nhận nỗ lực suy nghĩ của học sinh trước khi chỉ ra chỗ cần điều chỉnh.\n"
            f"6. QUY TẮC BẢO VỆ CHỦ ĐỀ & TRẢ LỜI ĐÚNG TRỌNG TÂM (TOPIC GUARDRAIL & ZERO-HALLUCINATION):\n"
            f"   - Bạn là Gia sư chuyên trách môn '{subject}' và bài học '{context}'.\n"
            "   - Bám sát 100% tài liệu SGK/giáo trình hệ thống trích xuất bên dưới. "
            "Sử dụng đúng định nghĩa, định lý và công thức LaTeX chuẩn. "
            "Tuyệt đối không bịa đặt kiến thức ngoài chương trình GDPT 2018.\n"
            "   - NẾU HỌC SINH HỎI LẠC ĐỀ (game, giải trí, việc riêng, câu hỏi phi học thuật...): "
            "Tuyệt đối KHÔNG bàn luận lan man theo câu hỏi lạc đề. "
            "Hãy nhẹ nhàng nhắc nhở em quay lại trọng tâm bài học và đặt 01 câu hỏi gợi mở của bài học "
            "để khơi gợi tư duy."
        )

        if custom_knowledge:
            prompt += (
                "\n\n[TÀI LIỆU SGK & DỮ LIỆU CỐT LÕI CRAWL TỰ ĐỘNG TỪ HỆ THỐNG]:\n"
                f"{custom_knowledge.strip()}\n\n"
                "YÊU CẦU HUẤN LUYỆN CHUYÊN BIỆT (IN-CONTEXT GROUNDING):\n"
                "1. Bạn PHẢI bám sát 100% dữ liệu giáo trình và công thức trích xuất ở trên để dẫn dắt học sinh.\n"
                "2. Trích dẫn đúng định nghĩa, định lý và công thức LaTeX chuẩn xác từ tài liệu.\n"
                "3. Tuyệt đối KHÔNG bịa đặt kiến thức ngoài tài liệu bài giảng đã nạp."
            )

        return prompt

    # =========================================================
    # PRIVATE: Offline fallback Socratic rules (5 modes)
    # =========================================================
    def _apply_offline_fallback(
        self, out: TutorOutput, mode: str, grade_level: int, q: str, context: str, student_answer: Optional[str]
    ):
        q_lower = q.lower()
        if mode == "GRADE_ADAPTED":
            self._handle_grade_adapted(out, grade_level, context)
        elif mode == "PRACTICE":
            self._handle_practice(out, grade_level, context)
        elif mode == "ERROR_DIAGNOSIS":
            self._handle_error_diagnosis(out, grade_level, q_lower, student_answer, context)
        elif mode == "CITE_LESSON":
            self._handle_citation(out, grade_level, context)
        else:
            self._handle_socratic(out, grade_level, q_lower, context)

    def _handle_socratic(self, out: TutorOutput, grade_level: int, q: str, context: str):
        if any(kw in q for kw in ["đáp án", "kết quả", "giải hộ", "làm hộ"]):
            out.reply = (
                f"Thầy hiểu em đang rất muốn biết kết quả cuối cùng! "
                f"Nhưng nếu thầy giải hộ ngay, em sẽ bỏ lỡ cơ hội rèn luyện tư duy toán học của chính mình. "
                f"Chúng ta cùng làm từng bước nhé! "
                f"Em hãy đọc lại đề bài và cho thầy biết: Dữ kiện đề bài đã cho là gì và yêu cầu tìm cái gì?"
            )
        elif "quy đồng" in q:
            out.reply = (
                f"Quy đồng mẫu số nghĩa là biến đổi hai hoặc nhiều phân số sao cho chúng có cùng "
                f"một mẫu số chung mà giá trị không đổi. "
                f"Để bắt đầu, em hãy nhìn vào hai mẫu số trong bài của em và thử nhẩm xem: "
                f"Số nhỏ nhất nào chia hết cho cả hai số đó?"
            )
        else:
            out.reply = (
                f"Câu hỏi rất thú vị! Để cùng giải quyết vấn đề trong bài học '{context}', "
                f"theo em khái niệm hoặc công thức nào chúng ta vừa học có thể áp dụng đầu tiên?"
            )
        out.step_by_step_hints = self._standard_hints(context)

    def _handle_grade_adapted(self, out: TutorOutput, grade_level: int, context: str):
        if grade_level <= 5:
            out.reply = (
                f"Chào con! Ở cấp Tiểu học (Lớp {grade_level}), chúng ta cùng hình dung một cách thật trực quan nhé: "
                f"Hãy tưởng tượng con có một chiếc bánh pizza thơm ngon được mẹ chia đều làm 4 phần bằng nhau. "
                f"Nếu con ăn 1 miếng bánh, thì con đã ăn $\\frac{{1}}{{4}}$ chiếc bánh "
                f"(1 là tử số - số miếng con ăn, 4 là mẫu số - tổng số miếng mẹ chia). "
                f"Quy tắc vàng cho học sinh Lớp {grade_level}: Tử số ở trên là phần con lấy, Mẫu số ở dưới là tổng số phần bằng nhau."
            )
            out.step_by_step_hints = [
                "Bước 1: Đếm xem chiếc bánh hoặc đồ vật được chia làm bao nhiêu phần bằng nhau (đây là Mẫu số).",
                "Bước 2: Đếm số phần được lấy ra hoặc tô màu (đây là Tử số).",
                "Bước 3: Viết phân số: Tử số ở trên, dấu gạch ngang ở giữa, Mẫu số ở dưới.",
            ]
        elif grade_level <= 9:
            out.reply = (
                f"Chào bạn! Ở cấp THCS (Lớp {grade_level}), ta tiếp cận kiến thức dưới góc độ đại số và tính chất tổng quát: "
                f"Phân số $\\frac{{a}}{{b}}$ (với $b \\neq 0$) biểu diễn thương của phép chia số nguyên $a$ cho số nguyên $b$. "
                f"Khi quy đồng hoặc cộng trừ phân số, ta cần tìm Bội chung nhỏ nhất (BCNN) của các mẫu số để làm Mẫu số chung."
            )
            out.step_by_step_hints = [
                "Bước 1: Phân tích các mẫu số ra thừa số nguyên tố.",
                "Bước 2: Tìm Mẫu thức chung = BCNN của các mẫu số.",
                "Bước 3: Tìm nhân tử phụ tương ứng cho từng phân số rồi quy đồng.",
            ]
        else:
            out.reply = (
                f"Chào bạn! Ở bậc THPT (Lớp {grade_level}), chúng ta nghiên cứu bài học theo tinh thần bản chất giải tích và đại số hiện đại: "
                f"Khái niệm này mở rộng từ trường số hữu tỉ $\\mathbb{{Q}}$ sang trường số thực $\\mathbb{{R}}$, "
                f"liên quan chặt chẽ đến tính liên tục, hàm phân thức và giới hạn $\\lim$ khi biến số tiến tới vô cực. "
                f"Trong các đề thi tốt nghiệp THPT, dạng bài này thường xuất hiện dưới dạng tìm tiệm cận hoặc bài toán ứng dụng thực tế tối ưu hóa."
            )
            out.step_by_step_hints = [
                "Bước 1: Thiết lập tập xác định (ĐKXĐ: mẫu số khác 0, biểu thức dưới căn ≥ 0).",
                "Bước 2: Áp dụng định lý biến đổi đại số / đạo hàm / giới hạn.",
                "Bước 3: Đối chiếu điều kiện ban đầu để kết luận tập nghiệm chính xác.",
            ]

    def _handle_practice(self, out: TutorOutput, grade_level: int, context: str):
        out.reply = (
            f"Tuyệt vời! Sau khi đã nắm vững lý thuyết về '{context}', "
            f"thầy đã tạo sẵn một câu hỏi luyện tập nhanh dành riêng cho Lớp {grade_level} để em thử sức ngay dưới đây:"
        )
        ts = int(datetime.now().timestamp() * 1000)
        if grade_level <= 5:
            out.interactive_quiz = InteractiveQuizDto(
                id=f"quiz-gen-{ts}",
                question="Một hộp bánh có 12 chiếc bánh. Bạn Nam ăn hết $\\frac{1}{3}$ số bánh trong hộp. Hỏi bạn Nam đã ăn bao nhiêu chiếc bánh?",
                options=["A. 3 chiếc bánh", "B. 4 chiếc bánh", "C. 6 chiếc bánh", "D. 9 chiếc bánh"],
                correct_answer="B. 4 chiếc bánh",
                explanation="Giải thích: Muốn tìm $\\frac{1}{3}$ của 12 chiếc bánh, ta lấy $12 \\div 3 = 4$ (chiếc bánh). Do đó đáp án đúng là B.",
                points=10,
            )
        elif grade_level <= 9:
            out.interactive_quiz = InteractiveQuizDto(
                id=f"quiz-gen-{ts}",
                question="Tìm mẫu số chung nhỏ nhất của hai phân số $\\frac{5}{12}$ và $\\frac{7}{18}$:",
                options=["A. 216", "B. 72", "C. 36", "D. 48"],
                correct_answer="C. 36",
                explanation="Giải thích: $12 = 2^2 \\times 3$; $18 = 2 \\times 3^2$. BCNN$(12, 18) = 2^2 \\times 3^2 = 4 \\times 9 = 36$. Do đó mẫu số chung nhỏ nhất là 36.",
                points=10,
            )
        else:
            out.interactive_quiz = InteractiveQuizDto(
                id=f"quiz-gen-{ts}",
                question="Tập xác định của hàm số $y = \\frac{2x + 1}{x^2 - 4}$ là:",
                options=["A. $D = \\mathbb{R}$", "B. $D = \\mathbb{R} \\setminus \\{2\\}$", "C. $D = \\mathbb{R} \\setminus \\{-2; 2\\}$", "D. $D = (-2; 2)$"],
                correct_answer="C. $D = \\mathbb{R} \\setminus \\{-2; 2\\}$",
                explanation="Giải thích: Hàm phân thức xác định khi mẫu số khác 0: $x^2 - 4 \\neq 0 \\Leftrightarrow x \\neq 2$ và $x \\neq -2$. Vậy $D = \\mathbb{R} \\setminus \\{-2; 2\\}$.",
                points=10,
            )

    def _handle_error_diagnosis(
        self, out: TutorOutput, grade_level: int, q: str, student_answer: Optional[str], context: str
    ):
        ans = student_answer or q
        out.reply = (
            "Thầy đã phân tích câu trả lời của em. Sai lầm trong học tập là cơ hội tuyệt vời nhất để hiểu sâu kiến thức! "
            "Dưới đây là phân tích chi tiết vì sao câu trả lời chưa chính xác:"
        )
        if any(kw in ans for kw in ["+", "mẫu", "5/7"]):
            out.misconception_reason = (
                "Sai lầm phổ biến: Em đã vô tình cộng cả hai mẫu số với nhau "
                "($\\frac{2}{3} + \\frac{3}{4}$ thành $\\frac{2+3}{3+4} = \\frac{5}{7}$). "
                "Nguyên tắc cốt lõi: Mẫu số biểu thị độ lớn của từng phần chia, "
                "không được phép cộng gộp mẫu số! Em bắt buộc phải quy đồng về cùng một mẫu số chung trước khi cộng tử số."
            )
        else:
            out.misconception_reason = (
                "Phân tích bẫy sai sót: Em có thể đã nhầm lẫn giữa phép nhân phân số và phép cộng phân số, "
                "hoặc quên đảo dấu khi chuyển vế. "
                "Hãy nhớ quy tắc: Phép cộng trừ cần mẫu chung, phép nhân thì lấy tử nhân tử, mẫu nhân mẫu."
            )
        out.step_by_step_hints = [
            "Cách khắc phục 1: Luôn viết rõ bước quy đồng mẫu số ra giấy nháp trước.",
            "Cách khắc phục 2: Giữ nguyên mẫu số chung, chỉ thực hiện phép cộng trên tử số.",
            "Cách khắc phục 3: Rút gọn phân số về tối giản sau khi có kết quả.",
        ]

    def _handle_citation(self, out: TutorOutput, grade_level: int, context: str):
        out.reply = (
            f"Dưới đây là các căn cứ tài liệu chính thức theo Chương trình Giáo dục Phổ thông 2018 "
            f"và bài giảng trực tuyến của DMKLab cho chủ đề '{context}':"
        )

    # =========================================================
    # PRIVATE: Helpers
    # =========================================================
    def _detect_pii_and_harmful(self, message: str) -> Optional[str]:
        if PHONE_RE.search(message):
            return "Hệ thống bảo vệ dữ liệu học sinh: Phát hiện số điện thoại trong tin nhắn! Vui lòng không chia sẻ số điện thoại cá nhân trên môi trường học trực tuyến."
        if ID_CARD_RE.search(message):
            return "Hệ thống bảo vệ dữ liệu học sinh: Phát hiện dãy số định danh/CCCD! Để bảo vệ quyền riêng tư, tuyệt đối không chia sẻ thông tin căn cước."
        if EMAIL_RE.search(message):
            return "Hệ thống bảo mật: Vui lòng không gửi địa chỉ email cá nhân vào khung trò chuyện."
        if INJECTION_RE.search(message):
            return "Cảnh báo an toàn AI: Phát hiện câu lệnh bất thường (Prompt Injection/Jailbreak). Gia sư AI tuân thủ nghiêm ngặt chuẩn sư phạm K-12 và không bỏ qua nguyên tắc giảng dạy!"
        return None

    def _build_off_topic_reply(self, context: str) -> str:
        return (
            f"Thầy/cô nhận thấy câu hỏi này không liên quan đến bài học hiện tại. "
            f"Để học hiệu quả nhất, hãy cùng thầy/cô tập trung vào bài học '{context}' nhé! "
            f"Theo em, trong bài học này có phần nào em cảm thấy khó hiểu và muốn thầy/cô giải thích thêm không?"
        )

    def _build_cache_key(self, grade_level: int, mode: str, subject: str, context: str, message: str) -> str:
        raw = f"{grade_level}:{mode}:{subject}:{context}:{message.strip().lower()}"
        raw = re.sub(r"\s+", " ", raw)
        h = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        return f"cache:ai:socratic:{h[:32]}"

    def _standard_hints(self, context: str) -> list:
        return [
            "Gợi ý 1: Đọc kỹ câu hỏi và xác định rõ yêu cầu bài toán.",
            f"Gợi ý 2: Áp dụng định nghĩa và tính chất cơ bản đã học trong bài '{context}'.",
            "Gợi ý 3: Tự nhẩm thử hoặc vẽ hình trực quan để kiểm tra kết quả.",
        ]

    def _standard_quick_replies(self) -> list:
        return [
            "💡 Thầy gợi ý bước tiếp theo giúp em",
            "🔍 Em chưa rõ đoạn này, thầy giải thích kỹ hơn",
            "📝 Cho em một bài tập tương tự để luyện",
            "✨ Em đã hiểu rồi, cảm ơn thầy!",
        ]

    def _standard_citations(self, grade_level: int, context: str) -> list:
        if grade_level <= 5:
            return [
                CitationDto(
                    title="Bài 3: Khái niệm phân số và phân số bằng nhau",
                    chapter="Chương 1: Ôn tập và Bổ sung về Phân số",
                    source_book="SGK Toán 5 - Bộ sách Kết nối tri thức với cuộc sống (Trang 10-14)",
                    video_time="02:30 (Mục 1: Khái niệm Tử số và Mẫu số)",
                    target_url="/?lessonId=les-01",
                ),
                CitationDto(
                    title="Bài 4: Tính chất cơ bản của phân số",
                    chapter="Chương 1: Phân số & Phép tính",
                    source_book="Vở bài tập Toán 5 Tập 1 (Trang 8-11)",
                    video_time="05:30 (Mục 2: Ví dụ minh họa cắt bánh)",
                    target_url="/?lessonId=les-02",
                ),
            ]
        elif grade_level <= 9:
            return [
                CitationDto(
                    title=f"Bài học: {context}",
                    chapter="Chương trình THCS - GDPT 2018",
                    source_book="SGK Toán THCS - Bộ sách Kết nối tri thức",
                    target_url="/",
                ),
            ]
        else:
            return [
                CitationDto(
                    title=f"Bài học: {context}",
                    chapter="Chương trình THPT - GDPT 2018",
                    source_book="SGK Toán THPT - Bộ sách Kết nối tri thức",
                    target_url="/",
                ),
            ]

    async def _get_or_create_session(self, db: AsyncSession, user_id: uuid.UUID, req: ChatRequest) -> ChatSession:
        if req.session_id:
            result = await db.execute(select(ChatSession).where(ChatSession.id == req.session_id))
            existing = result.scalar_one_or_none()
            if existing:
                return existing
        return await self._get_or_create_typed_session(
            db, user_id, "LEARNING", req.context_lesson_title or "Phiên học LEARNING"
        )

    async def _get_or_create_typed_session(
        self, db: AsyncSession, user_id: uuid.UUID, session_type: str, default_title: str
    ) -> ChatSession:
        result = await db.execute(
            select(ChatSession)
            .where(ChatSession.user_id == user_id, ChatSession.session_type == session_type)
            .order_by(ChatSession.created_at.desc())
            .limit(1)
        )
        existing = result.scalar_one_or_none()
        if existing:
            return existing
        session = ChatSession(
            id=uuid.uuid4(),
            user_id=user_id,
            session_type=session_type,
            title=default_title,
        )
        db.add(session)
        await db.flush()
        return session

    async def _get_recent_history(self, db: AsyncSession, session_id: uuid.UUID, limit: int = 7):
        result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
        )
        all_msgs = result.scalars().all()
        sz = len(all_msgs)
        if sz > 1:
            return all_msgs[max(0, sz - limit): sz - 1]
        return []

    async def _count_user_messages_since(self, db: AsyncSession, user_id: uuid.UUID, since: datetime) -> int:
        result = await db.execute(
            text(
                "SELECT COUNT(m.id) FROM chat_messages m "
                "JOIN chat_sessions s ON m.session_id = s.id "
                "WHERE s.user_id = :user_id AND m.sender_role = 'USER' AND m.created_at >= :since"
            ),
            {"user_id": str(user_id), "since": since},
        )
        return result.scalar() or 0

    async def _build_response(
        self, db: AsyncSession, session: ChatSession, out: TutorOutput,
        mode: str, grade_level: int, used_today: int, safety_warning: Optional[str]
    ) -> ChatResponse:
        assistant_msg = ChatMessage(
            id=uuid.uuid4(),
            session_id=session.id,
            sender_role="ASSISTANT",
            content=out.reply,
            tokens_used=len(out.reply) // 4,
        )
        db.add(assistant_msg)
        await db.commit()

        remaining = max(0, settings.student_daily_quota - int(used_today) - 1)
        return ChatResponse(
            session_id=session.id,
            message_id=assistant_msg.id,
            reply=out.reply,
            is_socratic_hint=True,
            daily_quota_remaining=remaining,
            timestamp=datetime.now(timezone.utc),
            mode=mode,
            grade_level=grade_level,
            step_by_step_hints=out.step_by_step_hints,
            interactive_quiz=out.interactive_quiz,
            citations=out.citations,
            misconception_reason=out.misconception_reason,
            safety_warning=safety_warning,
            quick_replies=out.quick_replies,
        )

    async def _cache_get(self, key: str) -> Optional[str]:
        if not self.redis:
            return None
        try:
            return await self.redis.get(key)
        except Exception as ex:
            logger.warning("[AI_CACHE_WARN] Lỗi đọc Redis: %s", ex)
            return None

    async def _cache_set(self, key: str, value: str, ttl_hours: int = 24):
        if not self.redis:
            return
        try:
            await self.redis.setex(key, ttl_hours * 3600, value)
        except Exception as ex:
            logger.warning("[AI_CACHE_WARN] Không thể ghi cache Redis: %s", ex)
