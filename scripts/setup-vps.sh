#!/usr/bin/env bash
# ==============================================================================
# DMKLab Education Platform - Automated VPS Bootstrap & Hardening Script
# Hỗ trợ: Ubuntu 22.04 / 24.04 LTS, Debian 11 / 12
# Tự động: Cài Docker, Docker Compose, tạo 4GB Swap, tối ưu Kernel, cấu hình UFW Firewall
# ==============================================================================

set -euo pipefail

# Màu hiển thị terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}   DMKLab Education Platform - BẮT ĐẦU THIẾT LẬP HẠ TẦNG VPS       ${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. Kiểm tra quyền root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}[LỖI] Script này phải được chạy với quyền root hoặc sudo.${NC}"
   echo "Vui lòng chạy: sudo bash scripts/setup-vps.sh"
   exit 1
fi

# 2. Cập nhật hệ điều hành
echo -e "\n${BLUE}[1/6] Đang cập nhật gói phần mềm hệ thống (apt update & upgrade)...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# 3. Cài đặt các công cụ nền tảng thiết yếu
echo -e "\n${BLUE}[2/6] Đang cài đặt các công cụ cần thiết (curl, git, ufw, fail2ban, jq, dnsutils)...${NC}"
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban \
    jq \
    dnsutils \
    htop \
    iotop \
    net-tools \
    tar \
    gzip

# 4. Tự động kiểm tra RAM và tạo Swap 4GB nếu RAM < 4GB (Chống OOM-Killer khi build Next.js & Spring Boot)
echo -e "\n${BLUE}[3/6] Kiểm tra bộ nhớ RAM và thiết lập Swap File...${NC}"
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_RAM_MB=$((TOTAL_RAM_KB / 1024))
echo -e "Tổng dung lượng RAM vật lý: ${CYAN}${TOTAL_RAM_MB} MB${NC}"

CURRENT_SWAP_KB=$(grep SwapTotal /proc/meminfo | awk '{print $2}')
if [[ $CURRENT_SWAP_KB -lt 1048576 ]]; then
    echo -e "${YELLOW}Phát hiện chưa có Swap hoặc Swap nhỏ hơn 1GB. Đang tự động tạo 4GB Swap File...${NC}"
    if [ -f /swapfile ]; then
        swapoff /swapfile 2>/dev/null || true
        rm -f /swapfile
    fi
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # Đưa vào /etc/fstab nếu chưa có
    if ! grep -q "/swapfile" /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

    # Tối ưu swapiness
    sysctl vm.swappiness=10
    sysctl vm.vfs_cache_pressure=50
    if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
        echo "vm.swappiness=10" >> /etc/sysctl.conf
        echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
    fi
    echo -e "${GREEN}Đã tạo thành công 4GB Swap File!${NC}"
else
    echo -e "${GREEN}Hệ thống đã có sẵn Swap dung lượng: $((CURRENT_SWAP_KB / 1024)) MB.${NC}"
fi

# 5. Tối ưu thông số Linux Kernel (Sysctl High Concurrency)
echo -e "\n${BLUE}[4/6] Áp dụng cấu hình Kernel tối ưu tải cao (TCP somaxconn, file-max, inotify)...${NC}"
cat > /etc/sysctl.d/99-dmklab-tuning.conf << 'EOF'
# Tăng hàng đợi kết nối TCP
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
# Giới hạn mở file đồng thời
fs.file-max = 2097152
# Tăng giới hạn bộ nhớ ảo cho PgVector & Java
vm.max_map_count = 262144
# Giảm thời gian chờ kết nối TCP FIN
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
EOF
sysctl --system > /dev/null 2>&1
echo -e "${GREEN}Đã tối ưu Kernel Sysctl hoàn tất!${NC}"

# 6. Cài đặt Docker Engine & Docker Compose Plugin chính thức
echo -e "\n${BLUE}[5/6] Cài đặt Docker Engine & Docker Compose Plugin...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Đang tải script cài đặt chính thức từ get.docker.com..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Cài đặt Docker thành công! Phiên bản: $(docker --version)${NC}"
else
    echo -e "${GREEN}Docker đã được cài đặt sẵn: $(docker --version)${NC}"
fi

# Cấu hình log rotation mặc định cho Docker daemon để không bao giờ bị tràn ổ cứng
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "5"
  }
}
EOF
systemctl restart docker

# 7. Cấu hình Firewall UFW (Bảo mật Zero-Trust: Chỉ mở cổng 22, 80, 443)
echo -e "\n${BLUE}[6/6] Cấu hình tường lửa UFW (Firewall)...${NC}"
# Đảm bảo không bị ngắt kết nối SSH
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH Port'
ufw allow 80/tcp comment 'HTTP Web'
ufw allow 443/tcp comment 'HTTPS Web SSL'
ufw --force enable
echo -e "${GREEN}Đã kích hoạt Firewall UFW (Chỉ cho phép kết nối cổng 22, 80, 443).${NC}"

# Hoàn tất
echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}  THIẾT LẬP HẠ TẦNG VPS THÀNH CÔNG RỰC RỠ!                         ${NC}"
echo -e "${GREEN}====================================================================${NC}"
echo -e "Các bước tiếp theo:"
echo -e "1. Đảm bảo tên miền của bạn đã trỏ bản ghi ${CYAN}A${NC} về địa chỉ IP của VPS này."
echo -e "2. Kiểm tra/chỉnh sửa file cấu hình: ${CYAN}nano .env${NC} (điền API Key Gemini/Groq, Tên miền)."
echo -e "3. Chạy lệnh triển khai tự động: ${CYAN}bash scripts/deploy.sh${NC}"
echo -e "====================================================================\n"
