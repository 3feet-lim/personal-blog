from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.api.deps import DbSession, current_user
from app.models import Album
from app.services.auth import require_family_access

router = APIRouter(prefix="/api/albums", tags=["albums"])


@router.get("")
def list_albums(db: DbSession, user=Depends(current_user)):
    require_family_access(user)
    items = db.scalars(select(Album).order_by(Album.id.desc())).all()
    return {
        "items": [
            {
                "id": item.id,
                "slug": item.slug,
                "title": item.title,
                "description": item.description,
                "item_count": len(item.items),
            }
            for item in items
        ]
    }


@router.get("/{slug}")
def get_album(slug: str, db: DbSession, user=Depends(current_user)):
    require_family_access(user)
    album = db.scalar(select(Album).where(Album.slug == slug))
    if album is None:
        raise HTTPException(status_code=404, detail="Album not found.")

    return {
        "slug": album.slug,
        "title": album.title,
        "description": album.description,
        "items": [
            {
                "id": item.id,
                "caption": item.caption,
                "asset_id": item.asset_id,
                "asset_url": f"/api/assets/{item.asset_id}/access-url" if item.asset_id else None,
            }
            for item in sorted(album.items, key=lambda candidate: candidate.sort_order)
        ],
    }
