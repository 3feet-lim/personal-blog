from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.columns import identity_pk
from app.db.session import Base


class Series(Base):
    __tablename__ = "series"

    id: Mapped[int] = identity_pk()
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    posts: Mapped[list["BlogPost"]] = relationship(back_populates="series")


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[int] = identity_pk()
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="draft")
    tags: Mapped[list[str]] = mapped_column(JSONB, default=list)
    read_time: Mapped[int] = mapped_column(Integer, default=1)
    series_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("series.id"), nullable=True)
    author_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    series: Mapped[Series | None] = relationship(back_populates="posts")
