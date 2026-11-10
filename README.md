# DMKLab Education Platform - Tai Lieu Kien Truc He Thong

## 1. Tong Quan Du An

DMKLab Education la he thong giao duc truc tuyen K-12 hien dai, duoc thiet ke theo chuan chuong trinh Giao duc Pho thong 2018 (GDPT 2018) cua Bo Giao duc va Dao tao Viet Nam cho ca 3 cap hoc: Tieu hoc (Lop 1 - 5), Trung hoc Co so (Lop 6 - 9) va Trung hoc Pho thong (Lop 10 - 12).

He thong tich hop phuong phap giang day goi mo Socratic AI Tutor, nen tang so hoa Sach Giao Khoa tu ca 3 bo sach lon (Canh Dieu, Chan Troi Sang Tao, Ket Noi Tri Thuc), he thong danh gia thich ung (Mastery Learning), cong phu huynh, khong gian giao vien va he thong tich diem nang luong (Gamification).

Kien truc he thong duoc xay dung theo mo hinh Modular Monolith ket hop voi cac Sidecar microservice viet bang Golang de xu ly cac tac vu I/O cao, giup toi uu hoa hieu nang, tiet kiem tai nguyen phan cung va san sang cho moi truong van hanh quy mo lon.

---

## 2. So Do Kien Truc Tong The

```
[ Nguoi Dung (Hoc Sinh / Giao Vien / Phu Huynh / Quan Tri) ]
                       |
                       v
       [ Nginx Reverse Proxy & SSL Gateway (Port 80/443) ]
       +-------------------------------------------------+
       | - SSL Termination (Let's Encrypt / TLS 1.3)     |
       | - Cache-Control bat bien cho Static Assets      |
       | - Dinh tuyen thong nhat: /, /api, /ws, /ai-stream|
       +-------------------------------------------------+
          |                    |                  |
          | /                  | /api             | /ai-stream, /ws
          v                    v                  v
[ Next.js 16.4.5 Frontend ]   [ Spring Boot 3.3.4 ] [ Golang Sidecars ]
(Port 3000, SSR & PWA)        (Port 8080, Monolith) - Video Transcoder (8085)
- Solid Enterprise UI         - Identity & RBAC     - AI Stream Proxy (8086)
- Digital SGK E-Reader        - Academics Engine    - Live Gateway (8087)
- WebGL & Lite Mode (0% GPU)  - Assessment Engine  
- Service Worker Offline      - Socratic AI Engine  
                              - Notification Engine 
                                       |
                   +-------------------+-------------------+
                   |                   |                   |
                   v                   v                   v
        [ PostgreSQL 17 ]       [ Redis 7 Cache ]    [ Cloudflare R2 / S3 ]
        - Flyway V1 -> V6       - Multi-level Cache  - Zero-egress Object Storage
        - SSD/NVMe Engine Tune  - Rate Limiting      - HLS Video Segments
        - HikariCP Connection   - Session Blacklist  - Digital Book Assets
```

---

## 3. Cac Phan He Chuc Nang Cot Loi

### 3.1. Phan He Nhan Dien va Phan Quyen (Identity & Access Management)
- Co che xac thuc: JSON Web Token (JWT) su dung thuat toan chu ky HMAC-SHA512 voi do an toan cao.
- Mo hinh phan quyen (RBAC): Quan ly 4 nhom vai tro nghiem ngat:
  - STUDENT: Hoc sinh hoc bai, lam quiz, tich luy diem nang luong, hoi gia su AI.
  - TEACHER: Giao vien quan ly lop hoc, giao bai tap 15 phut/1 tiet, theo doi so diem va nhac hoc sinh chua nop bai.
  - PARENT: Phu huynh theo doi tien do hoc tap cua con va nhan bao cao tong ket tuan qua email.
  - SUPER_ADMIN: Quan tri toan quyen he thong, kiem soat chi phi OpenAI, nhat ky kiem toan Audit Log, quan tri noi dung.
- Dang nhap 1-Click SSO K-12: Ho tro dang nhap qua Google Workspace for Education va Microsoft 365, tu dong nhan dien email truong hoc (@thcs-chuvanan.edu.vn, @thcs-thucnghiem.edu.vn) de cap tai khoan voi 1,000 diem khoi tao.
- Silent Refresh Token va Token Rotation: Access Token ngan han ket hop Refresh Token (thoi han 7 ngay); moi lan refresh deu cap moi ca hai token de ngan chan replay attack.
- Bao ve chong Brute-force: Tu dong khoa tai khoan 15 phut neu dang nhap sai qua 5 lan lien tiep; co che danh sach den (Token Blacklist) vo hieu hoa token ngay khi dang xuat.

