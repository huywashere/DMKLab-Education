#!/bin/bash
# ==============================================================================
# DMKLab Education Platform - Run Load Test via Dockerized K6
# Chạy kiểm thử tải không cần cài đặt K6 cục bộ
# ==============================================================================

set -euo pipefail

TARGET_URL="${1:-http://localhost:8080}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "===================================================================="
echo " [DMKLab] Bắt đầu chạy kịch bản kiểm thử tải K6 tới: ${TARGET_URL}"
echo "===================================================================="

if command -v k6 &> /dev/null; then
    TARGET_URL="${TARGET_URL}" k6 run "${SCRIPT_DIR}/load-test.js"
elif command -v docker &> /dev/null; then
    docker run --rm -i --network="host" \
        -e TARGET_URL="${TARGET_URL}" \
        grafana/k6 run - < "${SCRIPT_DIR}/load-test.js"
else
    echo "Lỗi: Không tìm thấy k6 hoặc docker trên máy tính. Vui lòng cài đặt một trong hai."
    exit 1
fi
