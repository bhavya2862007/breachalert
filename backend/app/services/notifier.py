import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, html: str) -> bool:
    if not settings.SENDGRID_API_KEY:
        logger.warning("SendGrid not configured — skipping email")
        return False
    payload = {
        "personalizations": [{"to": [{"email": to}]}],
        "from": {"email": settings.FROM_EMAIL, "name": "BreachAlert"},
        "subject": subject,
        "content": [{"type": "text/html", "value": html}],
    }
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {settings.SENDGRID_API_KEY}"},
            json=payload,
        )
    ok = r.status_code < 300
    if not ok:
        logger.error(f"SendGrid error {r.status_code}: {r.text}")
    return ok


async def send_sms(to: str, body: str) -> bool:
    if not (settings.TWILIO_SID and settings.TWILIO_TOKEN):
        logger.warning("Twilio not configured — skipping SMS")
        return False
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_SID}/Messages.json",
            auth=(settings.TWILIO_SID, settings.TWILIO_TOKEN),
            data={"From": settings.TWILIO_FROM, "To": to, "Body": body},
        )
    return r.status_code < 300


def verification_email_html(link: str) -> str:
    return f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0f2f6b">Confirm your BreachAlert subscription</h2>
      <p>Someone (hopefully you) added this email to BreachAlert monitoring.
      To prevent misuse, please confirm you own this address.</p>
      <a href="{link}" style="display:inline-block;background:#e11d2e;color:#fff;
         padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
         Confirm Monitoring</a>
      <p style="color:#888;font-size:12px;margin-top:24px">
      If you didn't request this, ignore this email — nothing will be monitored.</p>
    </div>"""


def breach_alert_html(email: str, breach: dict, advice: list[dict]) -> str:
    tips = "".join(
        f"<li><b>{a['title']}</b><br><span style='color:#555'>{a['detail']}</span></li>"
        for a in advice
    )
    dcs = ", ".join(breach["data_classes"])
    return f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#e11d2e">⚠️ New breach detected</h2>
      <p>Your email <b>{email}</b> appeared in a new data breach:</p>
      <div style="border:1px solid #eee;border-radius:10px;padding:16px">
        <h3 style="margin:0">{breach['title']}</h3>
        <p style="color:#666">Breach date: {breach.get('breach_date','?')} ·
           {breach.get('pwn_count',0):,} accounts</p>
        <p><b>Exposed data:</b> {dcs}</p>
      </div>
      <h3 style="margin-top:24px">Recommended actions</h3>
      <ul style="line-height:1.6">{tips}</ul>
    </div>"""