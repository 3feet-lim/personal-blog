"""Database engine construction for local PostgreSQL and Aurora DSQL."""

import boto3
from sqlalchemy import create_engine, event
from sqlalchemy.engine import URL, Engine

from app.core.config import Settings

DSQL_PORT = 5432
DSQL_DATABASE = "postgres"
DSQL_ADMIN_USER = "admin"
DSQL_TOKEN_TTL_SECONDS = 900
# DSQL closes every connection after one hour, so recycle well before that.
DSQL_POOL_RECYCLE_SECONDS = 1800


def build_engine(settings: Settings) -> Engine:
    if not settings.use_dsql:
        return create_engine(settings.database_url, future=True)

    url = URL.create(
        "postgresql+psycopg2",
        username=settings.dsql_user,
        host=settings.dsql_endpoint,
        port=DSQL_PORT,
        database=DSQL_DATABASE,
        query={"sslmode": "require"},
    )
    engine = create_engine(
        url,
        future=True,
        pool_pre_ping=True,
        pool_recycle=DSQL_POOL_RECYCLE_SECONDS,
    )
    client = boto3.client("dsql", region_name=settings.dsql_region)

    # IAM tokens expire, so a fresh one is issued for every new connection.
    @event.listens_for(engine, "do_connect")
    def _inject_auth_token(dialect, conn_rec, cargs, cparams):
        cparams["password"] = _generate_auth_token(client, settings)

    return engine


def _generate_auth_token(client, settings: Settings) -> str:
    if settings.dsql_user == DSQL_ADMIN_USER:
        generate = client.generate_db_connect_admin_auth_token
    else:
        generate = client.generate_db_connect_auth_token
    return generate(
        Hostname=settings.dsql_endpoint,
        Region=settings.dsql_region,
        ExpiresIn=DSQL_TOKEN_TTL_SECONDS,
    )
