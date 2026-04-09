from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import DbSession
from app.models import BlogPost

router = APIRouter(prefix="/api/blog", tags=["blog"])


@router.get("/posts")
def list_posts(db: DbSession):
    items = db.scalars(
        select(BlogPost).where(BlogPost.status == "published").order_by(BlogPost.id.desc())
    ).all()
    return {
        "items": [
            {
                "slug": item.slug,
                "title": item.title,
                "summary": item.summary,
                "content": item.content,
                "published_at": item.published_at.isoformat() if item.published_at else None,
            }
            for item in items
        ]
    }


@router.get("/posts/{slug}")
def get_post(slug: str, db: DbSession):
    item = db.scalar(select(BlogPost).where(BlogPost.slug == slug, BlogPost.status == "published"))
    if item is None:
        raise HTTPException(status_code=404, detail="Post not found.")
    return {
        "slug": item.slug,
        "title": item.title,
        "summary": item.summary,
        "content": item.content,
        "published_at": item.published_at.isoformat() if item.published_at else None,
    }
