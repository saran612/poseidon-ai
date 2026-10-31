from typing import Optional
from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from poseidon.core.database import Base
from poseidon.models.base import CommonModelMixin


class AuditEvent(Base, CommonModelMixin):
    __tablename__ = "audit_events"

    entity_type: Mapped[str] = mapped_column(String(64), index=True)
    entity_id: Mapped[str] = mapped_column(String(64), index=True)
    action: Mapped[str] = mapped_column(String(64), index=True)
    actor: Mapped[str] = mapped_column(String(64), default="SYSTEM")
    
    # Latency tracking (t_ingested, t_verified, t_prioritized, t_proposed)
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)

    details_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

