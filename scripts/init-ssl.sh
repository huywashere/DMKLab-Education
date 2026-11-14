#!/usr/bin/env bash
# ==============================================================================
# DMKLab Education Platform - Let's Encrypt SSL Automated Certificate Issuer
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi

# Load .env if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

DOMAIN="${1:-${DOMAIN_NAME:-}}"
EMAIL="${2:-${LETSENCRYPT_EMAIL:-admin@${DOMAIN}}}"

if [ -z "$DOMAIN" ] || [ "$DOMAIN" == "localhost" ]; then
    echo -e "${RED}[LỖI] Bạn phải cung cấp tên miền hợp lệ để cấp chứng chỉ SSL Let's Encrypt.${NC}"
    echo "Cách dùng: bash scripts/init-ssl.sh yourdomain.com admin@yourdomain.com"
    exit 1
fi

echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}  TIẾN TRÌNH CẤP CHỨNG CHỈ SSL MIỄN PHÍ LET'S ENCRYPT CHO: ${DOMAIN} ${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. Đảm bảo Nginx Gateway đang chạy để phục vụ ACME Webroot Challenge
echo -e "\n[1/3] Đang kiểm tra trạng thái Nginx Gateway..."
docker compose -f "$COMPOSE_FILE" up -d nginx_gateway

# Chờ 3 giây để Nginx sẵn sàng
sleep 3

# 2. Gọi Certbot thực hiện cấp chứng chỉ qua Webroot (/var/www/certbot)
echo -e "\n[2/3] Yêu cầu Certbot xác thực qua Let's Encrypt CA..."

# Thử cấp chứng chỉ cho cả domain và www.domain (nếu có bản ghi DNS www)
STAGING_ARG=""
# Đặt STAGING=1 nếu muốn test môi trường staging của Let's Encrypt để tránh rate limit
if [ "${STAGING:-0}" -eq 1 ]; then
    STAGING_ARG="--staging"
fi

docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
    $STAGING_ARG \
    -d ${DOMAIN} \
    --email ${EMAIL} \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

# 3. Nạp lại cấu hình Nginx để nhận chứng chỉ mới tức thì mà không làm rớt kết nối
echo -e "\n[3/3] Nạp lại chứng chỉ mới vào Nginx Gateway (Zero-Downtime Reload)..."
docker compose -f "$COMPOSE_FILE" exec nginx_gateway nginx -s reload

echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}  CHÚC MỪNG! CHỨNG CHỈ SSL HTTPS ĐÃ ĐƯỢC CẤP VÀ KÍCH HOẠT THÀNH CÔNG!${NC}"
echo -e "${GREEN}  Trang web của bạn đã an toàn tại: https://${DOMAIN}                ${NC}"
echo -e "${GREEN}====================================================================${NC}"
