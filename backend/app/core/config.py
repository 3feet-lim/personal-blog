from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "personal-blog-backend"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"
    database_url: str = "sqlite:///./data/app.db"
    default_auth_provider: str = "google"
    session_secret: str = "change-me-in-production"
    session_cookie_name: str = "personal_blog_session"
    session_https_only: bool = False
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/callback/google"
    storage_provider: str = "minio"
    storage_endpoint: str = "http://minio:9000"
    storage_bucket: str = "personal-blog"
    storage_access_key: str = "minioadmin"
    storage_secret_key: str = "minioadmin"
    storage_secure: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
