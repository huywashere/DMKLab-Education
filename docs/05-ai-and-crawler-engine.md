# 🧠 05. ĐỘNG CƠ SOCRATIC AI 2.0 & BỘ CRAWLER TRI THỨC HỆ THỐNG

> **Mã nguồn chính**:  
> - `education-backend/.../ai/service/AiService.java`  
> - `education-backend/.../ai/service/SystemKnowledgeCrawlerService.java`  
> - `education-frontend/.../features/student/SocraticChatbot.tsx`  

---

## 1. TỔNG QUAN KIẾN TRÚC TRỢ LÝ AI ĐA TẦNG (MULTI-TIER AI ARCHITECTURE)

Hệ thống AI của DMKLab Education được thiết kế nhằm đáp ứng 3 tiêu chí khắt khe:
1. **Chuẩn phương pháp Socratic**: Không giải hộ, dẫn dắt từng bước, khơi gợi tư duy phản biện.
2. **Triệt tiêu sai lệch & Không nói lan man (Zero-Hallucination & Topic Grounding)**: Bám sát 100% chương trình SGK GDPT 2018.
3. **Hiệu năng cao & Tiết kiệm chi phí**: Tích hợp Semantic Cache trên Redis và cơ chế chuyển đổi dự phòng thông minh (Hybrid Fallback).

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        StudentMsg["Câu hỏi của học sinh\n+ Trình độ lớp (Grade)\n+ Ngữ cảnh bài học (Context)"]
    end

    subgraph PreProcess ["Tiền Xử Lý & An Toàn K-12"]
        PIIFilter["Bộ lọc PII & Prompt Injection\n• Kiểm tra SĐT, CCCD, Email\n• Chặn Jailbreak / DAN Mode"]
        QuotaCheck["Kiểm tra Hạn mức (Quota Gate)\n• Tối đa 30 câu hỏi / ngày"]
    end

    subgraph CrawlerEngine ["Động Cơ Crawl Tri Thức & Rào Cản Chủ Đề"]
        Crawler["SystemKnowledgeCrawlerService\n• Crawl kho SGK K-12 GDPT 2018\n• Crawl CSDL bài học (Lesson DB)\n• Quét tệp tài liệu hệ thống (.md, .txt)"]
        TopicCheck{"Kiểm tra Chủ Đề\n(Is On-Topic?)"}
        OffTopicAction["Kích hoạt Rào Cản Chủ Đề (Topic Guardrail)\n• Từ chối trả lời lan man\n• Nhắc nhở sư phạm & Đưa câu hỏi gợi mở\n• Gợi ý nút 'Quay lại bài học'"]
        Grounding["Trích xuất Định nghĩa, Định lý\n& Công thức LaTeX chuẩn ($...)"]
    end

    subgraph CacheTier ["Tầng Bộ Đệm Ngữ Nghĩa (Semantic Cache)"]
        RedisPromptCache[("Redis Prompt Cache (SHA-256)\n• Khóa: Grade + Mode + Context + Msg\n• TTL: 24 giờ")]
    end

    subgraph InferenceEngine ["Tầng Suy Luận Đa Mô Hình (Hybrid LLM Fallback)"]
        Gemini["1. Google Gemini 2.5 Flash\n(Ưu tiên chính - Tốc độ cao, Quota lớn)"]
        Groq["2. Groq LLaMA 3.3 70B Versatile\n(Dự phòng 1 - Độ trễ siêu thấp)"]
        OpenAI["3. OpenAI GPT-4o-mini\n(Dự phòng 2)"]
        LocalEngine["4. Động Cơ Socratic Nội Bộ\n(Dự phòng 3 khi mất mạng hoàn toàn)"]
    end

    subgraph PostProcess ["Hậu Xử Lý & Trực Quan Hóa"]
        AttachCitations["Gắn trích dẫn SGK tương tác (Citations)\n+ Thẻ phản hồi nhanh (Quick Reply Chips)"]
        KaTeXRender["Trình diễn công thức Toán KaTeX\n+ Phát âm thanh Text-to-Speech"]
        RLHFStore[("Lưu Tin Nhắn & Thu thập\nRLHF Feedback (Thumbs Up/Down)")]
    end

    StudentMsg --> PIIFilter
    PIIFilter --> QuotaCheck
    QuotaCheck --> Crawler
    Crawler --> TopicCheck

    TopicCheck -->|LẠC ĐỀ (Off-Topic)| OffTopicAction
    OffTopicAction --> PostProcess

    TopicCheck -->|ĐÚNG CHỦ ĐỀ| Grounding
    Grounding --> RedisPromptCache

    RedisPromptCache -->|CACHE HIT (0ms, 0đ)| PostProcess
    RedisPromptCache -->|CACHE MISS| Gemini

    Gemini -.->|Lỗi / Hết quota| Groq
    Groq -.->|Lỗi API| OpenAI
    OpenAI -.->|Mất mạng hoàn toàn| LocalEngine

    Gemini -->|Lưu Cache 24h| RedisPromptCache
    Groq -->|Lưu Cache 24h| RedisPromptCache
    OpenAI -->|Lưu Cache 24h| RedisPromptCache

    Gemini --> PostProcess
    Groq --> PostProcess
    OpenAI --> PostProcess
    LocalEngine --> PostProcess

    PostProcess --> AttachCitations
    AttachCitations --> KaTeXRender
    KaTeXRender --> RLHFStore
