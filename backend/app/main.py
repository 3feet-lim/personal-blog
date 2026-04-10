from contextlib import asynccontextmanager
from datetime import datetime, UTC

from fastapi import FastAPI
from sqlalchemy import select
from starlette.middleware.sessions import SessionMiddleware

from app.api.routes.admin import router as admin_router
from app.api.routes.albums import router as albums_router
from app.api.routes.assets import router as assets_router
from app.api.routes.auth import router as auth_router
from app.api.routes.blog import router as blog_router
from app.api.routes.health import router as health_router
from app.core.config import get_settings
from app.db.session import Base, SessionLocal, engine
from app.models import Album, AlbumItem, Asset, AuthIdentity, BlogPost, User
from app.services.storage import get_storage_adapter

SEED_ASSET_KEY = "album/private/family-trip-1.jpg"
SEED_ASSET_MIME = "image/png"
SEED_ASSET_BYTES = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010804000000b51c0c02"
    "0000000b49444154789c63fcff1f0003030200efb267990000000049454e44ae426082"
)


def ensure_seed_asset_object() -> None:
    adapter = get_storage_adapter()
    adapter.ensure_bucket()
    adapter.upload_bytes(SEED_ASSET_KEY, SEED_ASSET_BYTES, SEED_ASSET_MIME)


def seed_data() -> None:
    ensure_seed_asset_object()

    with SessionLocal() as db:
        admin = db.scalar(select(User).where(User.email == "admin@example.com"))
        if admin is None:
            admin = User(
                email="admin@example.com",
                display_name="Admin User",
                role="admin",
                approved=True,
                family_access=True,
            )
            family = User(
                email="family@example.com",
                display_name="Family Member",
                role="member",
                approved=True,
                family_access=True,
            )
            guest = User(
                email="guest@example.com",
                display_name="Guest User",
                role="member",
                approved=False,
                family_access=False,
            )
            db.add_all([admin, family, guest])
            db.flush()

            db.add_all(
                [
                    AuthIdentity(
                        user_id=admin.id,
                        provider="google",
                        provider_user_id="admin",
                        provider_email=admin.email,
                    ),
                    AuthIdentity(
                        user_id=family.id,
                        provider="google",
                        provider_user_id="family",
                        provider_email=family.email,
                    ),
                ]
            )

            db.add(
                BlogPost(
                    slug="bootstrapping-personal-blog",
                    title="Bootstrapping the Personal Blog",
                    summary="Why the MVP keeps public blog and private album boundaries explicit.",
                    content="# Bootstrapping\n\nThis post is seeded from the backend startup process.",
                    status="published",
                    author_id=admin.id,
                    published_at=datetime.now(UTC),
                )
            )

            asset = Asset(
                storage_provider="minio",
                bucket=get_settings().storage_bucket,
                object_key=SEED_ASSET_KEY,
                mime_type=SEED_ASSET_MIME,
                size_bytes=len(SEED_ASSET_BYTES),
                visibility="private",
            )
            db.add(asset)
            db.flush()

            album = Album(
                slug="family-trip",
                title="Family Trip",
                description="승인된 사용자만 볼 수 있는 샘플 앨범입니다.",
                visibility="private",
                created_by=admin.id,
            )
            db.add(album)
            db.flush()

            db.add(
                AlbumItem(
                    album_id=album.id,
                    asset_id=asset.id,
                    caption="첫 번째 샘플 이미지",
                    sort_order=1,
                )
            )

            db.commit()
            return

        seeded_asset = db.scalar(select(Asset).where(Asset.object_key == SEED_ASSET_KEY))
        if seeded_asset is not None:
            seeded_asset.mime_type = SEED_ASSET_MIME
            seeded_asset.size_bytes = len(SEED_ASSET_BYTES)
            db.add(seeded_asset)
        existing_google_user = db.scalar(select(User).where(User.email == "3feet.lim@gmail.com"))
        if existing_google_user is None:
            db.add(
                User(
                    email="3feet.lim@gmail.com",
                    display_name="Seokmin Lim",
                    role="member",
                    approved=True,
                    family_access=True,
                )
            )
        else:
            existing_google_user.display_name = "Seokmin Lim"
            existing_google_user.role = "member"
            existing_google_user.approved = True
            existing_google_user.family_access = True
            db.add(existing_google_user)
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        ensure_seed_asset_object()
    except Exception:
        # MinIO might not be reachable during early bootstrap; API remains usable without uploads.
        pass
    seed_data()
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.session_secret,
    session_cookie=settings.session_cookie_name,
    https_only=settings.session_https_only,
    same_site="lax",
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(blog_router)
app.include_router(albums_router)
app.include_router(assets_router)
app.include_router(admin_router)
