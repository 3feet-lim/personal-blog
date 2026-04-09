from dataclasses import dataclass
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.models import AuthIdentity, User


@dataclass
class ProviderProfile:
    provider: str
    subject: str
    email: str
    display_name: str


class OAuthProvider:
    name: str = "provider"

    def normalize(self, email: str) -> ProviderProfile:
        subject = email.split("@", maxsplit=1)[0]
        return ProviderProfile(
            provider=self.name,
            subject=subject,
            email=email,
            display_name=subject.replace(".", " ").title(),
        )


class GoogleProvider(OAuthProvider):
    name = "google"


PROVIDERS = {"google": GoogleProvider()}


def get_current_user(db: Session, request: Request, x_demo_user: str | None = None) -> User | None:
    email = x_demo_user or request.session.get("user_email")
    if not email:
        return None

    return db.scalar(select(User).where(User.email == email))


def google_configured(settings: Settings | None = None) -> bool:
    current = settings or get_settings()
    return bool(
        current.google_client_id
        and current.google_client_secret
        and current.google_redirect_uri
    )


def build_google_auth_url(settings: Settings, state: str) -> str:
    query = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
    )
    return f"https://accounts.google.com/o/oauth2/v2/auth?{query}"


async def exchange_google_code(settings: Settings, code: str) -> ProviderProfile:
    async with httpx.AsyncClient(timeout=10.0) as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_response.raise_for_status()
        token_payload = token_response.json()

        userinfo_response = await client.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {token_payload['access_token']}"},
        )
        userinfo_response.raise_for_status()
        userinfo = userinfo_response.json()

    return ProviderProfile(
        provider="google",
        subject=userinfo["sub"],
        email=userinfo["email"],
        display_name=userinfo.get("name") or userinfo["email"].split("@", maxsplit=1)[0],
    )


def resolve_provider_user(db: Session, profile: ProviderProfile) -> User:
    identity = db.scalar(
        select(AuthIdentity).where(
            AuthIdentity.provider == profile.provider,
            AuthIdentity.provider_user_id == profile.subject,
        )
    )
    if identity is not None:
        return identity.user

    user = db.scalar(select(User).where(User.email == profile.email))
    if user is None or not user.approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not pre-approved.",
        )

    db.add(
        AuthIdentity(
            user_id=user.id,
            provider=profile.provider,
            provider_user_id=profile.subject,
            provider_email=profile.email,
        )
    )
    db.commit()
    db.refresh(user)
    return user


def require_family_access(user: User | None) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    if not user.approved or not (user.family_access or user.role == "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Family access required.")
    return user


def require_admin(user: User | None) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return user