### 3.2. Phan He Khung Chuong Trinh K-12 (Academics & Curriculum Engine)
- Quan ly phan cap 12 khoi lop K-12 theo 3 cap hoc: Tieu hoc (Lop 1 - 5), Trung hoc Co so (Lop 6 - 9), Trung hoc Pho thong (Lop 10 - 12).
- Cau truc danh muc mon hoc tieu chuan: Toan hoc, Khoa hoc Tu nhien, Vat ly, Hoa hoc, Sinh hoc, Ngu van, Tin hoc, STEM.
- Cache phan cap: Toan bo danh muc khoi lop va mon hoc duoc luu cache Redis 30 phut voi co che tu dong xoa cache (Cache Evict) khi quan tri vien cap nhat.

### 3.3. Phan He Noi Dung va Tu Sach Giao Khoa So (Digital Textbook & Content Engine)
- Tich hop tu sach so hoa theo chuan 3 bo sach GDPT 2018 (Canh Dieu, Chan Troi Sang Tao, Ket Noi Tri Thuc).
- 3 che do trinh bay chuyen sau:
  - E-Reader Sach So: Trinh doc sach tuy bien phong chu (Merriweather, Inter, Monospace), co chu, che do giay doc (Trang ngoc, Sepia co, Dem toi).
  - Trinh Chieu Giang Day (Presentation Slides): Slide bai giang toan man hinh ho tro giao vien giang bai truc tiep tren lop.
  - So Do Tu Duy & Cong Thuc (Mindmap): Tong hop nhanh cac nhanh kien thuc va cong thuc toan hoc render bang LaTeX/KaTeX.
- Tich hop doc to van ban (Text-to-Speech) qua Web Speech API giong tieng Viet.
- Che do hoc ngoai tuyen (Offline PWA & Service Worker): Cache toan bo noi dung SGK va tai nguyen vao Cache Storage / IndexedDB giup hoc sinh vung sau vung xa hoc duoc ngay ca khi mat mang.
- Che do tiet kiem hieu nang (Lite Mode - 0% GPU): Cho phep chuyen doi giua mo hinh 3D WebGL va the minh hoa Vector tinh, giup may tinh cu phong tin hoc hoac dien thoai gia re chay muot ma.

### 3.4. Phan He Danh Gia va Tich Diem Nang Luong (Assessment & Gamification Engine)
- Danh gia thich ung (Adaptive Quiz): Nop bai trac nghiem, cham diem tu dong, tinh phan tram dung va giai thich chi tiet tung cau hoi.
- 4 cap do tinh thong (Mastery Levels) theo triet ly Khan Academy:
  - UNFAMILIAR: Chua hoc.
  - FAMILIAR: Lam quen (sau khi xem video bai giang).
  - PROFICIENT: Thanh thao (dat diem quiz tu 80% den 99%).
  - MASTERED: Tinh thong (dat 100% diem quiz).
- Atomic Energy Points Update: Cap nhat diem nang luong nguyen tu truc tiep tai tang database (UPDATE users SET energy_points = energy_points + :points), loai bo triet de loi Lost Update do race condition khi hoc sinh lam bai tren nhieu thiet bi.

### 3.5. Phan He Gia Su Tri Tue Nhan Tao (Socratic AI Tutor & Safety Guardrails)
- Phuong phap su pham Socratic: Gia su AI khong bao gio giai ho hoac dua ngay dap an cuoi cung, ma phan tich cau hoi va dat ra cac cau hoi goi y tung buoc de hoc sinh tu tu duy.
- 5 che do ho tro su pham:
  - SOCRATIC: Goi mo buoc tiep theo.
  - GRADE_ADAPTED: Dieu chinh ngon tu theo trinh do (Tieu hoc dung hinh tuong truc quan; THCS dung quy tac dai so; THPT dung ban chat toan hoc).
  - PRACTICE: Tao bai tap luyen tap tuong tac ngay sau khi giai thich.
  - ERROR_DIAGNOSIS: Phan tich nguyen nhan hoc sinh chon dap an sai va dinh huong sua.
  - CITE_LESSON: Trich dan dung moc thoi gian video va de muc sach giao khoa.
- Kiem duyet va bao ve du lieu hoc sinh:
  - Tu dong phat hien va chan thong tin ca nhan (PII): So dien thoai (+84/0x), CCCD (9-12 chu so), dia chi email.
  - Chan cac don tan cong Prompt Injection va Jailbreak (ignore previous instructions, DAN mode, bypass filter).
  - Kiem soat han muc su dung nghiem ngat: 30 cau hoi/hoc sinh/ngay, tu dong reset vao 00:00.
