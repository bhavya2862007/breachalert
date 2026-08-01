import logging
from datetime import datetime, timezone, date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_email
from app.models.asset import MonitoredAsset
from app.models.breach import BreachFinding
from app.services.hibp_client import HIBPClient
from app.services.notifier import (
    send_email,
    breach_alert_html,
)
from app.services.security_advisor import generate_security_advice

logger = logging.getLogger(__name__)


async def scan_asset(
    db: AsyncSession,
    hibp: HIBPClient,
    asset: MonitoredAsset,
    use_cache: bool = True,
) -> list[BreachFinding]:
    """
    Scan a monitored email against HIBP.

    - Decrypts the stored email
    - Queries Have I Been Pwned
    - Stores only NEW breaches
    - Updates last_scanned_at
    - Sends an email notification if new breaches are found
    """

    email = decrypt_email(asset.email_encrypted)

    breaches = await hibp.get_breaches_for_account(
        email=email,
        email_bidx=asset.email_hash,
        use_cache=use_cache,
    )

    # Fetch existing breaches for this asset
    result = await db.execute(
        select(BreachFinding.breach_name).where(
            BreachFinding.asset_id == asset.id
        )
    )

    existing = set(result.scalars().all())

    new_findings: list[BreachFinding] = []

    for breach in breaches:
        breach_name = breach.get("Name")

        if breach_name in existing:
            continue

        breach_date = breach.get("BreachDate")
        if breach_date:
            try:
                breach_date = date.fromisoformat(breach_date)
            except (ValueError, TypeError):
                breach_date = None

        finding = BreachFinding(
            asset_id=asset.id,
            breach_name=breach_name,
            breach_title=breach.get("Title", breach_name),
            breach_date=breach_date,
            pwn_count=breach.get("PwnCount", 0),
            data_classes=breach.get("DataClasses", []),
            description=breach.get("Description"),
        )

        db.add(finding)
        new_findings.append(finding)

    asset.last_scanned_at = datetime.now(timezone.utc)

    await db.commit()

    logger.info(
        "Scanned %s -> %d new breaches",
        asset.id,
        len(new_findings),
    )

    # Send notification email if new breaches were found
    if new_findings:

        breaches_data = [
            {
                "name": breach.breach_name,
                "title": breach.breach_title,
                "breach_date": (
                    breach.breach_date.isoformat()
                    if breach.breach_date
                    else "Unknown"
                ),
                "pwn_count": breach.pwn_count,
                "data_classes": breach.data_classes,
            }
            for breach in new_findings
        ]

        advisor = generate_security_advice(breaches_data)

        advice = [
            {
                "title": f"Risk Level: {advisor['risk']}",
                "detail": advisor["summary"],
            }
        ]

        advice.extend(
            [
                {
                    "title": recommendation,
                    "detail": "",
                }
                for recommendation in advisor["recommendations"]
            ]
        )

        try:
            await send_email(
                to=email,
                subject="🚨 BreachAlert - New Security Breach Detected",
                html=breach_alert_html(
                    email=email,
                    breach=breaches_data[0],
                    advice=advice,
                ),
            )

            logger.info("Notification email sent to %s", email)

        except Exception as e:
            logger.exception(
                "Failed to send notification email: %s",
                e,
            )

    return new_findings