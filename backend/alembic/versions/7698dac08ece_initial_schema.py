"""initial schema

Replaces the earlier migration chain with one schema that runs on both local
PostgreSQL and Aurora DSQL. Every table is created complete in a single
CREATE TABLE so no ALTER TABLE is needed, ids are bigint identity columns, and
secondary indexes use CREATE INDEX ASYNC on DSQL.

Revision ID: 7698dac08ece
Revises:
Create Date: 2026-11-11 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

from app.core.config import get_settings

# revision identifiers, used by Alembic.
revision: str = '7698dac08ece'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SETTINGS = get_settings()
SCHEMA = SETTINGS.db_schema


def _id() -> sa.Column:
    return sa.Column('id', sa.BigInteger(), sa.Identity(cache=1), primary_key=True)


def _fk(name: str, target: str, nullable: bool) -> sa.Column:
    return sa.Column(name, sa.BigInteger(), sa.ForeignKey(f'{SCHEMA}.{target}'), nullable=nullable)


def _created_at() -> sa.Column:
    return sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False)


def _create_index(name: str, table: str, column: str) -> None:
    if SETTINGS.use_dsql:
        op.execute(f'CREATE INDEX ASYNC {name} ON {SCHEMA}.{table} ({column})')
    else:
        op.create_index(name, table, [column], schema=SCHEMA)


def upgrade() -> None:
    op.create_table(
        'users',
        _id(),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('display_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False),
        sa.Column('approved', sa.Boolean(), nullable=False),
        sa.Column('family_access', sa.Boolean(), nullable=False),
        _created_at(),
        schema=SCHEMA,
    )
    op.create_table(
        'assets',
        _id(),
        sa.Column('object_key', sa.String(length=500), nullable=False, unique=True),
        sa.Column('mime_type', sa.String(length=128), nullable=False),
        sa.Column('size_bytes', sa.Integer(), nullable=False),
        sa.Column('checksum', sa.String(length=128), nullable=True),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('visibility', sa.String(length=32), nullable=False),
        _created_at(),
        schema=SCHEMA,
    )
    op.create_table(
        'series',
        _id(),
        sa.Column('slug', sa.String(length=255), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        _created_at(),
        schema=SCHEMA,
    )
    op.create_table(
        'site_settings',
        _id(),
        sa.Column('site_name', sa.String(length=255), nullable=False),
        sa.Column('site_subtitle', sa.String(length=255), nullable=False),
        sa.Column('footer_text', sa.String(length=255), nullable=False),
        sa.Column('github_url', sa.String(length=500), nullable=False),
        sa.Column('mastodon_url', sa.String(length=500), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        schema=SCHEMA,
    )
    op.create_table(
        'auth_identities',
        _id(),
        _fk('user_id', 'users.id', nullable=False),
        sa.Column('provider', sa.String(length=64), nullable=False),
        sa.Column('provider_user_id', sa.String(length=255), nullable=False),
        sa.Column('provider_email', sa.String(length=255), nullable=True),
        sa.Column('provider_metadata', sa.String(), nullable=True),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint('provider', 'provider_user_id', name='uq_auth_identity_provider_subject'),
        schema=SCHEMA,
    )
    op.create_table(
        'albums',
        _id(),
        sa.Column('slug', sa.String(length=255), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('visibility', sa.String(length=32), nullable=False),
        _fk('created_by', 'users.id', nullable=True),
        _created_at(),
        schema=SCHEMA,
    )
    op.create_table(
        'blog_posts',
        _id(),
        sa.Column('slug', sa.String(length=255), nullable=False, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.String(length=500), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('tags', JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column('read_time', sa.Integer(), nullable=False, server_default='1'),
        _fk('series_id', 'series.id', nullable=True),
        _fk('author_id', 'users.id', nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        _created_at(),
        schema=SCHEMA,
    )
    op.create_table(
        'album_items',
        _id(),
        _fk('album_id', 'albums.id', nullable=False),
        _fk('asset_id', 'assets.id', nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False, server_default=''),
        sa.Column('caption', sa.String(length=255), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        _created_at(),
        schema=SCHEMA,
    )

    _create_index('ix_auth_identities_user_id', 'auth_identities', 'user_id')
    _create_index('ix_album_items_album_id', 'album_items', 'album_id')
    _create_index('ix_album_items_created_at', 'album_items', 'created_at')

    # Seed the singleton settings row (id=1) so the public /api/settings
    # endpoint always has a row to read.
    site_settings = sa.table(
        'site_settings',
        sa.column('id', sa.BigInteger),
        sa.column('site_name', sa.String),
        sa.column('site_subtitle', sa.String),
        sa.column('footer_text', sa.String),
        sa.column('github_url', sa.String),
        sa.column('mastodon_url', sa.String),
        schema=SCHEMA,
    )
    op.bulk_insert(
        site_settings,
        [
            {
                'id': 1,
                'site_name': "BigJade's Notes",
                'site_subtitle': 'Engineering journal, since 2026',
                'footer_text': '© 2026 BigJade',
                'github_url': 'https://github.com',
                'mastodon_url': 'https://mastodon.social',
            }
        ],
    )


def downgrade() -> None:
    for table in (
        'album_items',
        'blog_posts',
        'albums',
        'auth_identities',
        'site_settings',
        'series',
        'assets',
        'users',
    ):
        op.drop_table(table, schema=SCHEMA)
