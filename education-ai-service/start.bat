@echo off
REM DMKLab AI Service - Windows Startup Script
echo Starting DMKLab AI Service (Python/FastAPI)...
cd /d %~dp0

REM Copy .env if not exists
if not exist .env (
    copy .env.example .env
    echo [INFO] Created .env from .env.example - please update your API keys!
)

REM Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
