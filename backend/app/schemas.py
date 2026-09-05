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


class AdminBlogPostEditIn(BaseModel):
    # All fields optional: only provided fields are updated (exclude_unset).
    title: str | None = None
    summary: str | None = None
    content: str | None = None
    status: str | None = None
    tags: list[str] | None = None
    series_slug: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is not None and value not in {"draft", "published"}:
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


VALID_ROLES = {"admin", "maintainer", "viewer"}


class AdminUserUpdateIn(BaseModel):
    role: str | None = None
    approved: bool | None = None
    family_access: bool | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str | None) -> str | None:
        if value is not None and value not in VALID_ROLES:
            raise ValueError("role must be 'admin', 'maintainer', or 'viewer'.")
        return value


class AdminUserCreateIn(BaseModel):
    email: str
    display_name: str | None = None
    role: str = "viewer"
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
        if value not in VALID_ROLES:
            raise ValueError("role must be 'admin', 'maintainer', or 'viewer'.")
        return value


_URL_SCHEMES = ("http://", "https://")


class AdminSiteSettingsUpdateIn(BaseModel):
    # Each field defaults to None meaning "not provided" (skipped via
    # exclude_unset on update). The site_settings columns are all NOT NULL,
    # so an explicitly-sent null or empty value must be rejected here rather
    # than blowing up on commit or silently blanking a public column.
    site_name: str | None = None
    site_subtitle: str | None = None
    footer_text: str | None = None
    github_url: str | None = None
    mastodon_url: str | None = None

    @field_validator(
        "site_name", "site_subtitle", "footer_text", "github_url", "mastodon_url"
    )
    @classmethod
    def _reject_null_and_strip(cls, value: str | None, info) -> str:
        if value is None:
            raise ValueError(f"{info.field_name} must not be null.")
        return value.strip()

    @field_validator("site_name")
    @classmethod
    def _require_site_name(cls, value: str) -> str:
        if not value:
            raise ValueError("site_name must not be empty.")
        return value

    @field_validator("github_url", "mastodon_url")
    @classmethod
    def _validate_url(cls, value: str) -> str:
        # An empty string is allowed and means "no link" (the footer hides it);
        # any non-empty value must be an absolute http(s) URL so the public
        # footer never renders a broken or relative href.
        if value and not value.startswith(_URL_SCHEMES):
            raise ValueError("URL must start with http:// or https://.")
        return value
