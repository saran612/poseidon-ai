from dataclasses import dataclass, field
from datetime import datetime, timezone
import math
from typing import Dict, List, Optional, Tuple
from enum import Enum

from poseidon.ingestion.envelope import AuthStatus, NormalizedEnvelope, SourceTier


class EvidenceStatus(str, Enum):
    REJECTED = "REJECTED"
    DISPUTED = "DISPUTED"
    STALE = "STALE"
    VERIFIED = "VERIFIED"
    CORROBORATED = "CORROBORATED"
    UNVERIFIED = "UNVERIFIED"


HALF_LIVES_MIN: Dict[str, float] = {
    "WATER_LEVEL": 30.0,
    "SENSOR": 30.0,
    "CASUALTY": 60.0,
    "PEOPLE_TRAPPED": 60.0,
    "CITIZEN_REPORT": 120.0,
    "ROAD_STATUS": 180.0,
    "GOVERNMENT_ALERT": 360.0,
}


@dataclass
class EvaluatedEvidence:
    evidence_id: str
    message_id: str
    incident_type: str
    source_tier: SourceTier
    base_tier: float
    reputation: float
    freshness: float
    specificity: float
    confidence: float
    status: EvidenceStatus
    observed_at: datetime
    age_minutes: float
    latitude: Optional[float]
    longitude: Optional[float]
    location_precision_m: float
    people_affected: int
    is_contradiction: bool = False
    details: Dict[str, any] = field(default_factory=dict)


