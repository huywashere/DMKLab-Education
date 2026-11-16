"""
DMKLab AI Service - Configuration
Pydantic Settings với env file support
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # Server
    port: int = 8000
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/learning_db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # AI Provider
    ai_provider: str = "gemini"  # gemini | groq | openai

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Groq
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_base_url: str = "https://api.groq.com/openai/v1"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"

    # JWT (same secret as Java backend for token verification)
    jwt_secret: str = "KhanAcademySecureJWTSecretKeyWithHighEntropy2026SuperStrongHMACSHA512KeyDMKLabPlatform"

    # Quota
    student_daily_quota: int = 30

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
