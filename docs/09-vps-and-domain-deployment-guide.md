# 🚀 CẨM NANG TRIỂN KHAI HẠ TẦNG VPS & GẮN TÊN MIỀN (TURNKEY PRODUCTION DEPLOYMENT)

> **Dự án**: DMKLab Education Platform (K-12)  
> **Mục tiêu**: Hướng dẫn trọn gói triển khai hạ tầng từ A-Z. Chỉ việc thuê VPS, trỏ tên miền và chạy đúng 2 câu lệnh là toàn bộ nền tảng giáo dục hoạt động với HTTPS và tường lửa bảo mật.

---

## 📋 1. YÊU CẦU CẤU HÌNH VPS (VIRTUAL PRIVATE SERVER)

| Tiêu chí | Cấu hình tối thiểu | Cấu hình khuyến nghị (Production >1,000 học sinh) |
| :--- | :--- | :--- |
| **Hệ điều hành** | Ubuntu 22.04 LTS / Ubuntu 24.04 LTS (x86_64) hoặc Debian 12 | Ubuntu 24.04 LTS (x86_64) |
| **CPU** | 2 vCPU | 4 vCPU hoặc 8 vCPU |
| **Bộ nhớ RAM** | 2GB - 4GB *(Script sẽ tự động tạo 4GB Swap file chống OOM)* | 8GB - 16GB RAM |
| **Ổ cứng lưu trữ** | 30GB SSD / NVMe | 80GB - 150GB SSD NVMe |
| **Băng thông mạng** | 100 Mbps (Không giới hạn lưu lượng) | 1 Gbps |
| **Nhà cung cấp gợi ý** | Hetzner (Cloud CX32), DigitalOcean, Vultr, Linode, AWS EC2, Viettel IDC, VNPT | Hetzner Dedicated / AWS c6i.xlarge |

---

## 🌐 2. HƯỚNG DẪN TRỎ TÊN MIỀN (DNS CONFIGURATION)

Trước khi chạy script triển khai, bạn cần truy cập trang quản lý tên miền (như Cloudflare, Namecheap, GoDaddy, Mắt Bão, PA Việt Nam, v.v.) và cấu hình 2 bản ghi sau:

### 2.1 Bảng cấu hình DNS chuẩn
Giả sử tên miền của bạn là `dmklab.edu.vn` và địa chỉ IP công khai của VPS là `103.82.195.45`:

| Loại bản ghi (Type) | Tên bản ghi (Host / Name) | Giá trị trỏ đến (Value / Target) | TTL | Proxy Status (Nếu dùng Cloudflare) |
| :---: | :---: | :---: | :---: | :---: |
| **A** | `@` *(hoặc để trống)* | `103.82.195.45` | Auto / 300s | **Proxied** (Đám mây màu cam) hoặc DNS Only |
| **A** *(hoặc CNAME)* | `www` | `103.82.195.45` *(hoặc `dmklab.edu.vn`)* | Auto / 300s | **Proxied** (Đám mây màu cam) hoặc DNS Only |

### 2.2 Nếu bạn sử dụng Cloudflare (Khuyên dùng)
- **Ưu điểm**: Ẩn giấu địa chỉ IP gốc của VPS, tự động lọc tấn công DDoS L3/L4/L7, bật bộ đệm CDN toàn cầu.
- **Cài đặt SSL/TLS trên Cloudflare Dashboard**:
  1. Vào menu **SSL/TLS** -> Chọn chế độ **Full** hoặc **Full (strict)**.
  2. Hệ thống Nginx của DMKLab đã được tích hợp sẵn danh dải IP của Cloudflare và thiết lập `real_ip_header CF-Connecting-IP`, giúp nhận diện đúng 100% IP thực của học sinh Việt Nam.

---

## 🛠️ 3. QUY TRÌNH TRIỂN KHAI 1-CLICK TRÊN VPS

### Bước 1: Kết nối SSH vào VPS
Sử dụng Terminal (macOS/Linux) hoặc PowerShell / PuTTY (Windows):
```bash
ssh root@<IP_CỦA_VPS>
```

