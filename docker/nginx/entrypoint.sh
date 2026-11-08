#!/bin/sh
set -e

CERT_DIR="/etc/nginx/ssl/live/dmklab.edu.vn"
mkdir -p "$CERT_DIR"

# Generate fallback self-signed certificate if cert files are missing
if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
    echo "Creating fallback self-signed SSL certificate for dmklab.edu.vn..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/C=VN/ST=Hanoi/L=Hanoi/O=DMKLab/OU=IT/CN=dmklab.edu.vn"
fi

# Execute CMD
exec "$@"

