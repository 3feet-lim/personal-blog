from logging.config import fileConfig

from alembic import context
from sqlalchemy import text

from app.core.config import get_settings
from app.db.engine import build_engine
from app.db.session import Base
from app.models import Album, AlbumItem, Asset, AuthIdentity, BlogPost, Series, SiteSettings, User  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table_schema=settings.db_schema,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = build_engine(settings)

    with engine.connect() as connection:
        # The version table lives in the app schema, so the schema must exist
        # before Alembic looks for it.
        connection.execute(text(f"CREATE SCHEMA IF NOT EXISTS {settings.db_schema}"))
        connection.commit()

        if settings.use_dsql:
            # DSQL allows one DDL statement per transaction and no DDL mixed
            # with DML, so every statement commits on its own.
            connection = connection.execution_options(isolation_level="AUTOCOMMIT")

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            version_table_schema=settings.db_schema,
        )

        with context.begin_transaction():
            context.run_migrations()

    engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
