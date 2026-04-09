import re
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select

from app.api.deps import DbSession, current_user
from app.models import Album, AlbumItem, Asset, BlogPost, User
from app.schemas import AdminAlbumCreateIn, AdminBlogPostCreateIn, AdminUserUpdateIn
from app.services.auth import require_admin
from app.services.storage import get_storage_adapter

router = APIRouter(prefix="/api/admin", tags=["admin"])


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return normalized or "untitled"


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


@router.post("/blog/posts")
def create_blog_post(payload: AdminBlogPostCreateIn, db: DbSession, user=Depends(current_user)):
    admin = require_admin(user)
    slug = payload.slug or slugify(payload.title)
    existing = db.scalar(select(BlogPost).where(BlogPost.slug == slug))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Slug already exists.")

    post = BlogPost(
        slug=slug,
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        status=payload.status,
        author_id=admin.id,
        published_at=datetime.now(UTC) if payload.status == "published" else None,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"id": post.id, "slug": post.slug, "status": post.status}


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
        storage_provider="minio",
        bucket=adapter.bucket,
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
