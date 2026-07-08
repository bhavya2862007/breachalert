import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PlanTier(str, enum.Enum):
    free = "free"
    family = "family"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    plan: Mapped[PlanTier] = mapped_column(Enum(PlanTier), default=PlanTier.free)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)  # for SMS

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    assets = relationship("MonitoredAsset", back_populates="owner", cascade="all, delete-orphan")

    @property
    def asset_limit(self) -> int:
        return {PlanTier.free: 1, PlanTier.family: 5}[self.plan]

    @property
    def auto_scan_enabled(self) -> bool:
        return self.plan == PlanTier.family

    @property
    def sms_enabled(self) -> bool:
        return self.plan == PlanTier.family