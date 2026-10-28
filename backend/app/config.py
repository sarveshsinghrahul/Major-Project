from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # SQLite keeps local development dependency-free; Docker Compose points this at Postgres.
    database_url: str = "sqlite:///./dev.db"

    jwt_secret: str = "dev-only-secret-change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_days: int = 7

    cors_origins: list[str] = ["http://localhost:5173"]

    # Personalization thresholds (synopsis §5). Tune these after the pilot.
    level_intermediate_min: float = 0.4  # overall score below this -> beginner
    level_advanced_min: float = 0.75  # overall score above this -> advanced
    diagnostic_weight: float = 0.8  # rest of the overall score comes from self-rated familiarity
    mastered_min: float = 0.8  # topic mastery at or above this counts as mastered
    prerequisite_ready_min: float = 0.6  # every prerequisite needs this much mastery to unlock a topic


@lru_cache
def get_settings() -> Settings:
    return Settings()
