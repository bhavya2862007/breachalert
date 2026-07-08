from datetime import datetime, timedelta, timezone
from typing import Any
import hashlib
import bcrypt
from jose import jwt
from cryptography.fernet import Fernet
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from app.core.config import settings

_fernet = Fernet(settings.FERNET_KEY.encode())
_serializer = URLSafeTimedSerializer(settings.SECRET_KEY, salt="email-verify")


# ---------- Passwords ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ---------- JWT ----------
def create_token(sub: str, token_type: str = "access") -> str:
    now = datetime.now(timezone.utc)
    if token_type == "access":
        exp = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    else:
        exp = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": sub, "type": token_type, "iat": now, "exp": exp}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


# ---------- Email encryption at rest ----------
def encrypt_email(email: str) -> str:
    return _fernet.encrypt(email.lower().strip().encode()).decode()


def decrypt_email(token: str) -> str:
    return _fernet.decrypt(token.encode()).decode()


def email_hash(email: str) -> str:
    """Deterministic hash so we can dedupe/lookup without storing plaintext."""
    return hashlib.sha256(email.lower().strip().encode()).hexdigest()


# ---------- Signed verification tokens ----------
def make_verify_token(email: str) -> str:
    return _serializer.dumps(email)


def read_verify_token(token: str, max_age: int = 86400) -> str | None:
    try:
        return _serializer.loads(token, max_age=max_age)
    except (BadSignature, SignatureExpired):
        return None