```

---

## 2. BỘ CRAWLER TRI THỨC HỆ THỐNG (`SystemKnowledgeCrawlerService.java`)

### 2.1 Cấu trúc phân đoạn tri thức (Knowledge Chunk Model)
Mỗi phân đoạn kiến thức trong bộ chỉ mục (In-Memory Inverted Index) chứa đầy đủ thông tin ngữ cảnh:
```java
public static class KnowledgeChunk {
    private String id;
    private String sourceType;    // SGK_TEXTBOOK, LESSON_DB, SYSTEM_FILE
    private String sourceName;    // Ví dụ: "SGK Toán 10 Tập 1 - Bộ Cánh Diều"
    private Integer gradeLevel;   // 1 đến 12
    private String subject;       // "Toán học", "Vật lý", "Hóa học", "Tiếng Anh"
    private String chapterTitle;  // "Chương I: Mệnh Đề và Tập Hợp"
    private String sectionTitle;  // "§1. Mệnh đề toán học và Mệnh đề chứa biến"
    private String calloutType;   // "DEFINITION", "THEOREM", "FORMULA", "EXAMPLE", "PRACTICE"
    private String content;       // Nội dung định nghĩa/định lý chuẩn của Bộ GD&ĐT
    private String formulaLatex;  // Công thức chuẩn LaTeX (ví dụ: a^2 = b^2 + c^2 - 2bc \cos A)
    private List<String> keywords;// Danh sách từ khóa tìm kiếm
    private String targetUrl;     // Đường dẫn mở sách: /books?id=toan-10-canh-dieu&chap=1
}
```

### 2.2 Ba nguồn dữ liệu được tự động Crawl và Lập chỉ mục
1. **Kho SGK K-12 chuẩn hóa (GDPT 2018)**:
   - Được nạp trực tiếp vào bộ chỉ mục khi khởi động hệ thống (`@PostConstruct`).
   - Bao quát các chương cốt lõi: Mệnh đề & Tập hợp, Bất phương trình 2 ẩn, Hệ thức lượng trong tam giác, Vectơ (Toán 10); Phân số, Số thập phân, Hình học đo lường (Toán 5); Độ dịch chuyển, Gia tốc, Chuyển động biến đổi đều, Ba định luật Newton (Vật lý 10)...
2. **Cơ sở dữ liệu bài học hệ thống (Lesson DB)**:
   - Phương thức `crawlDatabaseLessons()` quét toàn bộ các bài giảng đã xuất bản từ `LessonRepository`.
   - Lập chỉ mục tên bài học, môn học và phần mô tả nội dung giáo án của giáo viên.
3. **Hệ thống tệp tài liệu bổ trợ (Local System Files)**:
   - Phương thức `crawlSystemFiles()` quét thư mục `data/knowledge` hoặc tài liệu hệ thống.
   - Tự động băm nhỏ các tệp `.md` hoặc `.txt` thành các chunk theo đoạn văn để lập chỉ mục.

### 2.3 Thuật toán chấm điểm mức độ liên quan (Relevance Scoring Algorithm)
Khi học sinh gửi câu hỏi, hệ thống tính toán điểm số cho từng chunk theo công thức có trọng số:
- **Trùng khối lớp học**: `+20.0 điểm`
- **Trùng môn học**: `+25.0 điểm`
- **Khớp tên bài học trong chương/tiết**: `+30.0 đến +35.0 điểm`
- **Mỗi từ khóa học thuật xuất hiện trong nội dung chunk**: `+8.0 điểm`
Hệ thống chọn lọc ra **Top 1–3 chunk có điểm số cao nhất** để đưa vào bộ Grounding Prompt.

---

## 3. RÀO CẢN BẢO VỆ CHỦ ĐỀ & CHỐNG NÓI LAN MAN (STRICT TOPIC GUARDRAIL)

### 3.1 Nhận diện câu hỏi ngoài phạm vi học thuật
Phương thức `checkIsOffTopicStray` quét câu hỏi dựa trên:
1. **Danh sách từ khóa cấm / phi giáo dục**:
   - Game online: *liên quân, free fire, roblox, minecraft, pubg, nạp thẻ, leo rank...*
   - Đời tư / tình cảm: *người yêu, crush, hẹn hò, bạn gái, thất tình...*
   - Tài chính / cờ bạc: *bitcoin, tiền ảo, crypto, chứng khoán, lô đề, xổ số...*
   - Tin đồn / giải trí: *bóng đá ngoại hạng, showbiz, ca sĩ scandal...*
   - Tấn công mạng: *hack facebook, bẻ khóa wifi, cheat game...*
2. **Kiểm tra độ giao thoa ngữ cảnh (Context Overlap)**:
   - Nếu câu hỏi dài trên 50 ký tự mà không chứa bất kỳ từ khóa nào liên quan đến môn học, bài giảng hoặc thuật ngữ khoa học cơ bản (tính, giải, chứng minh, tìm x, công thức, định lý...), câu hỏi được gắn cờ `isOffTopic = true`.

### 3.2 Hành vi sư phạm khi học sinh hỏi lạc đề
- **Không hùa theo câu hỏi lạc đề**: AI tuyệt đối không bàn luận sâu về game hay các chủ đề phi học thuật.
- **Lời nhắc nhở lịch sự & dẫn dắt quay lại bài học**:
  > *"Thầy/cô thấy câu hỏi của em ('[nội dung]') chưa liên quan đến bài học '[Tên bài]' (môn [Môn học]). Trong giờ học này, chúng mình hãy cùng tập trung làm chủ kiến thức bài học trước nhé! Em có muốn thầy gợi ý câu hỏi liên quan đến [Tên bài] không?"*
- **Tự động sinh các Action Chips định hướng**:
  - `📖 Trở lại bài học: [Tên bài]`
  - `💡 Cho em xem công thức SGK trọng tâm`
  - `📝 Thử một câu hỏi luyện tập`

---

## 4. QUY TẮC SYSTEM PROMPT CHUẨN SƯ PHẠM SOCRATIC

Được xây dựng trong phương thức `buildSocraticSystemPrompt` của `AiService.java`:

### 4.1 Phân hóa phong cách theo lứa tuổi (Age Personas)
- **Lớp 1–5**: Xưng *"thầy/cô"*, gọi *"con"*. Dùng ví dụ trực quan như cái kẹo, quả táo, que tính, đồng hồ.
- **Lớp 6–9**: Xưng *"thầy/cô"*, gọi *"em"*. Dẫn dắt từng bước logic, khơi gợi tư duy phản biện.
- **Lớp 10–12**: Xưng *"thầy/cô"*, gọi *"em"*. Dẫn dắt tư duy hệ thống, phân tích bản chất định lý và liên hệ dạng đề thi tốt nghiệp THPT.

### 4.2 Sáu nguyên tắc cốt lõi bắt buộc của Prompt
1. **Tuyệt đối không giải hộ**: Không bao giờ đưa trực tiếp đáp số cuối cùng cho học sinh.
2. **Nguyên tắc "Một bước mỗi lần" (One Step at a Time)**: Chỉ đặt đúng 01 câu hỏi gợi mở tiếp theo ở cuối câu trả lời.
3. **Chẩn đoán điểm ngộ nhận (Misconception Diagnosis)**: Chỉ ra chính xác học sinh đang nhầm lẫn ở bước nào (ví dụ: nhầm dấu âm ngoài ngoặc, nhầm giữa cộng và nhân lũy thừa).
4. **Định dạng toán học chuẩn LaTeX (KaTeX)**: Toàn bộ công thức, biến số, phân số phải bọc trong `$ ... $` hoặc `$$ ... $$`.
5. **Khích lệ tích cực**: Luôn ghi nhận nỗ lực suy nghĩ của học sinh trước khi chỉ ra chỗ cần điều chỉnh.
6. **Bảo vệ chủ đề & Không nói lan man**: Bám sát 100% dữ liệu giáo trình đã trích xuất từ SGK.

---

## 5. BỘ ĐỆM NGỮ NGHĨA REDIS (SEMANTIC PROMPT CACHING)

- **Cơ chế băm SHA-256**:
  ```java
  String raw = (gradeLevel + ":" + mode + ":" + subject + ":" + context + ":" + message.trim().toLowerCase())
               .replaceAll("\\s+", " ");
  String cacheKey = "cache:ai:socratic:" + sha256(raw).substring(0, 32);
  ```
- **Hiệu quả thực tế**:
  - Đối với các câu hỏi lý thuyết hoặc bài tập SGK phổ biến, hệ thống trả về kết quả ngay lập tức với **độ trễ 0ms và 0đ chi phí token API**.
  - Thời gian sống (TTL) của bộ đệm là **24 giờ**, tự động giải phóng bộ nhớ khi hết hạn.

---

## 6. VÒNG LẶP HỌC TẬP TĂNG CƯỜNG TỪ PHẢN HỒI (RLHF FEEDBACK LOOP)

- Tại mỗi câu trả lời của AI trong `SocraticChatbot.tsx`, có hai nút bấm đánh giá:
  - 👍 **Hữu ích (HELPFUL)**
  - 👎 **Chưa hữu ích (UNHELPFUL)**
- Khi học sinh bấm đánh giá, client gọi API:  
  `POST /api/v1/ai/messages/{messageId}/feedback`
- Backend cập nhật trực tiếp hai trường `feedback_rating` và `feedback_comment` trong bảng `chat_messages` (được tạo qua migration `V7__ai_message_feedback.sql`). Dữ liệu này được xuất định kỳ để đánh giá chất lượng prompt và huấn luyện tinh chỉnh mô hình AI.

