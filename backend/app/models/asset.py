import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MonitoredAsset(Base):
    __tablename__ = "monitored_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )

    email_encrypted: Mapped[str] = mapped_column(String(500))
    email_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)

    label: Mapped[str] = mapped_column(String(50), default="personal")

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    last_scanned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    owner = relationship(
        "User",
        back_populates="assets",
    )

    breaches = relationship(
        "BreachFinding",
        back_populates="asset",
        cascade="all, delete-orphan",
    )