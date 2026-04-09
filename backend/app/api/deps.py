from typing import Annotated

from fastapi import Depends, Header, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.auth import get_current_user

DbSession = Annotated[Session, Depends(get_db)]


def current_user(
    db: DbSession,
    request: Request,
    x_demo_user: Annotated[str | None, Header(alias="x-demo-user")] = None,
):
    return get_current_user(db, request, x_demo_user)
