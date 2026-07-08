from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    APP_NAME: str = "BreachAlert"
    ENV: str = "development"
    SECRET_KEY: str
    FRONTEND_URL: str = "http://localhost:5173"

    # Auth
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str          # postgresql+asyncpg://...
    REDIS_URL: str = "redis://redis:6379/0"

    # HIBP
    HIBP_API_KEY: str
    HIBP_BASE_URL: str = "https://haveibeenpwned.com/api/v3"
    HIBP_RATE_LIMIT_MS: int = 1600     # min gap between requests
    HIBP_CACHE_TTL: int = 86400        # 24h caching

    # Notifications
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "alerts@breachalert.io"
    TWILIO_SID: str = ""
    TWILIO_TOKEN: str = ""
    TWILIO_FROM: str = ""

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_FAMILY: str = ""

    # Encryption (for at-rest email encryption)
    FERNET_KEY: str


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()