@dataclass
class ClusterSummary:
    cluster_id: str
    incident_type: str
    centroid_lat: float
    centroid_lon: float
    c_support: float
    c_contra: float
    status: EvidenceStatus
    independent_sources_count: int
    has_tier1_or_tier2: bool
    estimated_people: int
    evidence_items: List[EvaluatedEvidence] = field(default_factory=list)


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two coordinates."""
    r = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


class EvidenceTrustEngine:
    """Deterministic Evidence Trust Engine implementing confidence decay, corroboration clustering, and asymmetric safety."""

    def __init__(self):
        self.reputations: Dict[str, float] = {}  # source_id -> reputation [0.5, 1.2]
        self.road_states: Dict[str, Dict[str, any]] = {}  # road_id -> {status, tier, observed_at}

    def get_reputation(self, source_id: Optional[str]) -> float:
        if not source_id or source_id not in self.reputations:
            return 1.0
        return max(0.5, min(1.2, self.reputations[source_id]))

    def set_reputation(self, source_id: str, reputation: float) -> None:
        self.reputations[source_id] = max(0.5, min(1.2, reputation))

    def calculate_freshness(self, observed_at: datetime, incident_type: str, now: Optional[datetime] = None) -> Tuple[float, float]:
        """Calculate exponential freshness decay from observed_at.
        
        Formula: freshness = 0.5 ** (age_min / half_life_min)
        """
        if now is None:
            now = datetime.now(timezone.utc)

        # Normalize timezones
        obs_utc = observed_at if observed_at.tzinfo else observed_at.replace(tzinfo=timezone.utc)
        now_utc = now if now.tzinfo else now.replace(tzinfo=timezone.utc)

        age_seconds = (now_utc - obs_utc).total_seconds()
        age_minutes = max(0.0, age_seconds / 60.0)

        # Look up half life
        inc_key = incident_type.upper()
        half_life = HALF_LIVES_MIN.get(inc_key, 120.0)
        for key, hl in HALF_LIVES_MIN.items():
            if key in inc_key:
                half_life = hl
                break

        freshness = 0.5 ** (age_minutes / half_life)
        return max(0.0, min(1.0, freshness)), age_minutes

    def calculate_specificity(self, precision_meters: float, has_coords: bool, has_people: bool) -> float:
        """Calculate specificity factor between 0.6 and 1.0."""
        if not has_coords:
            return 0.60
        if precision_meters <= 20.0:
            return 1.0 if has_people else 0.95
        if precision_meters <= 200.0:
            return 0.85
        return 0.70  # Coarse location

    def evaluate_envelope(
        self,
        envelope: NormalizedEnvelope,
        incident_type: str = "FLOOD_WATER_LEVEL",
        is_contradiction: bool = False,
        now: Optional[datetime] = None,
    ) -> EvaluatedEvidence:
        """Evaluate single incoming normalized envelope into scored evidence."""
        if envelope.authentication_status in (AuthStatus.INVALID_MAC, AuthStatus.MALFORMED):
            return EvaluatedEvidence(
                evidence_id=f"ev-{envelope.message_id}",
                message_id=envelope.message_id,
                incident_type=incident_type,
                source_tier=envelope.source_tier,
                base_tier=0.0,
                reputation=1.0,
                freshness=0.0,
                specificity=0.6,
                confidence=0.0,
                status=EvidenceStatus.REJECTED,
                observed_at=envelope.observed_at,
                age_minutes=0.0,
                latitude=envelope.latitude,
                longitude=envelope.longitude,
                location_precision_m=envelope.location_precision_meters,
                people_affected=envelope.people_affected,
                is_contradiction=is_contradiction,
                details={"reason": "Rejected authentication or malformed packet"},
            )

        # Base tier
        tier_weights = {
            SourceTier.T1: 0.90,
            SourceTier.T2: 0.75,
            SourceTier.T3: 0.45,
            SourceTier.T4: 0.20,
        }
        base_tier = tier_weights.get(envelope.source_tier, 0.20)

        # Reputation
        reputation = self.get_reputation(envelope.device_id)

        # Freshness
        freshness, age_minutes = self.calculate_freshness(envelope.observed_at, incident_type, now=now)

        # Specificity
        has_coords = envelope.latitude is not None and envelope.longitude is not None
        specificity = self.calculate_specificity(
            envelope.location_precision_meters, has_coords, envelope.people_affected > 0
        )

        # Confidence: c_i = base_tier * reputation * freshness * specificity, clamped to 1.0
        confidence = min(1.0, base_tier * reputation * freshness * specificity)

        # Initial single-item status
        if freshness < 0.25:
            init_status = EvidenceStatus.STALE
        elif envelope.source_tier == SourceTier.T1 and confidence >= 0.85:
            init_status = EvidenceStatus.VERIFIED
        else:
            init_status = EvidenceStatus.UNVERIFIED

        return EvaluatedEvidence(
            evidence_id=f"ev-{envelope.message_id}",
            message_id=envelope.message_id,
            incident_type=incident_type,
            source_tier=envelope.source_tier,
            base_tier=base_tier,
            reputation=reputation,
            freshness=freshness,
            specificity=specificity,
            confidence=confidence,
            status=init_status,
            observed_at=envelope.observed_at,
            age_minutes=age_minutes,
            latitude=envelope.latitude,
            longitude=envelope.longitude,
            location_precision_m=envelope.location_precision_meters,
            people_affected=envelope.people_affected,
            is_contradiction=is_contradiction,
        )

    def cluster_and_evaluate(
        self,
        evidence_list: List[EvaluatedEvidence],
        spatial_threshold_m: float = 300.0,
        temporal_window_min: float = 90.0,
    ) -> List[ClusterSummary]:
        """Group evidence into independence clusters and compute corroboration / contradiction status."""
        clusters: List[ClusterSummary] = []

        # Filter out rejected items
        valid_items = [e for e in evidence_list if e.status != EvidenceStatus.REJECTED]

        for ev in valid_items:
            assigned = False
            for cl in clusters:
                if cl.incident_type != ev.incident_type:
                    continue

                if ev.latitude is not None and ev.longitude is not None:
                    dist = haversine_distance_meters(
                        ev.latitude, ev.longitude, cl.centroid_lat, cl.centroid_lon
                    )
                    # Widen radius if location precision is coarse
                    effective_radius = spatial_threshold_m + max(0.0, ev.location_precision_m - 20.0)
                    if dist <= effective_radius:
                        cl.evidence_items.append(ev)
                        # Recompute centroid
                        cl.centroid_lat = sum(e.latitude for e in cl.evidence_items if e.latitude) / len(cl.evidence_items)
                        cl.centroid_lon = sum(e.longitude for e in cl.evidence_items if e.longitude) / len(cl.evidence_items)
                        assigned = True
                        break

            if not assigned:
                cl_lat = ev.latitude if ev.latitude is not None else 10.998
                cl_lon = ev.longitude if ev.longitude is not None else 76.965
                clusters.append(
                    ClusterSummary(
                        cluster_id=f"cl-{len(clusters)+1}",
                        incident_type=ev.incident_type,
                        centroid_lat=cl_lat,
                        centroid_lon=cl_lon,
                        c_support=0.0,
                        c_contra=0.0,
                        status=EvidenceStatus.UNVERIFIED,
                        independent_sources_count=0,
                        has_tier1_or_tier2=False,
                        estimated_people=0,
                        evidence_items=[ev],
                    )
                )

        # Evaluate each cluster
        for cl in clusters:
            supporting_items = [e for e in cl.evidence_items if not e.is_contradiction]
            contra_items = [e for e in cl.evidence_items if e.is_contradiction]

            # Corroboration formula: C_support = 1 - PRODUCT(1 - c_k)
            prod_support = 1.0
            for item in supporting_items:
                prod_support *= (1.0 - item.confidence)
            raw_c_support = 1.0 - prod_support

            prod_contra = 1.0
            for item in contra_items:
                prod_contra *= (1.0 - item.confidence)
            c_contra = 1.0 - prod_contra

            # Check if authoritative source (T1 or T2) exists
            has_t1 = any(e.source_tier == SourceTier.T1 for e in supporting_items)
            has_t2 = any(e.source_tier == SourceTier.T2 for e in supporting_items)
            has_auth = has_t1 or has_t2
            cl.has_tier1_or_tier2 = has_auth

            # CAP RULE: If no T1 or T2 source exists in independent set, cap C_support at 0.60!
            # Public reports alone must never achieve Verified status.
            c_support = min(0.60, raw_c_support) if not has_auth else raw_c_support
            cl.c_support = c_support
            cl.c_contra = c_contra
            cl.independent_sources_count = len(supporting_items)

            # Conservative people count (maximum or median, not sum of duplicates)
            people_counts = [e.people_affected for e in supporting_items if e.people_affected > 0]
            cl.estimated_people = max(people_counts) if people_counts else 0

            # Freshness check across supporting items
            best_freshness = max([e.freshness for e in supporting_items], default=0.0)

            # Deterministic Status Precedence:
            # 1. Disputed: C_support >= 0.4 and C_contra >= 0.4
            if c_support >= 0.4 and c_contra >= 0.4:
                cl.status = EvidenceStatus.DISPUTED
            # 2. Stale: best supporting freshness < 0.25
            elif best_freshness < 0.25:
                cl.status = EvidenceStatus.STALE
            # 3. Verified: T1 exists, C_support >= 0.85 and C_contra < 0.2
            elif has_t1 and c_support >= 0.85 and c_contra < 0.2:
                cl.status = EvidenceStatus.VERIFIED
            # 4. Corroborated: at least two independent sources and C_support >= 0.65
            elif len(supporting_items) >= 2 and c_support >= 0.65 and c_contra < 0.4:
                cl.status = EvidenceStatus.CORROBORATED
            else:
                cl.status = EvidenceStatus.UNVERIFIED

            # Propagate cluster status to items
            for e in cl.evidence_items:
                e.status = cl.status

        return clusters

    def update_road_status(
        self,
        road_id: str,
        incoming_status: str,  # "OPEN" or "CLOSED"
        source_tier: SourceTier,
        observed_at: datetime,
    ) -> Tuple[str, str]:
        """Asymmetric safety rule for roads:
        - Roads treat as closed until a fresher equal-or-higher-tier source reopens them.
        - Contradictory reports keep road closed.
        """
        tier_ranks = {
            SourceTier.T1: 4,
            SourceTier.T2: 3,
            SourceTier.T3: 2,
            SourceTier.T4: 1,
        }
        inc_rank = tier_ranks.get(source_tier, 1)

        current = self.road_states.get(road_id)
        if not current:
            self.road_states[road_id] = {
                "status": incoming_status,
                "tier": source_tier,
                "tier_rank": inc_rank,
                "observed_at": observed_at,
            }
            return incoming_status, f"Initial road status set to {incoming_status}"

        curr_status = current["status"]
        curr_rank = current["tier_rank"]
        curr_time = current["observed_at"]

        # If current is CLOSED, reopening requires fresher equal-or-higher tier
        if curr_status == "CLOSED" and incoming_status == "OPEN":
            if inc_rank < curr_rank:
                return "CLOSED", f"Reopen rejected: incoming tier {source_tier.value} lower than closure tier {current['tier'].value}"
            if observed_at <= curr_time:
                return "CLOSED", "Reopen rejected: reopen report is not fresher than closure report"
            # Valid higher/equal fresher reopen
            self.road_states[road_id] = {
                "status": "OPEN",
                "tier": source_tier,
                "tier_rank": inc_rank,
                "observed_at": observed_at,
            }
            return "OPEN", f"Road reopened by fresher {source_tier.value} evidence"

        # If incoming is CLOSED, close it conservatively
        if incoming_status == "CLOSED":
            if curr_status == "OPEN":
                # Close if from any credible source or newer
                self.road_states[road_id] = {
                    "status": "CLOSED",
                    "tier": source_tier,
                    "tier_rank": inc_rank,
                    "observed_at": observed_at,
                }
                return "CLOSED", f"Road marked CLOSED by {source_tier.value} report"

        return current["status"], "Road status unchanged"