### Bước 2: Tải mã nguồn về máy chủ
```bash
# Tạo thư mục và tải mã nguồn dự án
cd /opt
git clone https://github.com/huywashere/DMKLab-Education.git dmklab-education
cd dmklab-education
```

### Bước 3: Chạy script thiết lập hạ tầng tự động (Chạy 1 lần duy nhất)
Script này sẽ tự động:
1. Cập nhật hệ thống Ubuntu.
2. Kiểm tra RAM và **tự động tạo 4GB Swap file** (đảm bảo VPS không bao giờ bị tràn RAM khi biên dịch Next.js và chạy Java Spring Boot).
3. Tối ưu tham số mạng Linux Kernel (`net.core.somaxconn`, `vm.max_map_count`, `fs.file-max`).
4. Cài đặt Docker Engine & Docker Compose V2 chính thức.
5. Thiết lập tường lửa UFW theo tiêu chuẩn Zero-Trust: **Chỉ mở cổng 22 (SSH), 80 (HTTP), 443 (HTTPS)**, khóa chặt toàn bộ cổng cơ sở dữ liệu Postgres 5432 và Redis 6379 khỏi nguy cơ bị quét từ Internet.
6. Cài đặt Fail2ban ngăn chặn brute-force SSH.

```bash
sudo bash scripts/setup-vps.sh
```

---

### Bước 4: Thiết lập file cấu hình môi trường (.env)
Sao chép file mẫu dành cho sản xuất và chỉnh sửa tên miền:
```bash
cp .env.production.example .env
nano .env
```

Điền các thông tin quan trọng:
```ini
# 1. Tên miền thực tế của bạn
DOMAIN_NAME=dmklab.edu.vn
LETSENCRYPT_EMAIL=admin@dmklab.edu.vn

# 2. Khóa bảo mật JWT và mật khẩu cơ sở dữ liệu
DB_PASSWORD=TaoMatKhauDatabaseManhTaiDay2026!
JWT_SECRET=TaoKhoaBiMatJWTDaiHon64KyTuVoiDoPhucTapCao2026

# 3. API Key cho Gia sư Trí tuệ Nhân tạo Socratic AI (Miễn phí)
# Lấy Gemini miễn phí tại: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSy...
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash

# 4. Lưu trữ Video bài giảng (Cloudflare R2 - Miễn phí băng thông tải về)
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=8ab295e87a2c019d45e543666d9b4b0e
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_PUBLIC_URL=https://media.dmklab.edu.vn
```
*(Bấm `Ctrl + O` -> `Enter` để lưu, `Ctrl + X` để thoát nano).*

---

### Bước 5: Chạy lệnh triển khai tổng lực (Deploy)
```bash
bash scripts/deploy.sh
```

