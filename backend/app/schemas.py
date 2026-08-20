from pydantic import BaseModel, field_validator


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
    tags: list[str] = []
    series_slug: str | None = None


class AdminBlogPostUpdateIn(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in {"draft", "published"}:
            raise ValueError("status must be 'draft' or 'published'.")
        return value


class AdminAlbumCreateIn(BaseModel):
    title: str
    description: str = ""
    slug: str | None = None


class AdminSeriesCreateIn(BaseModel):
    title: str
    description: str = ""
    slug: str | None = None
    sort_order: int = 0


class AdminUserUpdateIn(BaseModel):
    role: str | None = None
    approved: bool | None = None
    family_access: bool | None = None


class AdminUserCreateIn(BaseModel):
    email: str
    display_name: str | None = None
    role: str = "member"
    family_access: bool = False

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("Invalid email address.")
        return normalized

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in {"member", "admin"}:
            raise ValueError("role must be 'member' or 'admin'.")
        return value


class AdminSiteSettingsUpdateIn(BaseModel):
    site_name: str | None = None
    site_subtitle: str | None = None
    footer_text: str | None = None
    github_url: str | None = None
    mastodon_url: str | None = None
