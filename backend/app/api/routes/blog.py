from xml.sax.saxutils import escape

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import func, select

from app.api.deps import DbSession
from app.core.config import get_settings
from app.models import BlogPost, Series, SiteSettings
from app.models.site_settings import SITE_SETTINGS_SINGLETON_ID

router = APIRouter(prefix="/api/blog", tags=["blog"])


def _serialize_post(item: BlogPost) -> dict:
    return {
        "slug": item.slug,
        "title": item.title,
        "summary": item.summary,
        "content": item.content,
        "published_at": item.published_at.isoformat() if item.published_at else None,
        "tags": item.tags or [],
        "read_time": item.read_time,
        "series": (
            {"slug": item.series.slug, "title": item.series.title} if item.series is not None else None
        ),
    }


@router.get("/posts")
def list_posts(
    db: DbSession,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    base_query = select(BlogPost).where(BlogPost.status == "published")
    total = db.scalar(select(func.count()).select_from(base_query.subquery()))
    items = db.scalars(
        base_query.order_by(BlogPost.id.desc()).limit(limit).offset(offset)
    ).all()
    return {
        "items": [_serialize_post(item) for item in items],
        "total": total or 0,
        "limit": limit,
        "offset": offset,
    }


@router.get("/posts/{slug}")
def get_post(slug: str, db: DbSession):
    item = db.scalar(select(BlogPost).where(BlogPost.slug == slug, BlogPost.status == "published"))
    if item is None:
        raise HTTPException(status_code=404, detail="Post not found.")
    return _serialize_post(item)


@router.get("/series")
def list_series(db: DbSession):
    items = db.scalars(select(Series).order_by(Series.sort_order.asc(), Series.id.asc())).all()
    return {
        "items": [
            {
                "slug": series.slug,
                "title": series.title,
                "description": series.description,
                "post_count": len(
                    [post for post in series.posts if post.status == "published"]
                ),
            }
            for series in items
        ]
    }


@router.get("/tags")
def list_tags(db: DbSession):
    items = db.scalars(select(BlogPost).where(BlogPost.status == "published")).all()
    counts: dict[str, int] = {}
    for item in items:
        for tag in item.tags or []:
            counts[tag] = counts.get(tag, 0) + 1
    return {
        "items": [
            {"tag": tag, "count": count}
            for tag, count in sorted(counts.items(), key=lambda pair: (-pair[1], pair[0]))
        ]
    }


@router.get("/rss.xml")
def rss_feed(db: DbSession):
    settings = get_settings()
    site_settings = db.get(SiteSettings, SITE_SETTINGS_SINGLETON_ID)
    site_name = site_settings.site_name if site_settings is not None else settings.site_name
    items = db.scalars(
        select(BlogPost).where(BlogPost.status == "published").order_by(BlogPost.id.desc()).limit(50)
    ).all()

    entries = []
    for item in items:
        link = f"{settings.frontend_url}/blog/post/?slug={item.slug}"
        pub_date = item.published_at.strftime("%a, %d %b %Y %H:%M:%S GMT") if item.published_at else ""
        entries.append(
            "<item>"
            f"<title>{escape(item.title)}</title>"
            f"<link>{escape(link)}</link>"
            f"<guid>{escape(link)}</guid>"
            f"<description>{escape(item.summary)}</description>"
            f"<pubDate>{pub_date}</pubDate>"
            "</item>"
        )

    channel = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        "<rss version=\"2.0\"><channel>"
        f"<title>{escape(site_name)}</title>"
        f"<link>{escape(settings.frontend_url)}</link>"
        "<description>Tech blog RSS feed</description>"
        + "".join(entries)
        + "</channel></rss>"
    )
    return Response(content=channel, media_type="application/rss+xml")
