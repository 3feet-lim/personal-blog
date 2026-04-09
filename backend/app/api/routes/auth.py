import secrets
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from app.api.deps import current_user
from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models import User
from app.schemas import DevLoginIn
from app.services.auth import (
    build_google_auth_url,
    exchange_google_code,
    google_configured,
    resolve_provider_user,
)

router = APIRouter(prefix="/api", tags=["auth"])


@router.get("/auth/providers")
def auth_providers():
    settings = get_settings()
    return {
        "providers": [
            {
                "name": settings.default_auth_provider,
                "status": "configured" if google_configured(settings) else "scaffolded",
                "configured": google_configured(settings),
                "login_url": "/api/auth/login/google",
                "redirect_uri": settings.google_redirect_uri,
            }
        ]
    }


@router.get("/auth/login/google")
def login_google(request: Request):
    settings = get_settings()
    if not google_configured(settings):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured.",
        )

    state = secrets.token_urlsafe(24)
    request.session["google_oauth_state"] = state
    return RedirectResponse(build_google_auth_url(settings, state))


@router.get("/auth/callback/google")
async def callback_google(request: Request, code: str | None = None, state: str | None = None):
    settings = get_settings()
    expected_state = request.session.get("google_oauth_state")
    if not code or not state or state != expected_state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth callback.")

    profile = await exchange_google_code(settings, code)
    with SessionLocal() as db:
        user = resolve_provider_user(db, profile)

    request.session["user_email"] = user.email
    request.session.pop("google_oauth_state", None)
    next_path = "/admin" if user.role == "admin" else "/album"
    redirect_query = urlencode(
        {
            "email": user.email,
            "next": next_path,
            "oauth": "success",
        }
    )
    return RedirectResponse(f"{settings.frontend_url}/auth/oauth-complete?{redirect_query}", status_code=302)


@router.post("/auth/dev-login")
def dev_login(payload: DevLoginIn, request: Request):
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == payload.email))
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown demo user.")

    request.session["user_email"] = user.email
    request.session["auth_provider"] = "dev"
    return {"ok": True, "email": user.email}


@router.post("/auth/logout")
def logout(request: Request):
    request.session.clear()
    return {"ok": True}


@router.get("/me")
def me(user=Depends(current_user)):
    if user is None:
        return {
            "user": {
                "email": "anonymous",
                "name": "Anonymous",
                "role": "anonymous",
                "approved": False,
                "familyAccess": False,
            }
        }

    return {
        "user": {
            "email": user.email,
            "name": user.display_name,
            "role": "family" if user.family_access and user.role != "admin" else user.role,
            "approved": user.approved,
            "familyAccess": user.family_access,
        }
    }