Script triển khai sẽ tự động:
- Kiểm tra tính hợp lệ của DNS trỏ về IP VPS.
- Biên dịch song song toàn bộ các container:
  - `education_postgres` (PostgreSQL 16 + pgvector)
  - `education_redis` (Redis 7 In-Memory Caching)
  - `education_backend` (Spring Boot 3.4 & Java 21)
  - `education_frontend` (Next.js 16.4 & React 19)
  - `education_video_worker` (Go & FFmpeg Transcoder)
  - `education_ai_proxy` (Go SSE Streaming Proxy)
  - `education_live_gateway` (Go WebSocket Hub)
  - `education_nginx_gateway` (Nginx Reverse Proxy & SSL)
  - `education_certbot` (Let's Encrypt Companion)
- Kiểm tra sức khỏe hệ thống (Healthcheck) cho đến khi Backend đạt `HTTP 200`.
- Tự động gọi Certbot xin cấp chứng chỉ **SSL HTTPS** từ tổ chức Let's Encrypt và nạp vào Nginx mà không làm gián đoạn dịch vụ.

Sau khi script chạy xong, bạn sẽ thấy thông báo:
```text
====================================================================
       TRIỂN KHAI NỀN TẢNG DMKLAB EDUCATION THÀNH CÔNG!             
====================================================================
🌐 Website chính thức    : https://dmklab.edu.vn
🔌 API Backend Gateway  : https://dmklab.edu.vn/api/v1
📚 Swagger UI API Docs  : https://dmklab.edu.vn/api/swagger-ui.html
🤖 Gia sư Socratic AI   : Kích hoạt (SSE Streaming 25ms/token)
🎥 Trình nén video HLS  : Kích hoạt (Transcoder Worker)
====================================================================
```

---

## 🔒 4. QUẢN LÝ CHỨNG CHỈ SSL HTTPS

### 4.1 Cấp hoặc làm mới chứng chỉ thủ công
Nếu bạn vừa đổi tên miền hoặc muốn cấp chứng chỉ lại:
```bash
bash scripts/init-ssl.sh yourdomain.com admin@yourdomain.com
```

### 4.2 Tự động gia hạn (Auto-Renewal)
Container `education_certbot` đã được thiết lập chạy nền và tự động kiểm tra gia hạn chứng chỉ mỗi **12 giờ**. Trước khi chứng chỉ hết hạn 30 ngày, Certbot sẽ tự động gia hạn và Nginx sẽ tự động áp dụng chứng chỉ mới mà không cần can thiệp thủ công.

---

## 🔄 5. TỰ ĐỘNG KHỞI ĐỘNG CÙNG VPS (SYSTEMD AUTOSTART)

Để đảm bảo toàn bộ hệ thống web tự động bật lại nếu VPS bị khởi động lại (Reboot) hoặc mất điện:
```bash
sudo cp scripts/dmklab.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable dmklab.service
```

Kiểm tra trạng thái dịch vụ:
```bash
sudo systemctl status dmklab.service
```

---

## 📈 6. VẬN HÀNH & BẢO TRÌ THƯỜNG NHẬT (DAY-2 OPERATIONS)

### 6.1 Cập nhật mã nguồn phiên bản mới (Zero-Downtime Update)
Khi có tính năng mới từ kho GitHub, bạn chỉ cần thực hiện 2 lệnh:
```bash
cd /opt/dmklab-education
git pull origin main
bash scripts/deploy.sh
```

### 6.2 Xem log các container theo thời gian thực
```bash
# Xem log toàn bộ hệ thống
docker compose -f docker-compose.prod.yml logs -f

# Xem riêng log của Backend Spring Boot
docker compose -f docker-compose.prod.yml logs -f backend

# Xem riêng log của Frontend Next.js
docker compose -f docker-compose.prod.yml logs -f frontend

# Xem riêng log của Nginx Reverse Proxy
docker compose -f docker-compose.prod.yml logs -f nginx_gateway
```

### 6.3 Tự động sao lưu cơ sở dữ liệu (Automated DB Backup Cronjob)
Cài đặt lịch sao lưu cơ sở dữ liệu hàng ngày vào lúc **02:00 sáng**:
```bash
# Mở crontab
crontab -e

# Thêm dòng sau vào cuối file:
0 2 * * * /bin/bash /opt/dmklab-education/scripts/backup-db.sh >> /var/log/dmklab-backup.log 2>&1
```

### 6.4 Truy cập Dashboard Giám sát Grafana an toàn qua SSH Tunnel
Vì lý do bảo mật, cổng Grafana (`3001`) và Prometheus (`9090`) được bảo vệ nội bộ và không mở ra Internet. Để truy cập bảng điều khiển giám sát:
1. Mở Terminal trên máy tính cá nhân của bạn:
   ```bash
   ssh -L 3001:localhost:3001 root@<IP_VPS>
   ```
2. Mở trình duyệt trên máy tính và truy cập: `http://localhost:3001`
   - **Tài khoản**: `admin`
   - **Mật khẩu**: Giá trị `GRAFANA_PASSWORD` trong file `.env` (mặc định: `AdminSecure2026@Pass`).
3. Bạn sẽ theo dõi được toàn bộ biểu đồ CPU, RAM, JVM Garbage Collection, số lượng học sinh đang online và thời gian phản hồi API theo thời gian thực.
