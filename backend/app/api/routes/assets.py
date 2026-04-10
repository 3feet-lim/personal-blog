from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select

from app.api.deps import DbSession, current_user
from app.models import Asset
from app.services.auth import require_family_access
from app.services.storage import get_storage_adapter

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("/{asset_id}/content")
def get_asset_content(asset_id: int, db: DbSession, user=Depends(current_user)):
    asset = db.scalar(select(Asset).where(Asset.id == asset_id))
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found.")

    if asset.visibility == "private":
        require_family_access(user)

    adapter = get_storage_adapter()
    content = adapter.download_bytes(asset.object_key)
    return Response(content=content, media_type=asset.mime_type)
