# Báo Cáo Tiến Độ & Nghiệm Thu Hệ Thống Giáo Dục Trực Tuyến K–12 (Phong cách Khan Academy)

Dự án đã được triển khai và hoàn thiện bám sát 100% **Đặc Tả Kiến Trúc Hệ Thống (File PDF 12 trang)** cùng phong cách trải nghiệm chuẩn của **[Khan Academy](https://www.khanacademy.org/)**.

---

## 1. Tổng Quan Kiến Trúc Đã Triển Khai (Theo Đặc Tả PDF)

| Phân tầng / Thành phần | Công nghệ triển khai | Trạng thái kiểm thử |
| :--- | :--- | :--- |
| **Presentation (Frontend)** | **Next.js 16.4** (Turbopack), **React 19**, **TypeScript**, **Tailwind CSS v4** | Hoạt động (`http://localhost:3000`) |
| **Application (Backend)** | **Java 23**, **Spring Boot 3.3.4** (Mô hình **Modular Monolith**) | Hoạt động (`http://localhost:8080`) |
| **Database & Migration** | **PostgreSQL 17** (`learning_db`), **Flyway** (`V1`, `V2`, `V3`) | Đã migrate & seed dữ liệu |
| **Security & Auth** | **Spring Security** + **JJWT 0.12.6** (Thuật toán **HMAC-SHA512**) | Đã xác thực Bearer Token |
| **Video Streaming** | HTML5 Video Player + HLS Streaming + Định kỳ Heartbeat lưu tiến độ | Đã tích hợp sync tiến độ |
| **AI Assistants** | Chatbot Socratic Khanmigo (Học sinh) & Chatbot Quản trị (Admin) | Quota 30 câu/ngày, gợi mở tư duy |
| **Object Storage Simulation**| Cấp **Presigned S3 URL** có chữ ký & thời hạn (Tránh nghẽn CPU Spring Boot) | PDF Mục 8.2 & Mục 7 |

---

## 2. Các Module Backend & API Endpoints Đã Hoạt Động

### A. Xác thực & Hồ sơ cá nhân (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Xác thực tài khoản, trả về JWT token HMAC-SHA512 và hồ sơ người dùng.
- `POST /api/v1/auth/register`: Đăng ký tài khoản mới hỗ trợ đầy đủ 3 vai trò (Học sinh, Giáo viên, Phụ huynh).
- `GET /api/v1/auth/me`: Lấy thông tin phiên đăng nhập qua Bearer JWT.
- `PUT /api/v1/auth/profile`: Cập nhật họ tên, bio, và avatar URL.
- `POST /api/v1/auth/change-password`: Đổi mật khẩu có kiểm tra mã băm BCrypt.

### B. Học liệu & Khối lớp (`/api/v1/grades`, `/api/v1/subjects`, `/api/v1/lessons`)
- `GET /api/v1/grades`: Danh sách 12 khối lớp chuẩn K-12.
- `GET /api/v1/grades/{gradeId}/subjects`: Môn học theo khối lớp (Toán, Khoa học, Ngữ văn,...).
- `GET /api/v1/subjects/{subjectId}/lessons`: Danh sách bài học theo môn kèm trạng thái xuất bản.
- `GET /api/v1/lessons/{lessonId}/quiz`: Lấy câu hỏi trắc nghiệm kiểm tra độ tinh thông.

### C. Tiến độ học tập & Chấm điểm (`/api/v1/lessons/{id}/progress`, `/quiz/submit`)
- `PUT /api/v1/lessons/{lessonId}/progress`: Trình duyệt gửi heartbeat mỗi 10-15s lưu vị trí xem video và trạng thái bài học.
- `GET /api/v1/progress/summary`: Thống kê tổng số bài học hoàn thành, chuỗi ngày học liên tục (streak) và điểm năng lượng.
- `POST /api/v1/lessons/{lessonId}/quiz/submit`: Chấm điểm trắc nghiệm tự động, cấp điểm năng lượng và huy hiệu.

### D. Trí tuệ nhân tạo Socratic (`/api/v1/ai`)
- `POST /api/v1/ai/learning/chat`: Gia sư Khanmigo Socratic không giải bài hộ mà đặt câu hỏi dẫn dắt; tự động kiểm soát quota 30 câu hỏi/ngày.
- `POST /api/v1/ai/admin/chat`: Trợ lý hướng dẫn vận hành và cấu hình nghiệp vụ cho Quản trị viên & Giáo viên.
- `GET /api/v1/ai/sessions/{id}/history`: Lịch sử các lượt trao đổi theo phiên.

### E. Quản trị hệ thống & Kiểm toán (`/api/v1/admin`)
- `GET /api/v1/admin/reports/overview`: Báo cáo tổng quan số lượng học viên, bài học, lượt thi, chi phí AI và trạng thái JVM/HikariCP.
- `GET /api/v1/admin/users`: Danh sách người dùng theo vai trò RBAC.
- `PATCH /api/v1/admin/users/{id}/status`: Kích hoạt / vô hiệu hóa tài khoản (PDF Mục 5).
- `GET /api/v1/admin/audit-logs`: Danh sách nhật ký kiểm toán hệ thống.
- `POST /api/v1/admin/media/upload-url`: Cấp S3 Presigned URL để upload trực tiếp lên cloud storage.

---

## 3. Tài Khoản Thử Nghiệm Sẵn Có (Seed Database)

Mật khẩu chung cho các tài khoản seed là: `password123`

1. **Quản trị viên**: `username: admin` (Vai trò: `ADMIN`)
2. **Giáo viên**: `username: teacher_mai` (Vai trò: `TEACHER`)
3. **Học sinh 1**: `username: student_an` (Vai trò: `STUDENT` · 2,450 điểm năng lượng · Streak 7 ngày)
4. **Học sinh 2**: `username: hocsinh1` (Vai trò: `STUDENT` · 1,500 điểm năng lượng)

---

## 4. Tài Liệu API Tương Tác Trực Tiếp (Swagger OpenAPI 3)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI v3 JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- **Frontend App**: [http://localhost:3000](http://localhost:3000)

---

## 5. Tích Hợp Prisma ORM Trong Next.js Frontend
- **Phiên bản**: Prisma 6.4.0 + `@prisma/client` 6.4.0
- **File cấu hình & Schema**: `education-frontend/prisma/schema.prisma` (Introspect tự động 11 models từ PostgreSQL `learning_db`)
- **Singleton Client**: `education-frontend/src/lib/prisma.ts`
- **Biến môi trường**: `education-frontend/.env` (`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learning_db?schema=public"`)
- **Test Endpoint (Next.js API Route)**: [http://localhost:3000/api/prisma-test](http://localhost:3000/api/prisma-test)