- Server-Sent Events (SSE) Streaming: Endpoint GET /api/v1/ai/learning/chat/stream ho tro truyen phan hoi tung chu theo thoi gian thuc voi TTFB < 100ms.

### 3.6. Phan He Thong Bao & Cong Phu Huynh (Notification Engine & Parent Portal)
- Multi-Provider Email Gateway: Ho tro Resend API (HTTPS direct), SMTP truyen thong va Sandbox Console Emulation.
- 3 mau email HTML chuyen nghiep:
  - OTP dat lai mat khau (hieu luc 15 phut).
  - Bao cao tong ket hoc tap tuan cho phu huynh (so gio hoc, so bai hoan thanh, diem trung binh, ky nang can bo tro).
  - Nhac nho hoc tap duy tri chuoi ngay hoc (Study Streak Retention).
- Khong gian phu huynh (Parent Portal): Theo doi bao cao thoi gian thuc, lien ket tai khoan con qua ma hoc sinh va gui email bao cao 1-click.

### 3.7. Phan He Khong Gian Giao Vien (Teacher Workspace)
- Quan ly danh sach lop hoc phu trach (si so, ty le hoan thanh khoa hoc, diem trung binh).
- Giao bai tap 15 phut va bai tap luyen tap cuoi tuan voi han nop cu the.
- So diem chi tiet tung hoc sinh voi phan loai tinh thong va tinh nang "Nhac hoc sinh chua nop bai" tu dong.
- Xuat so diem ra file CSV phuc vu cong tac bao cao nha truong.

### 3.8. Ba Microservice Phuc Vu Tuyen Tinh (Golang Sidecars)
- video-transcoder-worker (Port 8085): Cong nhan nen va phan doan video HLS da luong (Adaptive Bitrate 360p, 720p, 1080p) bang FFmpeg tu Cloudflare R2.
- ai-streaming-proxy (Port 8086): Sidecar dieu phoi ket noi SSE streaming, giu ket noi lau ma khong chiem dung luong Servlet cua Spring Boot.
- live-gateway (Port 8087): Gateway WebSocket xu ly trang thai truc tuyen thoi gian thuc (Presence Tracking, Live Study Room).

---

## 4. Toi Uu Hoa Co So Du Lieu & Bo Nho Dem

### 4.1. Cau Hinh May Chu PostgreSQL 17 Cho O Cung SSD/NVMe
PostgreSQL duoc tinh chinh truc tiep qua co khoi dong:
- random_page_cost = 1.1: Bao cho Query Planner biet he thong luu tru tren SSD sieu toc, luon uu tien Index Scan thay vi Sequential Scan.
- effective_io_concurrency = 200: Tan dung kha nang doc song song cua controller SSD.
- shared_buffers = 256MB va effective_cache_size = 768MB: Cap phat bo nho dem thich hop cho bang va chi muc.
- work_mem = 16MB: Tranh ghi file tam xuong dia khi sap xep va join bang lon.
- checkpoint_completion_target = 0.9 va wal_buffers = 16MB: Lam phang cac dot ghi xac nhan du lieu.

### 4.2. He Thong Chi Muc (Flyway Migrations V1 -> V6)
- V1: Khoi tao schema Identity, Academics, Content, Progress, AI Chat.
- V2: Nap du lieu mau chuan GDPT 2018 (12 khoi lop, mon hoc, bai giang, cau hoi quiz).
- V3: Mo rong truong thong tin nguoi dung (avatar, bio, so dien thoai, CCCD ma hoa).
- V4: Chi muc sap xep display_order mon hoc, bai giang va tien do hoc sinh.
- V5: Composite Index cho audit_logs(user_id, created_at DESC), learning_progress(user_id, last_accessed_at DESC), chat_messages(session_id, created_at ASC) va users(energy_points DESC).
- V6: Chi muc quiz_questions(lesson_id, display_order) giup tai bai thi tuc thi, chat_sessions(user_id, session_type, created_at DESC) va chi muc LOWER(email) cho dang nhap SSO 1-Click sieu toc.

### 4.3. HikariCP Connection Pool & Hibernate Batching
- HikariCP: maximum-pool-size = 15, minimum-idle = 5, leak-detection-threshold = 20000ms.
- PostgreSQL PreparedStatement Cache: cachePrepStmts = true, prepStmtCacheSize = 250, useServerPrepStmts = true.
- Hibernate Batching: hibernate.default_batch_fetch_size = 32 triet tieu loi N+1 Query; reWriteBatchedInserts = true gop hang chuc lenh INSERT thanh 1 transaction duy nhat.

