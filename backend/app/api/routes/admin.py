import re
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select

from app.api.deps import DbSession, current_user
from app.api.routes.blog import _serialize_post
from app.api.routes.settings import _serialize_settings
from app.models import Album, AlbumItem, Asset, BlogPost, Series, SiteSettings, User
from app.models.site_settings import SITE_SETTINGS_SINGLETON_ID
from app.schemas import (
    AdminAlbumCreateIn,
    AdminBlogPostCreateIn,
    AdminBlogPostUpdateIn,
    AdminSeriesCreateIn,
    AdminSiteSettingsUpdateIn,
    AdminUserCreateIn,
    AdminUserUpdateIn,
)
from app.services.auth import require_admin
from app.services.storage import get_storage_adapter

router = APIRouter(prefix="/api/admin", tags=["admin"])


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if normalized:
        return normalized
    # Titles with no ASCII alphanumeric characters (e.g. Korean-only titles)
    # would otherwise all collapse to the same "untitled" slug and collide.
    # Append a short random suffix so each such title gets a unique slug.
    return f"untitled-{uuid4().hex[:8]}"


def estimate_read_time(content: str) -> int:
    word_count = len(content.split())
    return max(1, round(word_count / 200))


@router.get("/users")
def list_users(db: DbSession, user=Depends(current_user)):
    require_admin(user)
    items = db.scalars(select(User).order_by(User.id.asc())).all()
    return {
        "items": [
            {
                "id": item.id,
                "email": item.email,
                "display_name": item.display_name,
                "role": item.role,
                "approved": item.approved,
                "family_access": item.family_access,
            }
            for item in items
        ]
    }


@router.post("/users", status_code=201)
def create_user(payload: AdminUserCreateIn, db: DbSession, user=Depends(current_user)):
    require_admin(user)

    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="User with this email already exists.")

    display_name = payload.display_name or payload.email.split("@", maxsplit=1)[0]
    new_user = User(
        email=payload.email,
        display_name=display_name,
        role=payload.role,
        approved=True,
        family_access=payload.family_access,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "id": new_user.id,
        "email": new_user.email,
        "display_name": new_user.display_name,
        "role": new_user.role,
        "approved": new_user.approved,
        "family_access": new_user.family_access,
    }


@router.get("/blog/posts")
def list_admin_blog_posts(db: DbSession, user=Depends(current_user)):
    require_admin(user)
    items = db.scalars(select(BlogPost).order_by(BlogPost.id.desc())).all()
    return {
        "items": [
            {"id": item.id, "status": item.status, **_serialize_post(item)}
            for item in items
        ]
    }


@router.post("/blog/posts")
def create_blog_post(payload: AdminBlogPostCreateIn, db: DbSession, user=Depends(current_user)):
    admin = require_admin(user)
    if payload.status not in {"draft", "published"}:
        raise HTTPException(status_code=422, detail="status must be 'draft' or 'published'.")
    slug = payload.slug or slugify(payload.title)
    existing = db.scalar(select(BlogPost).where(BlogPost.slug == slug))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Slug already exists.")

    series_id = None
    if payload.series_slug:
        series = db.scalar(select(Series).where(Series.slug == payload.series_slug))
        if series is None:
            raise HTTPException(status_code=404, detail="Series not found.")
        series_id = series.id

    post = BlogPost(
        slug=slug,
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        status=payload.status,
        tags=payload.tags,
        read_time=estimate_read_time(payload.content),
        series_id=series_id,
        author_id=admin.id,
        published_at=datetime.now(UTC) if payload.status == "published" else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"id": post.id, "slug": post.slug, "status": post.status}


@router.patch("/blog/posts/{post_id}")
def update_blog_post_status(
    post_id: int,
    payload: AdminBlogPostUpdateIn,
    db: DbSession,
    user=Depends(current_user),
):
    require_admin(user)
    post = db.scalar(select(BlogPost).where(BlogPost.id == post_id))
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found.")

    if post.status != payload.status:
        post.status = payload.status
        if payload.status == "published" and post.published_at is None:
            post.published_at = datetime.now(UTC)
        elif payload.status == "draft":
            post.published_at = None

    db.add(post)
    db.commit()
    db.refresh(post)
    return {"id": post.id, "status": post.status, **_serialize_post(post)}


