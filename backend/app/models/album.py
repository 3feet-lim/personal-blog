from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.columns import identity_pk
from app.db.session import Base


class Album(Base):
    __tablename__ = "albums"

    id: Mapped[int] = identity_pk()
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    visibility: Mapped[str] = mapped_column(String(32), default="private")
    created_by: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["AlbumItem"]] = relationship(back_populates="album")


class AlbumItem(Base):
    __tablename__ = "album_items"

    id: Mapped[int] = identity_pk()
    album_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("albums.id"), index=True)
    asset_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("assets.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), default="")
    caption: Mapped[str] = mapped_column(String(255), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

    album: Mapped[Album] = relationship(back_populates="items")
