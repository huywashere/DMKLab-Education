# 🏛️ 01. TỔNG QUAN KIẾN TRÚC HỆ THỐNG WEB (ARCHITECTURE OVERVIEW)

> **Mục tiêu**: Định hình kiến trúc tổng thể, mô hình phân tầng, nguyên lý giao tiếp giữa các thành phần và phân tích công nghệ lựa chọn cho hệ sinh thái **DMKLab Education Platform**.

---

## 1. NGUYÊN LÝ THIẾT KẾ CỐT LÕI (CORE DESIGN PRINCIPLES)

1. **Kiến trúc Modular Monolith kết hợp Event-Driven Workers**:
   - Nhân xử lý nghiệp vụ chính (`education-backend`) được tổ chức theo mô hình **Modular Monolith** trên nền tảng **Spring Boot 3.4 (Java 21)**. Kiến trúc này mang lại sự đơn giản trong triển khai, giảm thiểu chi phí quản lý hạ tầng so với microservices phân tán quá sớm, nhưng vẫn đảm bảo tính độc lập cao giữa các module nghiệp vụ (`identity`, `academics`, `content`, `assessment`, `progress`, `ai`, `platform`).
   - Các tác vụ tiêu tốn CPU/I/O lớn và yêu cầu đồng thời cao (Transcoding video FFmpeg, WebSocket Live Hub, AI Streaming Proxy) được tách biệt thành các **Worker viết bằng ngôn ngữ Go**, giao tiếp phi đồng bộ qua Redis Queue và Pub/Sub.

2. **Nguyên lý Lưu trữ Tối ưu Chi phí (Zero Egress Cost Architecture)**:
   - Toàn bộ video bài giảng phân đoạn HLS, ảnh chụp, tài liệu học tập được lưu trữ trực tiếp trên **Cloudflare R2**.
   - Trình duyệt học sinh/giáo viên tải file lên R2 thông qua cơ chế **S3 Presigned URL** do Spring Boot cấp phát. Dữ liệu nhị phân không đi qua máy chủ ứng dụng, giúp giảm tải 100% băng thông tải lên cho Backend và không mất phí truyền tải dữ liệu (0đ Egress).

3. **Solid Enterprise UI & Tiêu chuẩn Accessibility WCAG 2.1**:
   - Giao diện được thiết kế theo trường phái **Solid Surface (Màu đặc phẳng doanh nghiệp)**, loại bỏ triệt để hiệu ứng làm mờ kính (`backdrop-blur`) nhằm đảm bảo tốc độ dựng hình đạt mượt mà **60fps** trên cả các thiết bị học sinh cấu hình thấp.
   - Độ tương phản màu sắc đạt chuẩn WCAG 2.1 AA/AAA, tối ưu trải nghiệm đọc tài liệu sách giáo khoa nhiều giờ liên tục.

4. **Trợ lý Socratic AI 2.0 & An toàn Sư phạm K-12**:
   - Áp dụng phương pháp sư phạm Socratic (gợi mở tư duy từng bước, không giải hộ đáp án).
   - Tích hợp **Động cơ Crawl tài liệu hệ thống & Rào cản bảo vệ chủ đề (Strict Topic Guardrail)** nhằm triệt tiêu hiện tượng AI nói lan man, trả lời sai lệch (Hallucination) hoặc trả lời các chủ đề ngoài học thuật.

---

## 2. BẢN ĐỒ CÔNG NGHỆ (TECHNOLOGY STACK)

