#!/bin/sh
set -e

# Default domain to localhost if not specified
export DOMAIN_NAME="${DOMAIN_NAME:-localhost}"
CERT_DIR="/etc/nginx/ssl/live/${DOMAIN_NAME}"
mkdir -p "$CERT_DIR"

# Generate fallback self-signed certificate if cert files are missing
if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
    echo "[NGINX INIT] Creating fallback self-signed SSL certificate for ${DOMAIN_NAME}..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/C=VN/ST=Hanoi/L=Hanoi/O=DMKLab-Education/OU=IT/CN=${DOMAIN_NAME}"
    echo "[NGINX INIT] Fallback certificate ready at ${CERT_DIR}"
fi

# Substitute DOMAIN_NAME in template to produce active nginx.conf
if [ -f "/etc/nginx/nginx.conf.template" ]; then
    echo "[NGINX INIT] Applying template with DOMAIN_NAME=${DOMAIN_NAME}..."
    envsubst '${DOMAIN_NAME}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
fi

# Execute CMD
exec "$@"
