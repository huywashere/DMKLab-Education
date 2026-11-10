#!/bin/bash
# ==============================================================================
# DMKLab Education Platform - Automated Database Backup Script
# Backs up PostgreSQL 17 database with gzip compression & upload to Cloudflare R2 / S3
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/dmklab-postgres}"
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-learning_db}"
DB_USER="${DB_USER:-postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Starting automated backup of ${DB_NAME} from ${DB_HOST}:${DB_PORT}..."

# 1. Perform pg_dump with gzip compression
PGPASSWORD="${DB_PASSWORD:-postgres}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=plain \
  --no-owner \
  --no-acl \
  | gzip -9 > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Backup completed successfully! File: ${BACKUP_FILE} (Size: ${BACKUP_SIZE})"

# 2. Upload to Cloudflare R2 / S3 if AWS CLI / S3 client is configured
if [ -n "${R2_BUCKET:-}" ] && [ -n "${R2_ACCESS_KEY_ID:-}" ]; then
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Uploading backup to Cloudflare R2 bucket: ${R2_BUCKET}..."
  AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}" \
  AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}" \
  aws s3 cp "${BACKUP_FILE}" "s3://${R2_BUCKET}/backups/${DB_NAME}_backup_${TIMESTAMP}.sql.gz" \
    --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Cloudflare R2 upload finished."
fi

# 3. Cleanup local backups older than RETENTION_DAYS
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Cleaning up local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime "+${RETENTION_DAYS}" -exec rm -f {} \;

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] All backup maintenance tasks completed."

