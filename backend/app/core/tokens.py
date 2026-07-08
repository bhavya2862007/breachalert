import secrets
from datetime import datetime, timedelta, timezone

from itsdangerous import BadSignature, URLSafeTimedSerializer

from app.core.config import settings

_serializer = URLSafeTimedSerializer(settings.SECRET_KEY, salt="email-verify")


def generate_verification_token(asset_id: str) -> str:
    return _serializer.dumps({"asset_id": asset_id, "nonce": secrets.token_hex(8)})


def verify_verification_token(token: str, max_age_hours: int = 48) -> str | None:
    try:
        data = _serializer.loads(token, max_age=max_age_hours * 3600)
        return data.get("asset_id")
    except BadSignature:
        return None