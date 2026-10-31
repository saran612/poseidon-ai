from typing import Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.core.database import Base
from backend.models.base import CommonModelMixin


class Zone(Base, CommonModelMixin):
    __tablename__ = "zones"

    zone_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Geographic bounds & centroid
    centroid_lat: Mapped[float] = mapped_column(Float)
    centroid_lon: Mapped[float] = mapped_column(Float)
    polygon_geojson: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Demographics & Hazard baseline
    population: Mapped[int] = mapped_column(Integer, default=5000)
    vulnerability_index: Mapped[float] = mapped_column(Float, default=0.5)  # [0, 1]
    elevation_meters: Mapped[float] = mapped_column(Float, default=410.0)

    # Calculated Prioritization
    life_threat_factor: Mapped[float] = mapped_column(Float, default=0.0)
    exposure_factor: Mapped[float] = mapped_column(Float, default=0.0)
    access_loss_factor: Mapped[float] = mapped_column(Float, default=0.0)
    trend_factor: Mapped[float] = mapped_column(Float, default=0.0)

    score_expected: Mapped[float] = mapped_column(Float, default=0.0)
    score_upper: Mapped[float] = mapped_column(Float, default=0.0)
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    priority_rank: Mapped[int] = mapped_column(Integer, default=999)
    priority_tier: Mapped[str] = mapped_column(String(32), default="LOW")  # CRITICAL, HIGH, MEDIUM, LOW
    verify_next: Mapped[bool] = mapped_column(Boolean, default=False)

    explanation_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

    incidents: Mapped[list["Incident"]] = relationship("Incident", back_populates="zone")


class Incident(Base, CommonModelMixin):
    __tablename__ = "incidents"

    incident_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    zone_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("zones.id"), nullable=True, index=True)
    cluster_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("evidence_clusters.id"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(128))
    incident_type: Mapped[str] = mapped_column(String(64), index=True)
    severity: Mapped[str] = mapped_column(String(32), default="MEDIUM")
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE")  # ACTIVE, RESOLVED, REVISED

    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    people_affected: Mapped[int] = mapped_column(Integer, default=0)

    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False)

    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="incidents")

