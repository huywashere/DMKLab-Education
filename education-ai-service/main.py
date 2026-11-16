"""
DMKLab AI Service - FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.routes.chat import router as chat_router
from app.services.ai_service import AiService

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown lifecycle"""
    # Startup: init Redis (optional)
    redis_client = None
    try:
        redis_client = await aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=3,
        )
        await redis_client.ping()
        logger.info("[STARTUP] Redis connected: %s", settings.redis_url)
    except Exception as ex:
        logger.warning("[STARTUP] Redis không khả dụng (AI sẽ chạy không có cache): %s", ex)
        redis_client = None

    app.state.ai_service = AiService(redis=redis_client)
    logger.info("[STARTUP] DMKLab AI Service (Python/FastAPI) khởi động thành công")

    yield  # App running

    # Shutdown: cleanup
    if redis_client:
        await redis_client.aclose()
    await app.state.ai_service._http.aclose()
    logger.info("[SHUTDOWN] DMKLab AI Service đã dừng")


app = FastAPI(
    title="DMKLab AI Service",
    description=(
        "Python FastAPI microservice cho AI Socratic Tutor của DMKLab Education Platform. "
        "Tương đương với AiService.java - hỗ trợ fallback chain: Gemini → Groq → OpenAI → Offline Socratic."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - same origins as Java backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("[UNHANDLED_ERROR] %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Lỗi hệ thống AI, vui lòng thử lại sau."},
    )


# Register routes
app.include_router(chat_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "DMKLab AI Service",
        "version": "1.0.0",
        "stack": "Python 3.12 + FastAPI + asyncpg + Redis",
        "endpoints": [
            "POST /api/v1/ai/learning/chat",
            "POST /api/v1/ai/admin/chat",
            "GET  /api/v1/ai/sessions/{sessionId}/history",
            "POST /api/v1/ai/messages/{messageId}/feedback",
            "GET  /api/v1/ai/health",
        ],
    }
