#!/bin/bash
# DMKLab AI Service - Linux/Mac Startup Script
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "[INFO] Created .env from .env.example - please update your API keys!"
fi

echo "Starting DMKLab AI Service (Python/FastAPI) on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