### 4.4. Redis 7 Multi-Level Cache & Rate Limiting
- Cache phan tang:
  - Danh muc khoi lop (cache:grades) - TTL 30 phut.
  - Danh muc mon hoc (cache:subjects) - TTL 30 phut.
  - Danh sach bai hoc theo mon (cache:lessons:subject) - TTL 30 phut.
  - Chi tiet bai hoc & Quiz (cache:lesson:detail, cache:lesson:quiz) - TTL 30 phut.
- Rate Limiting (Token Bucket Filter):
  - AUTH_LOGIN: Toi da 5 yeu cau / phut / IP.
  - AUTH_REGISTER: Toi da 3 yeu cau / 30 phut / IP.
  - AI_CHAT: Toi da 15 yeu cau / phut / IP.
  - EMAIL_NOTIFY: Toi da 3 yeu cau / phut / IP.

---

## 5. Ha Tang Nginx, Giam Sat & Sao Luu Tu Dong

### 5.1. Nginx Reverse Proxy
- Tu dong chuyen huong HTTP (Port 80) sang HTTPS (Port 443) voi HTTP/2.
- Bao mat Transport Security: HSTS (max-age=31536000), X-Frame-Options SAMEORIGIN, nosniff, XSS protection.
- Toi uu hoa Static Cache:
  - /_next/static/: Cache-Control: public, max-age=31536000, immutable (1 nam khong tai lai).
  - Anh, font, icons: Cache-Control: public, max-age=2592000, stale-while-revalidate=86400 (30 ngay).

### 5.2. He Thong Giam Sat Prometheus & Grafana
- Prometheus dinh ky thu thap metrics tu Spring Boot qua endpoint /actuator/prometheus.
- Dashboard Grafana K-12 duoc cau hinh san theo doi:
  - So luong ket noi dong thoi (CCU).
  - Do tre phan hoi P95 va P99 cua he thong.
  - Ty le Cache Hit / Cache Miss tren Redis.
  - Tinh trang tai nguyen CPU, RAM, JVM Heap va HikariCP Connection Pool.

### 5.3. Kich Ban Sao Luu Tu Dong PostgreSQL
File scripts/backup-db.sh tu dong:
- Chay pg_dump nen gzip muc do cao nhat (gzip -9).
- Dong bo ban sao luu len bucket Cloudflare R2 / AWS S3.
- Tu dong xoa cac ban sao luu cu qua 30 ngay tai may chu de tiet kiem dung luong.

---

## 6. Cau Truc Thu Muc Du An

```
DMKlab-Project/
├── .github/
│   └── workflows/
│       └── ci.yml                   # Pipeline CI/CD GitHub Actions tu dong build & test
├── ai-streaming-proxy/              # Golang Sidecar: Streaming SSE proxy (Port 8086)
├── docker/
│   ├── monitoring/
│   │   ├── grafana/                 # Dashboards & Datasources cau hinh san cho Grafana
│   │   └── prometheus.yml           # Cau hinh scrape metrics tu Spring Boot
│   └── nginx/
│       ├── Dockerfile
│       ├── entrypoint.sh
│       └── nginx.conf               # Cau hinh Nginx Reverse Proxy, SSL & Cache
├── docker-compose.yml               # File compose khoi chay 10 containers dong bo
├── education-backend/               # Spring Boot 3.3.4 Modular Monolith Backend
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/example/learning/
│       │   │   ├── academics/       # Khoi lop & Mon hoc
│       │   │   ├── admin/           # Tong quan he thong, so diem giao vien, cong phu huynh
│       │   │   ├── ai/              # Socratic AI Tutor, Safety Filters, SSE Streaming
│       │   │   ├── assessment/      # Cham thi Quiz thich ung, Gamification
│       │   │   ├── audit/           # Nhat ky kiem toan he thong
│       │   │   ├── content/         # Bai giang & Cau hoi trac nghiem
│       │   │   ├── identity/        # Tai khoan, RBAC, JWT, OAuth 1-Click SSO
│       │   │   ├── platform/        # Security, Caching, Email Gateway, Rate Limiting, Storage
│       │   │   └── progress/        # Tien do xem video & hoc tap
│       │   └── resources/
│       │       ├── application.yml  # Cau hinh ket noi Database, Redis, S3, JWT, Mail
│       │       └── db/migration/    # 6 ban Flyway SQL migrations tu V1 den V6
│       └── test/                    # 26 ban kiem thu Unit & Integration Tests
├── education-frontend/              # Next.js 16.4.5 App Router Frontend
│   ├── package.json
│   ├── public/
│   │   ├── manifest.json            # PWA Manifest
│   │   └── sw.js                    # Offline Service Worker cho Sach Giao Khoa So
│   └── src/
│       ├── app/                     # Next.js App Router (/, /books, /dashboard, /admin)
│       ├── components/              # Header, Footer, Spline 3D Viewer (WebGL & Lite Mode)
│       ├── features/                # Modules nghiep vu (auth, books, student, admin, parent)
│       └── lib/                     # API client, Mock Data fallback, Context Providers
├── live-gateway/                    # Golang Sidecar: WebSocket presence gateway (Port 8087)
├── scripts/
│   └── backup-db.sh                 # Kich ban tu dong backup PostgreSQL len Cloudflare R2
└── video-transcoder-worker/         # Golang Sidecar: FFmpeg HLS Transcoder worker (Port 8085)
```