@router.post("/series", status_code=201)
def create_series(payload: AdminSeriesCreateIn, db: DbSession, user=Depends(current_user)):
    require_admin(user)
    slug = payload.slug or slugify(payload.title)
    existing = db.scalar(select(Series).where(Series.slug == slug))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Slug already exists.")

    series = Series(
        slug=slug,
        title=payload.title,
        description=payload.description,
        sort_order=payload.sort_order,
    )
    db.add(series)
    db.commit()
    db.refresh(series)
    return {"id": series.id, "slug": series.slug, "title": series.title}


@router.post("/albums")
def create_album(payload: AdminAlbumCreateIn, db: DbSession, user=Depends(current_user)):
    admin = require_admin(user)
    slug = payload.slug or slugify(payload.title)
    existing = db.scalar(select(Album).where(Album.slug == slug))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Slug already exists.")

    album = Album(
        slug=slug,
        title=payload.title,
        description=payload.description,
        visibility="private",
        created_by=admin.id,
    )
    db.add(album)
    db.commit()
    db.refresh(album)
    return {"id": album.id, "slug": album.slug}


@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    payload: AdminUserUpdateIn,
    db: DbSession,
    user=Depends(current_user),
):
    require_admin(user)
    target = db.scalar(select(User).where(User.id == user_id))
    if target is None:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.role is not None:
        target.role = payload.role
    if payload.approved is not None:
        target.approved = payload.approved
    if payload.family_access is not None:
        target.family_access = payload.family_access

    db.add(target)
    db.commit()
    db.refresh(target)
    return {
        "id": target.id,
        "email": target.email,
        "role": target.role,
        "approved": target.approved,
        "family_access": target.family_access,
    }


@router.post("/albums/{album_id}/items/upload")
async def upload_album_item(
    album_id: int,
    db: DbSession,
    user=Depends(current_user),
    file: UploadFile = File(...),
    title: str = Form(default=""),
    caption: str = Form(default=""),
):
    require_admin(user)
    album = db.scalar(select(Album).where(Album.id == album_id))
    if album is None:
        raise HTTPException(status_code=404, detail="Album not found.")

    content_type = file.content_type or "application/octet-stream"
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty upload.")

    extension = (file.filename or "upload.bin").rsplit(".", maxsplit=1)[-1].lower()
    object_key = f"album/private/{album.slug}/{uuid4().hex}.{extension}"
    adapter = get_storage_adapter()
    adapter.ensure_bucket()
    adapter.upload_bytes(object_key, content, content_type)

    asset = Asset(
        object_key=object_key,
        mime_type=content_type,
        size_bytes=len(content),
        visibility="private",
    )
    db.add(asset)
    db.flush()

    current_count = db.scalar(
        select(AlbumItem.sort_order).where(AlbumItem.album_id == album.id).order_by(AlbumItem.sort_order.desc())
    )
    item = AlbumItem(
        album_id=album.id,
        asset_id=asset.id,
        title=title,
        caption=caption,
        sort_order=(current_count or 0) + 1,
    )
    db.add(item)
    db.commit()
    db.refresh(asset)
    db.refresh(item)

    return {
        "album_id": album.id,
        "item_id": item.id,
        "asset_id": asset.id,
        "object_key": asset.object_key,
    }


@router.patch("/settings")
def update_settings(payload: AdminSiteSettingsUpdateIn, db: DbSession, user=Depends(current_user)):
    require_admin(user)
    settings = db.get(SiteSettings, SITE_SETTINGS_SINGLETON_ID)
    if settings is None:
        raise HTTPException(status_code=500, detail="Site settings are not initialized.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.add(settings)
    db.commit()
    db.refresh(settings)
    return _serialize_settings(settings)