| Phân tầng | Công nghệ lựa chọn | Phiên bản | Vai trò & Lý do lựa chọn |
| :--- | :--- | :---: | :--- |
| **Frontend Framework** | Next.js (App Router) | 16.4.5 | Server-Side Rendering (SSR), Static Site Generation (SSG), Turbopack tối ưu build siêu tốc |
| **UI Library & State** | React 19 + TypeScript | 19.x / 5.x | Quản lý kiểu tĩnh nghiêm ngặt, React Hooks, Context API |
| **Styling & Icons** | Tailwind CSS + React Icons | 4.x / 5.x | Thiết kế Solid UI hiện đại, tiện ích utility-first, không phát sinh CSS dư thừa |
| **Math & Media** | KaTeX + Plyr.js + HLS.js | Mới nhất | Hiển thị công thức toán học LaTeX chuẩn xác, phát video trực tuyến phân đoạn thích ứng |
| **Backend Core** | Spring Boot | 3.4.0 | Nền tảng doanh nghiệp ổn định, kiến trúc Spring Security 6, Spring Data JPA, Actuator |
| **Ngôn ngữ Backend** | Java (OpenJDK) | 21 LTS | Virtual Threads (Project Loom), Pattern Matching, Garbage Collector ZGC/G1 độ trễ thấp |
| **Background Workers** | Go (Golang) | 1.22+ | Đa nhiệm goroutine siêu nhẹ, biên dịch nhị phân trực tiếp cho Video Transcoder & Live Hub |
| **Cơ sở dữ liệu chính** | PostgreSQL | 17.x | RDBMS mạnh mẽ, hỗ trợ JSONB, chỉ mục B-Tree Composite, Prepared Statements tối ưu |
| **Database Migration** | Flyway | 10.x | Kiểm soát phiên bản schema tự động từ V1 đến V7, an toàn tuyệt đối khi triển khai CI/CD |
| **Cache & Message Queue** | Redis | 7.x | Sliding-window Rate Limiting, Semantic Prompt Cache, Token Blacklist, Job Queue |
| **Object Storage** | Cloudflare R2 (S3 API) | Cloud | Lưu trữ video HLS, tài liệu SGK, avatar người dùng với chính sách 0đ phí truyền tải |
| **Giám sát & Đo lường** | Prometheus + Alertmanager | Mới nhất | Thu thập metric hệ thống (CPU, RAM, HikariCP, JVM, HTTP Latency) và kích hoạt cảnh báo |
| **Trực quan hóa** | Grafana | Mới nhất | Dashboard giám sát thời gian thực cho kỹ sư vận hành và quản trị hệ thống |
| **AI Cloud Gateway** | Gemini 2.5, Groq, OpenAI | Cloud | Động cơ suy luận Socratic đa tầng kết hợp Semantic Cache tiết kiệm 95% chi phí |

---

## 3. CÁC PHÂN VÙNG MẠNG VÀ BẢO VỆ (NETWORK & SECURITY ZONES)

```mermaid
graph TD
    subgraph PublicZone ["VÙNG CÔNG CỘNG (PUBLIC INTERNET)"]
        UserDevice["Thiết bị Học sinh / Phụ huynh / Giáo viên"]
    end

    subgraph EdgeZone ["VÙNG BIÊN (CLOUDFLARE EDGE & CDN)"]
        WAF["Cloudflare Web Application Firewall\n• Chống DDoS L3/L4/L7\n• Giới hạn tần suất tầng biên\n• SSL/TLS Termination"]
        R2Edge["Cloudflare R2 Storage CDN\n• Phân phối HLS Video (.m3u8, .ts)\n• File PDF / Sách giáo khoa"]
    end

    subgraph DMZZone ["VÙNG BẢO MẬT TRUNG GIAN (DMZ - REVERSE PROXY)"]
        Nginx["Reverse Proxy / API Gateway\n• Điều hướng /api sang Backend\n• Điều hướng /ws sang Live Gateway\n• Trực tiếp phục vụ Next.js Frontend"]
    end

    subgraph AppZone ["VÙNG ỨNG DỤNG NỘI BỘ (APPLICATION PRIVATE NETWORK)"]
        FE["Next.js 16 SSR Node Process\n(Port 3000)"]
        BE["Spring Boot 3.4 Core\n(Port 8080)"]
        Worker["Go Video Transcoder\n(Redis Consumer)"]
        LiveHub["Go Live Gateway\n(Port 8081 WebSocket)"]
    end

    subgraph SecureDataZone ["VÙNG DỮ LIỆU ĐẶC BIỆT BẢO MẬT (ISOLATED DATA ZONE)"]
        DB[("PostgreSQL 17 Database\n(Port 5432 - Chỉ chấp nhận IP nội bộ)")]
        RedisDB[("Redis 7 In-Memory DB\n(Port 6379 - Có Password Auth)")]
    end

    UserDevice -->|HTTPS / WSS| WAF
    WAF --> Nginx
    WAF -.->|Direct Static/Video Fetch| R2Edge
    Nginx --> FE
    Nginx --> BE
    Nginx --> LiveHub

    BE --> DB
    BE --> RedisDB
    Worker --> RedisDB
    Worker --> R2Edge
    LiveHub --> RedisDB
```

---

## 4. CÁC LUỒNG DỮ LIỆU ĐIỂN HÌNH (END-TO-END DATA FLOWS)

