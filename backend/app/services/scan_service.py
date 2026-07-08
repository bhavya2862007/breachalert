import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_pii
from app.models import AssetStatus, BreachFinding, MonitoredAsset
from app.services.hibp_client import HIBPClient

logger = logging.getLogger("scan")


async def scan_asset(
    db: AsyncSession, hibp: HIBPClient, asset: MonitoredAsset, use_cache: bool = True
) -> list[BreachFinding]:
    """
    Scans a single asset. Returns list of NEWLY discovered findings.
    Only stores breach metadata, never leaked credentials.
    """
    email = decrypt_pii(asset.email_encrypted)
    breaches = await hibp.get_breaches_for_account(email, asset.email_bidx, use_cache)

    existing = {f.breach_name for f in asset.findings}
    new_findings: list[BreachFinding] = []

    for b in breaches:
        name = b.get("Name")
        if name in existing:
            continue
        finding = BreachFinding(
            asset_id=asset.id,
            breach_name=name,
            title=b.get("Title", name),
            breach_date=b.get("BreachDate"),
            data_classes=b.get("DataClasses", []),
            pwn_count=b.get("PwnCount", 0),
            is_new=True,
        )
        db.add(finding)
        new_findings.append(finding)

    asset.last_scanned_at = datetime.now(timezone.utc)
    await db.flush()
    logger.info("Scanned asset %s: %d new findings", asset.id, len(new_findings))
    return new_findings


async def get_active_assets(db: AsyncSession) -> list[MonitoredAsset]:
    result = await db.execute(
        select(MonitoredAsset).where(MonitoredAsset.status == AssetStatus.ACTIVE)
    )
    return list(result.scalars().all())