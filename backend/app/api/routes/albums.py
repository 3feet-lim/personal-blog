from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import extract, func, select
from sqlalchemy.orm import joinedload

from app.api.deps import DbSession, current_user
from app.models import Album, AlbumItem, User
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


@router.get("/feed/family")
def get_family_feed(db: DbSession, user=Depends(current_user)):
    require_family_access(user)

    items = db.scalars(
        select(AlbumItem)
        .options(joinedload(AlbumItem.album))
        .join(Album)
        .order_by(AlbumItem.created_at.desc())
    ).all()

    years = sorted(
        {row[0] for row in db.execute(select(extract("year", AlbumItem.created_at))).all()},
        reverse=True,
    )

    approved_family_count = db.scalar(
        select(func.count()).select_from(User).where(User.family_access.is_(True), User.approved.is_(True))
    )

    return {
        "approved_family_count": approved_family_count or 0,
        "years": [int(year) for year in years],
        "items": [
            {
                "id": item.id,
                "album_slug": item.album.slug,
                "album_title": item.album.title,
                "title": item.title,
                "caption": item.caption,
                "asset_id": item.asset_id,
                "asset_url": f"/api/assets/{item.asset_id}/content" if item.asset_id else None,
                "created_at": item.created_at.isoformat(),
            }
            for item in items
        ],
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
                "title": item.title,
                "caption": item.caption,
                "asset_id": item.asset_id,
                "asset_url": f"/api/assets/{item.asset_id}/content" if item.asset_id else None,
            }
            for item in sorted(album.items, key=lambda candidate: candidate.sort_order)
        ],
    }