### 4.1 Luồng Học tập Video & Đồng bộ tiến độ
```mermaid
sequenceDiagram
    autonumber
    actor Student as Học sinh
    participant Client as Next.js Web App
    participant BE as Spring Boot Core
    participant R2 as Cloudflare R2 CDN
    participant DB as PostgreSQL 17

    Student->>Client: Mở bài học (LessonRoom)
    Client->>BE: GET /api/v1/content/lessons/{id} (Kèm Bearer JWT)
    BE->>DB: Truy vấn thông tin bài học & URL video
    DB-->>BE: Metadata bài học + Cloudflare R2 video URL
    BE-->>Client: Trả về thông tin bài giảng
    Client->>R2: Yêu cầu luồng phát HLS (master.m3u8)
    R2-->>Client: Phân đoạn video thích ứng (720p/1080p chunks)
    loop Định kỳ 15 giây (Heartbeat)
        Client->>BE: POST /api/v1/progress/heartbeat {lessonId, watchedSeconds}
        BE->>DB: Cập nhật thời lượng học & cộng điểm Energy Points
    end
```

### 4.2 Luồng Hỏi đáp Gia sư Socratic AI (Kèm Crawl SGK & Topic Guardrail)
```mermaid
sequenceDiagram
    autonumber
    actor Student as Học sinh
    participant ChatUI as Socratic Chatbot UI
    participant BE as Spring Boot Core
    participant Crawler as System Knowledge Crawler
    participant Redis as Redis Cache
    participant LLM as Google Gemini / Groq API

    Student->>ChatUI: Gửi câu hỏi bài học (hoặc chọn Mode sư phạm)
    ChatUI->>BE: POST /api/v1/ai/learning/chat (Message, Grade, Context)
    BE->>BE: Kiểm tra hạn mức học sinh (tối đa 30 câu/ngày)
    BE->>Crawler: crawlAndGroundKnowledge(message, grade, subject, context)
    Crawler-->>BE: Kết quả Crawl SGK + Rào cản chủ đề (OnTopic: true/false)
    
    alt Câu hỏi bị LẠC ĐỀ (Off-Topic)
        BE-->>ChatUI: Trả về lời nhắc nhở sư phạm + Nút gợi ý quay lại bài học
    else Câu hỏi ĐÚNG CHỦ ĐỀ (On-Topic)
        BE->>Redis: Kiểm tra SHA-256 Semantic Prompt Cache
        alt Cache HIT
            Redis-->>BE: Phản hồi chuẩn (0ms, 0đ token)
        else Cache MISS
            BE->>LLM: Gọi API kèm System Prompt Socratic + SGK In-Context Grounding
            LLM-->>BE: Phản hồi sư phạm dẫn dắt + Công thức LaTeX
            BE->>Redis: Lưu phản hồi vào Cache (TTL 24h)
        end
        BE-->>ChatUI: Trả về câu trả lời gợi mở + Trích dẫn SGK tương tác
    end
```

### 4.3 Luồng Tải lên Video & Chuyển mã Tự động (Video Transcoding Pipeline)
```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giáo viên / Admin
    participant Client as Admin Dashboard
    participant BE as Spring Boot Core
    participant R2 as Cloudflare R2 Storage
    participant Redis as Redis Job Queue
    participant Worker as Go Video Transcoder

    Teacher->>Client: Chọn video bài giảng (.mp4, 500MB)
    Client->>BE: POST /api/v1/storage/presigned-upload {filename, contentType}
    BE-->>Client: S3 Presigned URL có thời hạn (15 phút)
    Client->>R2: PUT file video trực tiếp từ trình duyệt lên R2
    R2-->>Client: 200 OK (Tải lên thành công 0đ băng thông server)
    Client->>BE: POST /api/v1/content/lessons (Lưu bài học với raw video path)
    BE->>Redis: LPUSH hàng đợi video:transcode:queue {rawKey, lessonId}
    Worker->>Redis: BRPOP nhận job chuyển mã
    Worker->>R2: Kéo raw video về thư mục tạm
    Worker->>Worker: FFmpeg chuyển mã đa độ phân giải (360p, 720p, 1080p HLS)
    Worker->>R2: Upload các file playlist .m3u8 và các chunks .ts
    Worker->>BE: POST Webhook thông báo hoàn thành chuyển mã
    BE->>BE: Đánh dấu bài học Published và kích hoạt cho học sinh
```

