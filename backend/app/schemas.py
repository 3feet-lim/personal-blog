from pydantic import BaseModel


class SessionUser(BaseModel):
    email: str
    name: str
    role: str
    approved: bool
    family_access: bool


class BlogPostSummaryOut(BaseModel):
    slug: str
    title: str
    summary: str
    content: str
    published_at: str | None

    class Config:
        from_attributes = True


class BlogListOut(BaseModel):
    items: list[BlogPostSummaryOut]


class AlbumSummaryOut(BaseModel):
    slug: str
    title: str
    description: str
    item_count: int


class AlbumItemOut(BaseModel):
    id: int
    caption: str
    asset_url: str | None


class AlbumDetailOut(BaseModel):
    slug: str
    title: str
    description: str
    items: list[AlbumItemOut]


class DevLoginIn(BaseModel):
    email: str


class AdminBlogPostCreateIn(BaseModel):
    title: str
    summary: str
    content: str
    slug: str | None = None
    status: str = "published"


class AdminAlbumCreateIn(BaseModel):
    title: str
    description: str = ""
    slug: str | None = None


class AdminUserUpdateIn(BaseModel):
    role: str | None = None
    approved: bool | None = None
    family_access: bool | None = None
