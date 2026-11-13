# 🛡️ 08. BẢO MẬT, GIÁM SÁT & VẬN HÀNH (SECURITY, DEVOPS & SRE)

> **Mục tiêu**: Chuẩn hóa toàn bộ quy trình bảo vệ an ninh hệ thống, phòng thủ đa tầng OWASP Top 10, giám sát số liệu đo lường thời gian thực (Prometheus/Grafana) và quy trình sao lưu, kiểm thử tải.

---

## 1. PHÒNG THỦ CHIỀU SÂU (DEFENSE IN DEPTH & OWASP TOP 10)

Hệ thống được thiết kế theo mô hình phòng thủ nhiều lớp độc lập:

| Lỗ hổng OWASP | Biện pháp kỹ thuật triển khai trong DMKLab |
| :--- | :--- |
| **A01: Broken Access Control** | Kiểm soát quyền ở cả cấp API URL và cấp phương thức Java (`@PreAuthorize("hasRole('ADMIN')")`). Mọi truy vấn bài học hoặc hồ sơ đều kiểm tra quyền sở hữu ID người dùng. |
| **A02: Cryptographic Failures** | Mật khẩu băm bằng **BCrypt** với Cost factor 12. Token JWT ký bằng **HMAC-SHA512** (Secret Key tối thiểu 512-bit). Ép buộc 100% kết nối qua HTTPS/TLS 1.3. |
| **A03: Injection (SQL / Prompt)** | 100% câu lệnh truy vấn cơ sở dữ liệu sử dụng Spring Data JPA / Hibernate với Prepared Statements tham số hóa. Bộ lọc Regex phát hiện và chặn các câu lệnh Prompt Injection/Jailbreak vào AI. |
| **A04: Insecure Design** | Hạn mức câu hỏi AI cố định (30 câu/ngày/học sinh). Rào cản bảo vệ chủ đề (Strict Topic Guardrail) ngăn chặn việc sử dụng AI sai mục đích học tập. |
| **A05: Security Misconfiguration** | Vô hiệu hóa toàn bộ endpoint Actuator nhạy cảm ra ngoài Internet (chỉ mở duy nhất `/actuator/health` và `/actuator/prometheus` cho mạng nội bộ). Thiết lập đầy đủ CSP, X-Frame-Options: DENY, HSTS. |
| **A06: Vulnerable Components** | Hệ thống quét phụ thuộc tự động qua GitHub Dependabot. Loại bỏ hoàn toàn các gói thư viện lỗi thời hoặc có rủi ro bảo mật. |
| **A07: Identification Failures** | Chống Brute Force đăng nhập thông qua Sliding-Window Rate Limiter. Thu hồi JWT tức thì khi Logout qua Redis Blacklist. |
| **A08: Software and Data Integrity** | Kiểm tra File Signature (Magic Bytes) nghiêm ngặt đối với mọi tệp tải lên (`FileSignatureValidator.java`), ngăn chặn việc đổi đuôi file để phát tán mã độc. |
| **A09: Security Logging & Monitoring** | Bảng `audit_logs` ghi nhận chi tiết mọi hành động quản trị, địa chỉ IP thực (`CF-Connecting-IP`) và thời gian thực hiện. |
| **A10: Server-Side Request Forgery (SSRF)** | Toàn bộ request gọi ra bên ngoài (Gemini, Groq, OpenAI, Cloudflare R2) đều được cấu hình danh sách URL đích cố định, tuyệt đối không nhận URL từ tham số người dùng. |

---

## 2. HỆ THỐNG GIÁM SÁT SỐ LIỆU ĐO LƯỜNG (PROMETHEUS & GRAFANA)

### 2.1 Cấu hình thu thập số liệu (Prometheus Scrape Config)
Trong `docker/monitoring/prometheus.yml`:
- Tần suất thu thập (Scrape Interval): **15 giây một lần**.
- Targets:
  - `education-backend:8080/actuator/prometheus`: JVM, HikariCP, HTTP Latency.
  - `postgres-exporter:9187`: Số lượng kết nối, Transaction Per Second (TPS), Cache Hit Ratio.
  - `redis-exporter:9121`: Bộ nhớ tiêu thụ, số lượng key, Hit/Miss Ratio.

