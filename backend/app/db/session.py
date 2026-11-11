from collections.abc import Generator

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings
from app.db.engine import build_engine

settings = get_settings()


class Base(DeclarativeBase):
    metadata = MetaData(schema=settings.db_schema)


engine = build_engine(settings)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
