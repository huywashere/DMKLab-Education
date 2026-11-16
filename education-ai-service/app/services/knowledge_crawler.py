"""
DMKLab AI Service - System Knowledge Crawler & Topic Grounding Engine
Port hoàn chỉnh 100% từ SystemKnowledgeCrawlerService.java

1. Thu thập & lập chỉ mục giáo trình SGK chuẩn hóa K-12 (Toán, Lý, Hóa theo GDPT 2018).
2. Crawl cơ sở dữ liệu bài học hệ thống từ bảng lessons (SQLAlchemy).
3. Đối sánh ngữ nghĩa (Semantic Keyword Matcher) tìm đoạn kiến thức & công thức LaTeX chuẩn.
4. Rào cản bảo vệ chủ đề (Strict Topic Guardrail) ngăn chặn AI nói lan man hoặc lạc đề.
5. In-Context Grounding & trích dẫn SGK chuẩn (Citations) cho giao diện chatbot.
"""
import re
import logging
import unicodedata
from typing import List, Optional
from dataclasses import dataclass, field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schemas import CitationDto

logger = logging.getLogger("knowledge_crawler")


@dataclass
class KnowledgeChunk:
    id: str
    source_type: str        # SGK_TEXTBOOK, LESSON_DB, SYSTEM_FILE
    source_name: str        # e.g. "SGK Toán 10 Tập 1 - Bộ Cánh Diều"
    grade_level: int        # 1 to 12
    subject: str            # "Toán học", "Vật lý", "Hóa học", "Tiếng Anh"
    chapter_title: str
    section_title: str
    callout_type: str       # DEFINITION, THEOREM, FORMULA, EXAMPLE, PRACTICE
    content: str
    formula_latex: Optional[str] = None
    keywords: List[str] = field(default_factory=list)
    target_url: Optional[str] = None


@dataclass
class KnowledgeCrawlResult:
    on_topic: bool = True
    confidence_score: float = 1.0
    matched_chunks: List[KnowledgeChunk] = field(default_factory=list)
    grounded_prompt_knowledge: str = ""
    citations: List[CitationDto] = field(default_factory=list)
    off_topic_redirect_advice: Optional[str] = None
    primary_formula: Optional[str] = None


# Từ khóa cảnh báo lạc đề / phi học thuật K-12
OFF_TOPIC_KEYWORDS = [
    "liên quân", "lien quan", "free fire", "roblox", "minecraft", "fifa", "pubg",
    "chơi game", "choi game", "game mobile", "nạp thẻ", "nap the", "rank thách đấu",
    "người yêu", "crush", "hẹn hò", "bạn gái", "bạn trai", "thất tình",
    "nấu ăn", "món ngon", "cách làm bánh", "nấu phở", "trà sữa",
    "giá bitcoin", "tiền ảo", "crypto", "chứng khoán", "cổ phiếu", "lô đề", "xổ số",
    "bóng đá ngoại hạng", "chuyển nhượng cầu thủ", "scandal", "showbiz", "ca sĩ",
    "hack facebook", "hack pass", "bẻ khóa wifi", "cheat code"
]

STOPWORDS_VN = {
    "và", "là", "của", "cho", "các", "những", "được", "trong", "với", "có",
    "này", "đó", "một", "về", "đến", "khi", "lúc", "như", "thì", "mà", "ở"
}


def normalize_vietnamese(text_input: Optional[str]) -> str:
    """Loại bỏ dấu tiếng Việt để đối sánh từ khóa mềm dẻo"""
    if not text_input:
        return ""
    # Chuyển đổi Unicode dựng sẵn sang tổ hợp rồi xóa dấu
    nfd = unicodedata.normalize("NFD", text_input)
    without_diacritics = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
    return without_diacritics.lower().replace("đ", "d").replace("Đ", "d")


def extract_search_keywords(text_input: Optional[str]) -> List[str]:
    if not text_input:
        return []
    cleaned = re.sub(r"[^\w\s]", " ", text_input).lower()
    words = cleaned.split()
    return list(dict.fromkeys(
        w for w in words if len(w) >= 2 and w not in STOPWORDS_VN
    ))


