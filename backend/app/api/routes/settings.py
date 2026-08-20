from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import DbSession
from app.models import SiteSettings
from app.models.site_settings import SITE_SETTINGS_SINGLETON_ID

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _serialize_settings(item: SiteSettings) -> dict:
    return {
        "site_name": item.site_name,
        "site_subtitle": item.site_subtitle,
        "footer_text": item.footer_text,
        "github_url": item.github_url,
        "mastodon_url": item.mastodon_url,
    }


@router.get("")
def get_settings(db: DbSession):
    settings = db.get(SiteSettings, SITE_SETTINGS_SINGLETON_ID)
    if settings is None:
        raise HTTPException(status_code=500, detail="Site settings are not initialized.")
    return _serialize_settings(settings)
