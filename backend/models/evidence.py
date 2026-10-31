from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.core.database import Base
from backend.models.base import CommonModelMixin


class EvidenceCluster(Base, CommonModelMixin):
    __tablename__ = "evidence_clusters"

    incident_type: Mapped[str] = mapped_column(String(64), index=True)
    centroid_lat: Mapped[float] = mapped_column(Float)
    centroid_lon: Mapped[float] = mapped_column(Float)
    radius_meters: Mapped[float] = mapped_column(Float, default=300.0)

    c_support: Mapped[float] = mapped_column(Float, default=0.0)
    c_contra: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(32), default="UNVERIFIED")  # VERIFIED, CORROBORATED, DISPUTED, STALE, UNVERIFIED

    independent_sources_count: Mapped[int] = mapped_column(Integer, default=0)
    has_authoritative_source: Mapped[bool] = mapped_column(Boolean, default=False)  # T1 or T2 present
    estimated_people_affected: Mapped[int] = mapped_column(Integer, default=0)

    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

    evidence_items: Mapped[list["Evidence"]] = relationship("Evidence", back_populates="cluster")


class Evidence(Base, CommonModelMixin):
    __tablename__ = "evidence"

    message_id: Mapped[str] = mapped_column(String(64), ForeignKey("messages.id"), index=True)
    cluster_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("evidence_clusters.id"), nullable=True, index=True)

    incident_type: Mapped[str] = mapped_column(String(64), index=True)
    source_tier: Mapped[str] = mapped_column(String(8), default="T4")  # T1, T2, T3, T4

    # Confidence Formulation Components
    base_tier: Mapped[float] = mapped_column(Float, default=0.20)
    reputation: Mapped[float] = mapped_column(Float, default=1.0)
    freshness: Mapped[float] = mapped_column(Float, default=1.0)
    specificity: Mapped[float] = mapped_column(Float, default=0.8)
    confidence: Mapped[float] = mapped_column(Float, default=0.16)  # clamped product

    # Status Precedence
    status: Mapped[str] = mapped_column(String(32), default="UNVERIFIED")

    # Domain timing
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    half_life_min: Mapped[int] = mapped_column(Integer, default=120)

    # Spatial
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    location_precision_meters: Mapped[float] = mapped_column(Float, default=10.0)

    # Contradiction flag
    is_contradiction: Mapped[bool] = mapped_column(Boolean, default=False)
    contradicts_evidence_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

    cluster: Mapped[Optional["EvidenceCluster"]] = relationship("EvidenceCluster", back_populates="evidence_items")


class SourceReputation(Base, CommonModelMixin):
    __tablename__ = "source_reputations"

    source_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    reputation_score: Mapped[float] = mapped_column(Float, default=1.0)  # [0.5, 1.2]
    total_reports: Mapped[int] = mapped_column(Integer, default=0)
    verified_reports: Mapped[int] = mapped_column(Integer, default=0)
    disputed_reports: Mapped[int] = mapped_column(Integer, default=0)


class Sensor(Base, CommonModelMixin):
    __tablename__ = "sensors"

    sensor_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    sensor_type: Mapped[str] = mapped_column(String(64))  # WATER_LEVEL, RAINGAUGE, FLOW
    waterway: Mapped[str] = mapped_column(String(128))  # Noyyal River, Singanallur Lake
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    last_reading_value: Mapped[float] = mapped_column(Float, default=0.0)
    threshold_warning: Mapped[float] = mapped_column(Float, default=2.0)
    threshold_critical: Mapped[float] = mapped_column(Float, default=3.5)
    unit: Mapped[str] = mapped_column(String(32), default="meters")
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

