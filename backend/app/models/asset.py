import uuid
from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Uuid,
    func,
    UniqueConstraint,
)


class MonitoredAsset(Base):
    __tablename__ = "monitored_assets"
    __table_args__ = (
    UniqueConstraint(
        "user_id",
        "email_hash",
        name="uq_user_email",
    ),
)

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    email_encrypted: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    email_hash: Mapped[str] = mapped_column(
        String(64),
        index=True,
        nullable=False,
    )

    label: Mapped[str] = mapped_column(
        String(50),
        default="personal",
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    # NEW
    verification_token: Mapped[str | None] = mapped_column(
        String(128),
        unique=True,
        nullable=True,
    )

    # NEW
    verification_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

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