---

## 7. Huong Dan Cai Dat va Khoi Chay

### 7.1. Yeu Cau Moi Truong
- Java Development Kit (JDK) 21 tro len.
- Apache Maven 3.9 tro len.
- Node.js 20 tro len va pnpm (v9+).
- Docker va Docker Compose (neu khoi chay bang container).
- PostgreSQL 17 va Redis 7 (neu khoi chay truc tiep khong qua Docker).

### 7.2. Khoi Chay Bang Docker Compose (Khuyen Nghi)
Khoi chay toan bo 10 dich vu trong he sinh thai (Frontend, Backend, 3 Sidecars, PostgreSQL, Redis, MinIO, Nginx, Prometheus, Grafana):

```bash
# 1. Sao chep file bien moi truong
cp .env.example .env

# 2. Khoi chay toan bo cum container o che do chay ngam
docker compose up -d --build

# 3. Kiem tra trang thai hoat dong cua cac container
docker compose ps
```

### 7.3. Khoi Chay Thu Cong Tung Thanh Phan (Moi Truong Development)

#### Backend (Spring Boot 3.3.4):
```bash
cd education-backend
mvn clean spring-boot:run
```
Backend se khoi chay tai dia chi: `http://localhost:8080` (Tai lieu Swagger UI tai: `http://localhost:8080/swagger-ui.html`).

#### Frontend (Next.js 16.4.5):
```bash
cd education-frontend
pnpm install
pnpm dev
```
Frontend se khoi chay tai dia chi: `http://localhost:3000`.

---

## 8. Danh Muc Bien Moi Truong (Environment Variables)

| Bien Moi Truong | Gia Tri Mac Dinh | Mo Ta |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Cong lang nghe cua Spring Boot Backend |
| `DB_HOST` | `localhost` (hoac `postgres` trong Docker) | Dia chi may chu PostgreSQL |
| `DB_PORT` | `5432` | Cong ket noi PostgreSQL |
| `DB_NAME` | `learning_db` | Ten co so du lieu |
| `DB_USER` | `postgres` | Tai khoan ket noi database |
| `DB_PASSWORD` | `postgres` | Mat khau ket noi database |
| `REDIS_HOST` | `localhost` (hoac `redis` trong Docker) | Dia chi may chu Redis Cache |
| `REDIS_PORT` | `6379` | Cong ket noi Redis |
| `JWT_SECRET` | Chuoi bi mat HMAC-SHA512 | Khoa ky bao mat JWT Token |
| `STORAGE_PROVIDER` | `r2` (hoac `minio`, `s3`) | Nha cung cap luu tru video va tai nguyen |
| `R2_ACCOUNT_ID` | (De trong neu dung MinIO) | ID tai khoan Cloudflare R2 |
| `R2_BUCKET` | `education-media` | Ten bucket luu tru phan doan HLS |
| `EMAIL_PROVIDER` | `resend` (hoac `console`) | Cong dich vu gui email |
| `RESEND_API_KEY` | (API Key Resend) | Khoa API dich vu gui mail Resend |
| `OPENAI_API_KEY` | `mock-key` | Khoa API OpenAI phuc vu Socratic AI Tutor |
| `OPENAI_MODEL` | `gpt-4o-mini` | Mo hinh ngon ngu lon su dung |

---

## 9. Giay Phep va Ban Quyen

Du an duoc phat trien boi doi ngu ky su DMKLab Education Platform. Ban quyen thuoc ve DMKLab Education System 2026.
