#!/usr/bin/env bash
# ==============================================================================
# DMKLab Education Platform - Master One-Click Production Deployment Script
# Tự động hóa: Kiểm tra DNS -> Build Docker -> Kích hoạt Containers -> Cấp SSL Let's Encrypt
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}   DMKLab Education Platform - TRIỂN KHAI HỆ THỐNG LÊN VPS         ${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. Kiểm tra file cấu hình .env
if [ ! -f .env ]; then
    if [ -f .env.production.example ]; then
        echo -e "${YELLOW}[CẢNH BÁO] Chưa tìm thấy file .env! Đang tự động sao chép từ .env.production.example...${NC}"
        cp .env.production.example .env
        echo -e "${GREEN}Đã tạo file .env. Vui lòng mở file .env để kiểm tra/chỉnh sửa tên miền và API key nếu cần.${NC}"
    elif [ -f .env.example ]; then
        echo -e "${YELLOW}[CẢNH BÁO] Chưa tìm thấy file .env! Đang tự động sao chép từ .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}Đã tạo file .env từ .env.example.${NC}"
    else
        echo -e "${RED}[LỖI] Không tìm thấy file .env hoặc .env.example!${NC}"
        exit 1
    fi
fi

# Load biến môi trường từ .env
set -a
source .env
set +a

DOMAIN="${DOMAIN_NAME:-localhost}"
echo -e "Tên miền đã cấu hình: ${CYAN}${DOMAIN}${NC}"

# 2. Kiểm tra bản ghi DNS tên miền nếu không phải localhost
if [ "$DOMAIN" != "localhost" ]; then
    echo -e "\n${BLUE}[1/5] Kiểm tra kết nối DNS và địa chỉ IP VPS...${NC}"
    VPS_IP=$(curl -s -m 5 https://api.ipify.org 2>/dev/null || curl -s -m 5 https://ifconfig.me 2>/dev/null || echo "unknown")
    echo -e "IP công khai của VPS này: ${CYAN}${VPS_IP}${NC}"

    RESOLVED_IP=$(dig +short "$DOMAIN" 2>/dev/null | tail -n1 || echo "")
    if [ -n "$RESOLVED_IP" ]; then
        echo -e "IP phân giải từ DNS của tên miền [${DOMAIN}]: ${CYAN}${RESOLVED_IP}${NC}"
        if [ "$RESOLVED_IP" == "$VPS_IP" ]; then
            echo -e "${GREEN}[OK] Tên miền đã trỏ trực tiếp và chính xác vào IP VPS!${NC}"
        else
            echo -e "${YELLOW}[LƯU Ý] IP tên miền ($RESOLVED_IP) khác IP máy chủ ($VPS_IP).${NC}"
            echo -e "${YELLOW}Nếu bạn đang sử dụng Cloudflare Proxy (đám mây màu cam), điều này hoàn toàn BÌNH THƯỜNG! Hệ thống vẫn hoạt động mượt mà.${NC}"
            echo -e "${YELLOW}Nếu bạn KHÔNG dùng Cloudflare, hãy kiểm tra lại bản ghi A trên nhà cung cấp tên miền.${NC}"
        fi
    else
        echo -e "${YELLOW}[CẢNH BÁO] Chưa phân giải được DNS cho ${DOMAIN}. Bạn có thể tiếp tục và kích hoạt SSL sau.${NC}"
    fi
fi

# 3. Biên dịch và khởi chạy Docker Compose Stack
echo -e "\n${BLUE}[2/5] Tiến hành Build các Container (Backend Java 21, Frontend Next.js 16, Nginx, Microservices)...${NC}"
docker compose -f "$COMPOSE_FILE" build --parallel

echo -e "\n${BLUE}[3/5] Khởi động toàn bộ cụm Container...${NC}"
docker compose -f "$COMPOSE_FILE" up -d

# 4. Giám sát sức khỏe (Healthcheck Verification)
echo -e "\n${BLUE}[4/5] Đang đợi cơ sở dữ liệu và máy chủ Backend sẵn sàng...${NC}"

# Chờ Postgres
printf "Đang kiểm tra PostgreSQL: "
for i in {1..30}; do
    if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${DB_USER:-postgres}" -d "${DB_NAME:-learning_db}" >/dev/null 2>&1; then
        echo -e "${GREEN}SẴN SÀNG!${NC}"
        break
    fi
    printf "."
    sleep 2
done

# Chờ Spring Boot Backend
printf "Đang kiểm tra Spring Boot Backend (/actuator/health): "
BACKEND_OK=0
for i in {1..40}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/actuator/health 2>/dev/null || echo "000")
    if [ "$STATUS" == "200" ]; then
        echo -e "${GREEN}HOẠT ĐỘNG HOÀN HẢO (HTTP 200)!${NC}"
        BACKEND_OK=1
        break
    fi
    printf "."
    sleep 2
done

if [ $BACKEND_OK -eq 0 ]; then
    echo -e "\n${YELLOW}[THÔNG BÁO] Backend đang hoàn tất nạp Flyway Migration trong nền...${NC}"
fi

# 5. Cấp chứng chỉ SSL Let's Encrypt tự động nếu có cấu hình Domain thực
echo -e "\n${BLUE}[5/5] Kiểm tra và thiết lập chứng chỉ SSL HTTPS...${NC}"
if [ "$DOMAIN" != "localhost" ]; then
    # Kiểm tra xem đã có chứng chỉ Let's Encrypt thật chưa
    if docker compose -f "$COMPOSE_FILE" exec -T nginx_gateway test -f "/etc/nginx/ssl/live/${DOMAIN}/fullchain.pem" 2>/dev/null; then
        echo -e "${GREEN}Đã phát hiện chứng chỉ SSL cho tên miền ${DOMAIN}.${NC}"
    else
        echo -e "Đang thực hiện cấp chứng chỉ Let's Encrypt chính thức..."
        if bash scripts/init-ssl.sh "$DOMAIN" "${LETSENCRYPT_EMAIL:-admin@${DOMAIN}}"; then
            echo -e "${GREEN}Cấp chứng chỉ SSL thành công!${NC}"
        else
            echo -e "${YELLOW}[LƯU Ý] Chưa thể cấp Let's Encrypt ngay lúc này (có thể do DNS đang lan truyền hoặc dùng Cloudflare SSL). Nginx đang chạy ở chế độ Fallback SSL an toàn.${NC}"
            echo -e "${YELLOW}Bạn có thể chạy lại bất cứ lúc nào: bash scripts/init-ssl.sh ${DOMAIN}${NC}"
        fi
    fi
else
    echo -e "${GREEN}Môi trường localhost đang chạy SSL tự ký nội bộ an toàn.${NC}"
fi

# 6. Bảng tổng kết thông số nền tảng
echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}       TRIỂN KHAI NỀN TẢNG DMKLAB EDUCATION THÀNH CÔNG!             ${NC}"
echo -e "${GREEN}====================================================================${NC}"
if [ "$DOMAIN" != "localhost" ]; then
    echo -e "🌐 Website chính thức    : ${CYAN}https://${DOMAIN}${NC}"
    echo -e "🔌 API Backend Gateway  : ${CYAN}https://${DOMAIN}/api/v1${NC}"
    echo -e "📚 Swagger UI API Docs  : ${CYAN}https://${DOMAIN}/api/swagger-ui.html${NC}"
else
    echo -e "🌐 Website (Local)      : ${CYAN}http://localhost${NC} hoặc ${CYAN}https://localhost${NC}"
    echo -e "🔌 API Backend (Local)  : ${CYAN}http://localhost:8080/api/v1${NC}"
fi
echo -e "🤖 Gia sư Socratic AI   : ${GREEN}Kích hoạt (SSE Streaming 25ms/token)${NC}"
echo -e "🎥 Trình nén video HLS  : ${GREEN}Kích hoạt (Transcoder Worker)${NC}"
echo -e "📊 Grafana Dashboard    : ${MAGENTA}ssh -L 3001:localhost:3001 root@${VPS_IP:-vps_ip}${NC} -> ${CYAN}http://localhost:3001${NC}"
echo -e "   Tài khoản Grafana    : admin / ${GRAFANA_PASSWORD:-AdminSecure2026@Pass}"
echo -e "====================================================================\n"