### 2.2 Quy tắc cảnh báo tự động (Alert Rules - `alert_rules.yml`)
Hệ thống tích hợp sẵn các quy tắc cảnh báo sự cố nghiêm ngặt:
1. **Dịch vụ ngưng hoạt động (ServiceDown)**: Kích hoạt khi Backend hoặc Database ngừng phản hồi quá 1 phút.
2. **Bộ nhớ JVM quá tải (HighJvmMemoryUsage)**: Kích hoạt khi Heap Memory vượt quá **85%** liên tục trong 5 phút.
3. **Cơ sở dữ liệu nghẽn kết nối (DatabaseConnectionPoolSaturated)**: Kích hoạt khi HikariCP sử dụng trên **90%** số kết nối cho phép.
4. **Độ trễ API cao (HighHttpLatencyP95)**: Cảnh báo khi thời gian phản hồi P95 vượt quá **500ms** trong 5 phút.
5. **Tỉ lệ lỗi máy chủ cao (HighHttp5xxErrorRate)**: Cảnh báo khi tỉ lệ lỗi 5xx vượt quá **2%** tổng số request.

---

## 3. KỊCH BẢN KIỂM THỬ TẢI & CHỊU TẢI CAO (K6 LOAD TESTING)

Hệ thống đi kèm bộ kịch bản kiểm thử hiệu năng viết bằng **k6** (`scripts/load-test.js`):

### 3.1 Cấu hình kịch bản thử tải
```javascript
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Khởi động: Tăng dần lên 50 Virtual Users (VUs)
    { duration: '1m', target: 200 },   // Tải ổn định: 200 VUs học bài đồng thời
    { duration: '30s', target: 500 },  // Đỉnh điểm: Đột biến 500 VUs truy cập cùng lúc
    { duration: '30s', target: 0 },    // Giảm tải về 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'], // 95% request phải hoàn thành < 200ms
    http_req_failed: ['rate<0.01'],                 // Tỉ lệ lỗi phải dưới 1%
  },
};
```

### 3.2 Lệnh thực thi kiểm thử
```bash
# Chạy trực tiếp trên Linux / macOS / WSL
bash scripts/run-load-test.sh

# Hoặc chạy trực tiếp qua k6 CLI
k6 run scripts/load-test.js
```

---

## 4. CHIẾN LƯỢC SAO LƯU DỮ LIỆU TỰ ĐỘNG (DISASTER RECOVERY)

Tệp kịch bản sao lưu `scripts/backup-db.sh` đảm bảo an toàn tuyệt đối cho cơ sở dữ liệu:
- **Nguyên lý**: Sử dụng tiện ích `pg_dump` của PostgreSQL tạo bản chụp dữ liệu phi khóa (Non-blocking backup).
- **Nén dữ liệu**: Sử dụng thuật toán nén `gzip` mức tối ưu, giảm dung lượng file lưu trữ lên đến 80%.
- **Chính sách xoay vòng lưu trữ (Retention Policy)**: Tự động dọn dẹp và xóa các bản sao lưu cũ hơn **14 ngày**, đảm bảo không làm đầy ổ đĩa máy chủ.
- **Tự động hóa Cronjob**: Được lên lịch chạy tự động vào lúc **02:00 sáng mỗi ngày**.

---

## 5. ĐÓNG GÓI VÀ KHỞI CHẠY CONTAINER (DOCKER COMPOSE ORCHESTRATION)

Toàn bộ hệ sinh thái được định nghĩa trong `docker-compose.yml`:
- **postgres**: PostgreSQL 17 tối ưu tham số bộ nhớ `shared_buffers=512MB`, `work_mem=16MB`.
- **redis**: Redis 7 với cơ chế nén AOF và RDB định kỳ.
- **education-backend**: Container Java 21 chạy với cờ tối ưu `-XX:+UseG1GC -XX:+ExitOnOutOfMemoryError`.
- **education-frontend**: Next.js 16 chạy trong chế độ Node.js Alpine siêu nhẹ.
- **video-transcoder-worker**: Container Go tích hợp sẵn FFmpeg nhị phân.
- **live-gateway**: Container Go phục vụ cổng WebSocket phòng học.
- **prometheus / alertmanager / grafana**: Cụm giám sát hoàn chỉnh sẵn sàng sử dụng.

Lệnh khởi động toàn bộ hệ thống:
```bash
docker compose up -d
```
Lệnh kiểm tra trạng thái sức khỏe các container:
```bash
docker compose ps
```