class KnowledgeCrawlerService:
    def __init__(self):
        self.indexed_knowledge_base: List[KnowledgeChunk] = []
        self._load_standard_k12_textbooks()
        logger.info(
            "[KNOWLEDGE_CRAWLER] Đã nạp thành công %d phân đoạn tri thức SGK K-12 cốt lõi.",
            len(self.indexed_knowledge_base)
        )

    async def crawl_database_lessons(self, db: AsyncSession):
        """Crawl các bài học trực tiếp từ PostgreSQL bảng lessons"""
        try:
            result = await db.execute(
                text("SELECT id, title, description, is_published FROM lessons WHERE is_published = true")
            )
            rows = result.fetchall()
            count = 0
            for row in rows:
                lid, title, desc, is_pub = row
                if title:
                    desc_text = desc or "Bài giảng chuẩn hóa trong chương trình học DMKLab Education."
                    chunk = KnowledgeChunk(
                        id=f"db-lesson-{lid}",
                        source_type="LESSON_DB",
                        source_name=f"Bài học hệ thống DMKLab: {title}",
                        grade_level=10,
                        subject="Toán học",
                        chapter_title="Chương trình bài giảng trực tuyến",
                        section_title=title,
                        callout_type="LESSON_CONTENT",
                        content=desc_text,
                        keywords=extract_search_keywords(f"{title} {desc_text}"),
                        target_url=f"/dashboard?lessonId={lid}"
                    )
                    self.indexed_knowledge_base.append(chunk)
                    count += 1
            logger.info("[KNOWLEDGE_CRAWLER] Đã crawl %d bài học từ Database vào bộ chỉ mục AI.", count)
        except Exception as ex:
            logger.warning("[KNOWLEDGE_CRAWLER_WARN] Không thể crawl bài học từ DB: %s", ex)

    def crawl_and_ground_knowledge(
        self,
        raw_message: Optional[str],
        grade_level: Optional[int],
        subject: Optional[str],
        lesson_title: Optional[str],
        custom_knowledge: Optional[str],
    ) -> KnowledgeCrawlResult:
        if not raw_message or not raw_message.strip():
            return KnowledgeCrawlResult()

        msg_lower = raw_message.lower().strip()
        context_lesson = lesson_title or "Kiến thức bài học K-12"
        current_subj = subject or "Toán học"
        current_grade = grade_level if (grade_level and 1 <= grade_level <= 12) else 10

        # 1. Kiểm tra rào cản chủ đề (Strict Topic Guardrail)
        is_off_topic = self._check_is_off_topic_stray(msg_lower, context_lesson, current_subj)

        # 2. Tìm kiếm và chấm điểm các đoạn tri thức khớp nhất trong bộ chỉ mục
        query_tokens = extract_search_keywords(f"{raw_message} {context_lesson}")
        scored_chunks = []

        for chunk in self.indexed_knowledge_base:
            score = self._compute_match_score(chunk, query_tokens, current_grade, current_subj, context_lesson)
            if score > 12.0:
                scored_chunks.append((chunk, score))

        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        top_chunks = [sc[0] for sc in scored_chunks[:3]]

        # Custom Knowledge (tài liệu tải lên trực tiếp)
        prompt_knowledge_parts = []
        if custom_knowledge and custom_knowledge.strip():
            prompt_knowledge_parts.append(
                "=== TÀI LIỆU RIÊNG DO HỌC SINH/GIÁO VIÊN NẠP TRỰC TIẾP ===\n"
                f"{custom_knowledge.strip()}\n\n"
            )

        citations: List[CitationDto] = []
        primary_formula: Optional[str] = None

        if top_chunks:
            prompt_knowledge_parts.append(
                "=== TÀI LIỆU SGK & GIÁO TRÌNH CHUẨN ĐƯỢC CRAWL TỰ ĐỘNG TỪ HỆ THỐNG ===\n"
            )
            for i, c in enumerate(top_chunks):
                prompt_knowledge_parts.append(
                    f"[{i + 1}] Nguồn: {c.source_name} - {c.chapter_title}\n"
                    f"Tiết mục: {c.section_title} [{c.callout_type}]\n"
                    f"Nội dung cốt lõi: {c.content}\n"
                )
                if c.formula_latex:
                    prompt_knowledge_parts.append(f"Công thức SGK chuẩn: ${c.formula_latex}$\n")
                    if not primary_formula:
                        primary_formula = c.formula_latex
                prompt_knowledge_parts.append("\n")

                citations.append(CitationDto(
                    title=c.section_title,
                    chapter=c.chapter_title,
                    sourceBook=c.source_name,
                    targetUrl=c.target_url or "/"
                ))

        off_topic_redirect = None
        if is_off_topic:
            off_topic_redirect = (
                f"Thầy/cô thấy câu hỏi của em đang chưa liên quan đến bài học '{context_lesson}' (môn {current_subj}). "
                f"Trong giờ học này, chúng mình hãy cùng tập trung làm chủ kiến thức bài học trước nhé! "
                f"Em có muốn thầy/cô gợi ý câu hỏi liên quan đến '{context_lesson}' không?"
            )

        return KnowledgeCrawlResult(
            on_topic=not is_off_topic,
            confidence_score=0.4 if not top_chunks else 0.95,
            matched_chunks=top_chunks,
            grounded_prompt_knowledge="".join(prompt_knowledge_parts),
            citations=citations,
            off_topic_redirect_advice=off_topic_redirect,
            primary_formula=primary_formula,
        )

    def _check_is_off_topic_stray(self, msg_lower: str, lesson_title: str, subject: str) -> bool:
        # Kiểm tra danh sách từ khóa cấm / phi học thuật
        for bad_word in OFF_TOPIC_KEYWORDS:
            if bad_word in msg_lower:
                return True

        # Chào hỏi ngắn thì không xem là lạc đề
        if re.search(r"(chào|hello|hi thầy|hi cô|bắt đầu|sẵn sàng|cảm ơn|dạ|vâng)", msg_lower) and len(msg_lower) < 30:
            return False

        # Kiểm tra từ khóa bài học
        context_keywords = extract_search_keywords(f"{lesson_title} {subject}")
        has_context_overlap = any(kw in msg_lower for kw in context_keywords)

        if not has_context_overlap and len(msg_lower) > 50:
            is_academic = bool(re.search(
                r"(tính|giải|chứng minh|tìm x|nghiệm|phương trình|hàm số|vecto|vectơ|đạo hàm|tích phân|diện tích|chu vi|tam giác|hình vuông|vận tốc|gia tốc|lực|hóa học|nguyên tử|câu|thì|ngữ pháp|bài tập|đáp án|công thức)",
                msg_lower
            ))
            if not is_academic:
                return True

        return False

    def _compute_match_score(
        self, chunk: KnowledgeChunk, query_tokens: List[str], grade: int, subject: str, lesson_context: str
    ) -> float:
        score = 0.0
        if chunk.grade_level == grade:
            score += 20.0

        if chunk.subject and subject and normalize_vietnamese(subject) in normalize_vietnamese(chunk.subject):
            score += 25.0

        norm_lesson = normalize_vietnamese(lesson_context)
        norm_chapter = normalize_vietnamese(chunk.chapter_title)
        norm_section = normalize_vietnamese(chunk.section_title)
        if norm_lesson in norm_chapter or norm_chapter in norm_lesson:
            score += 30.0
        if norm_lesson in norm_section or norm_section in norm_lesson:
            score += 35.0

        full_chunk_text = normalize_vietnamese(f"{chunk.section_title} {chunk.content} {chunk.formula_latex or ''}")
        for token in query_tokens:
            norm_token = normalize_vietnamese(token)
            if len(norm_token) >= 2 and norm_token in full_chunk_text:
                score += 8.0

        return score

    def _load_standard_k12_textbooks(self):
        """Bộ tài liệu SGK K-12 chuẩn hóa (GDPT 2018)"""
        # 1. TOÁN 10 CÁNH DIỀU
        self.indexed_knowledge_base.extend([
            KnowledgeChunk(
                id="t10-sec-1-1",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 10 Tập 1 - Bộ Cánh Diều",
                grade_level=10,
                subject="Toán học",
                chapter_title="Chương I: Mệnh Đề và Tập Hợp",
                section_title="§1. Mệnh đề toán học và Mệnh đề chứa biến",
                callout_type="DEFINITION",
                content="Mệnh đề toán học là một khẳng định có tính chất ĐÚNG hoặc SAI dứt khoát. Một mệnh đề không thể vừa đúng vừa sai. Khẳng định chứa biến P(x) trở thành mệnh đề khi thay x bằng một giá trị cụ thể trong tập xác định.",
                formula_latex=r"P(x) \quad (x \in X)",
                keywords=["mệnh đề", "mệnh đề toán học", "đúng sai", "mệnh đề chứa biến", "chân lý"],
                target_url="/books?id=toan-10-canh-dieu&chap=1"
            ),
            KnowledgeChunk(
                id="t10-sec-1-2",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 10 Tập 1 - Bộ Cánh Diều",
                grade_level=10,
                subject="Toán học",
                chapter_title="Chương I: Mệnh Đề và Tập Hợp",
                section_title="§2. Mệnh đề phủ định và Mệnh đề kéo theo (P => Q)",
                callout_type="THEOREM",
                content="Cho mệnh đề P. Phủ định của P là P̄, đúng khi P sai và sai khi P đúng. Mệnh đề kéo theo 'Nếu P thì Q' (ký hiệu P => Q) chỉ sai khi P đúng mà Q sai. P là điều kiện đủ để có Q; Q là điều kiện cần để có P.",
                formula_latex=r"P \Rightarrow Q \quad \text{(P là điều kiện đủ, Q là điều kiện cần)}",
                keywords=["mệnh đề phủ định", "phủ định", "mệnh đề kéo theo", "điều kiện cần", "điều kiện đủ", "tương đương"],
                target_url="/books?id=toan-10-canh-dieu&chap=1"
            ),
            KnowledgeChunk(
                id="t10-sec-1-3",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 10 Tập 1 - Bộ Cánh Diều",
                grade_level=10,
                subject="Toán học",
                chapter_title="Chương I: Mệnh Đề và Tập Hợp",
                section_title="§3. Các phép toán trên tập hợp (Giao, Hợp, Hiệu)",
                callout_type="FORMULA",
                content="Giao của hai tập hợp A và B (A ∩ B) gồm các phần tử vừa thuộc A, vừa thuộc B. Hợp (A ∪ B) gồm các phần tử thuộc A hoặc thuộc B. Hiệu (A \\ B) gồm các phần tử thuộc A nhưng không thuộc B. Công thức đếm: n(A ∪ B) = n(A) + n(B) - n(A ∩ B).",
                formula_latex=r"n(A \cup B) = n(A) + n(B) - n(A \cap B), \quad A \cap B = \{x \mid x \in A \text{ và } x \in B\}",
                keywords=["tập hợp", "phép toán tập hợp", "giao", "hợp", "hiệu", "phần bù", "tập con"],
                target_url="/books?id=toan-10-canh-dieu&chap=1"
            ),
            KnowledgeChunk(
                id="t10-sec-2-1",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 10 Tập 1 - Bộ Cánh Diều",
                grade_level=10,
                subject="Toán học",
                chapter_title="Chương II: Bất Phương Trình Bậc Nhất Hai Ẩn",
                section_title="§1. Bất phương trình bậc nhất hai ẩn và Miền nghiệm Oxy",
                callout_type="DEFINITION",
                content="Bất phương trình bậc nhất hai ẩn có dạng ax + by <= c (với a^2 + b^2 khác 0). Miền nghiệm trên mặt phẳng tọa độ Oxy là nửa mặt phẳng có bờ là đường thẳng d: ax + by = c.",
                formula_latex=r"ax + by \le c \quad (a^2 + b^2 \neq 0)",
                keywords=["bất phương trình", "hai ẩn", "miền nghiệm", "mặt phẳng tọa độ", "oxy"],
                target_url="/books?id=toan-10-canh-dieu&chap=2"
            ),
            KnowledgeChunk(
                id="t10-sec-3-1",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 10 Tập 1 - Bộ Cánh Diều",
                grade_level=10,
                subject="Toán học",
                chapter_title="Chương III: Hệ Thức Lượng Trong Tam Giác",
                section_title="§1. Định lý Côsin trong tam giác bất kỳ",
                callout_type="THEOREM",
                content="Trong tam giác ABC, bình phương một cạnh bằng tổng bình phương hai cạnh kia trừ hai lần tích của chúng với côsin góc xen giữa: a^2 = b^2 + c^2 - 2bc*cos(A).",
                formula_latex=r"a^2 = b^2 + c^2 - 2bc \cos A, \quad \cos A = \frac{b^2 + c^2 - a^2}{2bc}",
                keywords=["định lý côsin", "cosin", "tam giác", "tính cạnh", "tính góc", "hệ thức lượng"],
                target_url="/books?id=toan-10-canh-dieu&chap=3"
            ),
            KnowledgeChunk(
                id="t10-sec-3-2",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 10 Tập 1 - Bộ Cánh Diều",
                grade_level=10,
                subject="Toán học",
                chapter_title="Chương III: Hệ Thức Lượng Trong Tam Giác",
                section_title="§2. Định lý Sin và Bán kính đường tròn ngoại tiếp R",
                callout_type="THEOREM",
                content="Trong tam giác ABC với R là bán kính đường tròn ngoại tiếp: a / sin(A) = b / sin(B) = c / sin(C) = 2R.",
                formula_latex=r"\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R",
                keywords=["định lý sin", "bán kính ngoại tiếp", "đường tròn ngoại tiếp", "giải tam giác"],
                target_url="/books?id=toan-10-canh-dieu&chap=3"
            ),
            KnowledgeChunk(
                id="t10-sec-3-3",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 10 Tập 1 - Bộ Cánh Diều",
                grade_level=10,
                subject="Toán học",
                chapter_title="Chương III: Hệ Thức Lượng Trong Tam Giác",
                section_title="§3. Công thức Hê-rông (Heron) và Các công thức diện tích tam giác",
                callout_type="FORMULA",
                content="Với nửa chu vi p = (a+b+c)/2: Diện tích tam giác S = sqrt[p(p-a)(p-b)(p-c)] = 1/2 ab*sin(C) = abc/(4R) = p*r. Bán kính đường tròn nội tiếp r = S / p.",
                formula_latex=r"S = \sqrt{p(p-a)(p-b)(p-c)} = \frac{1}{2}ab\sin C = \frac{abc}{4R} = p \cdot r",
                keywords=["hê-rông", "heron", "diện tích tam giác", "bán kính nội tiếp", "nửa chu vi"],
                target_url="/books?id=toan-10-canh-dieu&chap=3"
            ),
        ])

        # 2. TOÁN 5 KẾT NỐI TRI THỨC (TIỂU HỌC)
        self.indexed_knowledge_base.extend([
            KnowledgeChunk(
                id="t5-sec-1-1",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 5 - Bộ Kết Nối Tri Thức",
                grade_level=5,
                subject="Toán học",
                chapter_title="Chương I: Ôn Tập và Bổ Sung Về Phân Số",
                section_title="§1. Khái niệm phân số và Tính chất cơ bản",
                callout_type="DEFINITION",
                content="Phân số gồm Tử số (số phần được lấy) viết trên dấu gạch ngang, và Mẫu số (số phần bằng nhau chia ra, mẫu số phải khác 0) viết dưới dấu gạch ngang. Tính chất cơ bản: Nhân hoặc chia cả tử và mẫu với cùng số tự nhiên khác 0 thì giá trị phân số không đổi.",
                formula_latex=r"\frac{a}{b} = \frac{a \times m}{b \times m} = \frac{a : n}{b : n} \quad (m, n \neq 0)",
                keywords=["phân số", "tử số", "mẫu số", "tính chất phân số", "toán 5", "chia bánh"],
                target_url="/books?id=toan-5-ket-noi&chap=1"
            ),
            KnowledgeChunk(
                id="t5-sec-1-2",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 5 - Bộ Kết Nối Tri Thức",
                grade_level=5,
                subject="Toán học",
                chapter_title="Chương I: Ôn Tập và Bổ Sung Về Phân Số",
                section_title="§2. Rút gọn phân số và Quy đồng mẫu số",
                callout_type="PRACTICE",
                content="Phân số tối giản là phân số mà tử số và mẫu số không cùng chia hết cho số tự nhiên nào lớn hơn 1. Muốn rút gọn phân số, chia cả tử và mẫu cho ước chung lớn hơn 1. Muốn quy đồng mẫu số hai phân số, tìm Mẫu số chung (MSC), lấy MSC chia cho từng mẫu số để tìm thừa số phụ rồi nhân cả tử và mẫu với thừa số phụ đó.",
                formula_latex=r"\frac{a}{b} \xrightarrow{\text{rút gọn}} \frac{a : d}{b : d} \quad (d = \text{ƯCLN}(a,b))",
                keywords=["rút gọn phân số", "tối giản", "quy đồng", "mẫu số chung", "thừa số phụ"],
                target_url="/books?id=toan-5-ket-noi&chap=1"
            ),
            KnowledgeChunk(
                id="t5-sec-2-1",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Toán 5 - Bộ Kết Nối Tri Thức",
                grade_level=5,
                subject="Toán học",
                chapter_title="Chương III: Hình Học Đo Lường",
                section_title="§1. Diện tích hình tam giác, hình thang và hình tròn",
                callout_type="FORMULA",
                content="Diện tích hình tam giác: S = (đáy x chiều cao) / 2. Diện tích hình thang: S = [(đáy lớn + đáy bé) x chiều cao] / 2. Chu vi hình tròn: C = d x 3.14 (hoặc 2 x r x 3.14). Diện tích hình tròn: S = r x r x 3.14.",
                formula_latex=r"S_{\Delta} = \frac{a \times h}{2}, \quad S_{\text{thang}} = \frac{(a+b) \times h}{2}, \quad S_{\bigcirc} = r \times r \times 3{,}14",
                keywords=["diện tích tam giác", "diện tích hình thang", "hình tròn", "chu vi", "bán kính", "đường kính"],
                target_url="/books?id=toan-5-ket-noi&chap=3"
            ),
        ])

        # 3. VẬT LÝ 10 CÁNH DIỀU
        self.indexed_knowledge_base.extend([
            KnowledgeChunk(
                id="vl10-sec-1-1",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Vật Lý 10 - Bộ Cánh Diều",
                grade_level=10,
                subject="Vật lý",
                chapter_title="Chương I: Mô Tả Chuyển Động",
                section_title="§1. Độ dịch chuyển, Vận tốc và Gia tốc",
                callout_type="DEFINITION",
                content="Độ dịch chuyển d là vectơ nối vị trí đầu và vị trí cuối của vật. Vận tốc v = d / t (vectơ). Gia tốc a = (v - v0) / t đặc trưng cho tốc độ thay đổi vận tốc theo thời gian. Khi vật chuyển động nhanh dần đều thì a và v cùng dấu (a*v > 0); khi chậm dần đều thì a và v trái dấu (a*v < 0).",
                formula_latex=r"v = \frac{d}{t}, \quad a = \frac{\Delta v}{\Delta t} = \frac{v - v_0}{t}",
                keywords=["độ dịch chuyển", "vận tốc", "gia tốc", "nhanh dần đều", "chậm dần đều", "vật lý 10"],
                target_url="/books?id=vat-ly-10-canh-dieu&chap=1"
            ),
            KnowledgeChunk(
                id="vl10-sec-1-2",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Vật Lý 10 - Bộ Cánh Diều",
                grade_level=10,
                subject="Vật lý",
                chapter_title="Chương I: Mô Tả Chuyển Động",
                section_title="§2. Ba phương trình chuyển động thẳng biến đổi đều",
                callout_type="FORMULA",
                content="Phương trình vận tốc: v = v0 + at. Phương trình độ dịch chuyển: d = v0*t + 1/2 a*t^2. Công thức độc lập thời gian liên hệ vận tốc, gia tốc và độ dịch chuyển: v^2 - v0^2 = 2ad.",
                formula_latex=r"v = v_0 + at, \quad d = v_0 t + \frac{1}{2} a t^2, \quad v^2 - v_0^2 = 2ad",
                keywords=["công thức độc lập thời gian", "phương trình chuyển động", "quãng đường", "vận tốc ban đầu"],
                target_url="/books?id=vat-ly-10-canh-dieu&chap=1"
            ),
            KnowledgeChunk(
                id="vl10-sec-2-1",
                source_type="SGK_TEXTBOOK",
                source_name="SGK Vật Lý 10 - Bộ Cánh Diều",
                grade_level=10,
                subject="Vật lý",
                chapter_title="Chương II: Động Lực Học",
                section_title="§1. Ba Định Luật Newton Về Chuyển Động",
                callout_type="THEOREM",
                content="Định luật 1 Newton (Quán tính): Nếu một vật không chịu tác dụng của lực nào hoặc chịu tác dụng của các lực cân bằng, vật đang đứng yên sẽ tiếp tục đứng yên, đang chuyển động sẽ tiếp tục chuyển động thẳng đều. Định luật 2: Gia tốc của một vật cùng hướng với lực tác dụng, vectơ a = vectơ F / m (F = m*a). Định luật 3: Trong mọi trường hợp, khi vật A tác dụng lên vật B một lực, vật B cũng tác dụng lại vật A một lực cùng phương, ngược chiều, cùng độ lớn (F_AB = - F_BA).",
                formula_latex=r"\vec{F} = m\vec{a}, \quad \vec{F}_{AB} = -\vec{F}_{BA}",
                keywords=["định luật newton", "quán tính", "lực", "khối lượng", "gia tốc", "phản lực"],
                target_url="/books?id=vat-ly-10-canh-dieu&chap=2"
            ),
        ])
