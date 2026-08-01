from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.asset import MonitoredAsset
from app.models.user import User

router = APIRouter(
    prefix="/history",
    tags=["History"],
)


@router.get("/{asset_id}")
async def get_history(
    asset_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MonitoredAsset)
        .options(selectinload(MonitoredAsset.breaches))
        .where(
            MonitoredAsset.id == asset_id,
            MonitoredAsset.user_id == current_user.id,
        )
    )

    asset = result.scalar_one_or_none()

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found.",
        )

    history = []

    if asset.last_scanned_at:
        history.append(
            {
                "type": "scan",
                "title": "Scan Completed",
                "time": asset.last_scanned_at,
            }
        )

    for breach in asset.breaches:
        history.append(
            {
                "type": "breach",
                "title": breach.breach_title,
                "time": breach.discovered_at,
            }
        )

    history.sort(
        key=lambda x: x["time"],
        reverse=True,
    )

    return history