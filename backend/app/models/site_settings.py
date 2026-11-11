from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.columns import identity_pk
from app.db.session import Base

SITE_SETTINGS_SINGLETON_ID = 1


class SiteSettings(Base):
    """Site-wide branding settings.

    This table is a singleton: exactly one row with id=SITE_SETTINGS_SINGLETON_ID
    is expected to exist, seeded by the initial migration. Admins edit that row
    via PATCH /api/admin/settings instead of creating new rows.
    """

    __tablename__ = "site_settings"

    id: Mapped[int] = identity_pk()
    site_name: Mapped[str] = mapped_column(String(255), default="BigJade's Notes")
    site_subtitle: Mapped[str] = mapped_column(String(255), default="Engineering journal, since 2026")
    footer_text: Mapped[str] = mapped_column(String(255), default="© 2026 BigJade")
    github_url: Mapped[str] = mapped_column(String(500), default="https://github.com")
    mastodon_url: Mapped[str] = mapped_column(String(500), default="https://mastodon.social")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
