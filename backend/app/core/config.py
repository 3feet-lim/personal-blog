from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "personal-blog-backend"
    site_name: str = "BigJade's Notes"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000"

    # Local PostgreSQL. Ignored when dsql_endpoint is set.
    database_url: str = ""
    # Aurora DSQL. Connections authenticate with short-lived IAM tokens.
    dsql_endpoint: str = ""
    dsql_region: str = ""
    dsql_user: str = "admin"
    db_schema: str = "blog"

    default_auth_provider: str = "google"
    session_secret: str = "change-me-in-production"
    session_cookie_name: str = "personal_blog_session"
    session_https_only: bool = False
    enable_demo_auth: bool = False
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/callback/google"

    s3_endpoint_url: str = ""
    s3_bucket: str
    s3_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_database(self) -> "Settings":
        if self.dsql_endpoint:
            if not self.dsql_region:
                raise ValueError("DSQL_REGION is required when DSQL_ENDPOINT is set.")
        elif not self.database_url:
            raise ValueError("Either DATABASE_URL or DSQL_ENDPOINT must be set.")
        return self

    @property
    def use_dsql(self) -> bool:
        return bool(self.dsql_endpoint)

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
