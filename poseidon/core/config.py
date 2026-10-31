from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    PROJECT_NAME: str = "POSEIDON AI"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Authoritative Database Configuration
    DATABASE_URL: str = "sqlite+aiosqlite:///./poseidon.db"
    DATABASE_ECHO: bool = False

    # Offline Geospatial Bounds (Coimbatore Noyyal Corridor)
    GEO_MIN_LAT: float = 10.9000
    GEO_MAX_LAT: float = 11.1000
    GEO_MIN_LON: float = 76.8500
    GEO_MAX_LON: float = 77.1500

    # Authentication & Ingestion Secrets
    DEFAULT_HMAC_SECRET: str = "poseidon-pre-shared-hmac-secret-key-32b!"
    REPLAY_WINDOW_SIZE: int = 64
    MAX_FUTURE_TIMESTAMP_DRIFT_SEC: int = 300  # 5 minutes limit per non-negotiables

    # Optimization Configuration
    OPTIMIZER_FAIRNESS_THETA: float = 0.5
    OPTIMIZER_TIME_LIMIT_SEC: int = 10

    # Local AI / LLM Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:7b"
    GEMINI_API_KEY: Optional[str] = None


@lru_cache()
def get_settings() -> Settings:
    return Settings()

