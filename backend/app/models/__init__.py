import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class PlanTier(str, enum.Enum):
    FREE = "free"
    FAMILY = "family"


class AssetStatus(str, enum.Enum):
    PENDING = "pending"       # awaiting email confirmation
    ACTIVE = "active"         # verified & monitored
    DISABLED = "disabled"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    plan: Mapped[PlanTier] = mapped_column(Enum(PlanTier), default=PlanTier.FREE)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)  # SMS alerts
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    assets: Mapped[list["MonitoredAsset"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class MonitoredAsset(Base):
    """An email address a user wants monitored. Email stored ENCRYPTED."""
    __tablename__ = "monitored_assets"
    __table_args__ = (UniqueConstraint("user_id", "email_bidx", name="uq_user_email"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(50), default="personal")

    # Encrypted email + deterministic blind index for lookups
    email_encrypted: Mapped[str] = mapped_column(Text)
    email_bidx: Mapped[str] = mapped_column(String(64), index=True)

    status: Mapped[AssetStatus] = mapped_column(Enum(AssetStatus), default=AssetStatus.PENDING)
    last_scanned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    user: Mapped["User"] = relationship(back_populates="assets")
    findings: Mapped[list["BreachFinding"]] = relationship(
        back_populates="asset", cascade="all, delete-orphan"
    )


class BreachFinding(Base):
    """
    Links an asset to a breach. We store the breach NAME + metadata only.
    We never store leaked passwords or the actual leaked content.
    """
    __tablename__ = "breach_findings"
    __table_args__ = (UniqueConstraint("asset_id", "breach_name", name="uq_asset_breach"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    asset_id: Mapped[str] = mapped_column(ForeignKey("monitored_assets.id", ondelete="CASCADE"), index=True)
    breach_name: Mapped[str] = mapped_column(String(120))
    title: Mapped[str] = mapped_column(String(200), default="")
    breach_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    data_classes: Mapped[list] = mapped_column(JSONB, default=list)  # ["Passwords","Emails"]
    pwn_count: Mapped[int] = mapped_column(Integer, default=0)
    is_new: Mapped[bool] = mapped_column(Boolean, default=True)  # alerted yet?
    alerted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    discovered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    asset: Mapped["MonitoredAsset"] = relationship(back_populates="findings")