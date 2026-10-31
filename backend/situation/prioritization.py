from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from backend.geospatial.corridor import ZoneDefinition, COIMBATORE_ZONES
from backend.trust.engine import ClusterSummary, EvidenceStatus


WEIGHT_LIFE_THREAT = 0.35
WEIGHT_EXPOSURE = 0.20
WEIGHT_VULNERABILITY = 0.20
WEIGHT_ACCESS_LOSS = 0.15
WEIGHT_TREND = 0.10


@dataclass
class ZoneExplanation:
    zone_id: str
    zone_name: str
    rank: int
    tier: str  # CRITICAL, HIGH, MEDIUM, LOW
    score_expected: float
    score_upper: float
    confidence: float
    factor_breakdown: Dict[str, float]
    evidence_ids: List[str]
    evidence_summary: str
    flags: List[str]
    what_would_change_this: str
    data_freshness_min: float
    is_synthetic: bool = True
    verify_next: bool = False


class DisasterPrioritizationEngine:
    """Multi-factor explainable disaster prioritization engine with interval scoring and critical override."""

    def __init__(self, zones: Optional[List[ZoneDefinition]] = None):
        self.zones = {z.zone_code: z for z in (zones or COIMBATORE_ZONES)}

    def calculate_priorities(
        self,
        clusters: List[ClusterSummary],
        road_closures_by_zone: Optional[Dict[str, int]] = None,
        now: Optional[datetime] = None,
    ) -> List[ZoneExplanation]:
        if now is None:
            now = datetime.now(timezone.utc)
        road_closures = road_closures_by_zone or {}

        # Aggregate evidence by nearest zone
        zone_evidence_map: Dict[str, List[ClusterSummary]] = {code: [] for code in self.zones}
        for cl in clusters:
            # Find closest zone
            closest_code = "ZONE_SINGANALLUR"
            min_d = 999999.0
            for code, z in self.zones.items():
                d = (cl.centroid_lat - z.centroid_lat)**2 + (cl.centroid_lon - z.centroid_lon)**2
                if d < min_d:
                    min_d = d
                    closest_code = code
            zone_evidence_map[closest_code].append(cl)

        scored_zones: List[ZoneExplanation] = []

        for code, z in self.zones.items():
            ev_list = zone_evidence_map[code]
            verified_or_corrob = [cl for cl in ev_list if cl.status in (EvidenceStatus.VERIFIED, EvidenceStatus.CORROBORATED)]
            unverified_claims = [cl for cl in ev_list if cl.status == EvidenceStatus.UNVERIFIED]

            # 1. Life threat factor (0 to 1)
            # Expected people based on verified/corroborated evidence
            people_expected = sum(cl.estimated_people for cl in verified_or_corrob)
            # Upper bound includes all unverified casualty/trapped claims
            people_upper = people_expected + sum(cl.estimated_people for cl in unverified_claims)

            # Normalized life threat: capped at 100 people
            factor_life_expected = min(1.0, people_expected / 50.0)
            factor_life_upper = min(1.0, people_upper / 50.0)

            # 2. Exposure factor: population density and active flood clusters
            active_clusters_cnt = len(ev_list)
            factor_exposure = min(1.0, (z.population / 45000.0) * 0.6 + min(active_clusters_cnt * 0.2, 0.4))

            # 3. Vulnerability factor: demographic vulnerability baseline
            factor_vulnerability = min(1.0, z.vulnerability_index)

            # 4. Access loss factor: road/bridge cuts impacting this zone
            cut_count = road_closures.get(code, 0)
            factor_access_loss = min(1.0, cut_count * 0.4)

            # 5. Trend factor: rate of change or sensor escalation
            has_sensor_spike = any("WATER" in cl.incident_type and cl.c_support > 0.5 for cl in ev_list)
            factor_trend = 0.8 if has_sensor_spike else 0.2

            # Deterministic Score formulation: score = SUM(w_i * f_i)
            # Expected score
            score_expected = (
                WEIGHT_LIFE_THREAT * factor_life_expected +
                WEIGHT_EXPOSURE * factor_exposure +
                WEIGHT_VULNERABILITY * factor_vulnerability +
                WEIGHT_ACCESS_LOSS * factor_access_loss +
                WEIGHT_TREND * factor_trend
            )

            # Upper bound score (using factor_life_upper)
            score_upper = (
                WEIGHT_LIFE_THREAT * factor_life_upper +
                WEIGHT_EXPOSURE * factor_exposure +
                WEIGHT_VULNERABILITY * factor_vulnerability +
                WEIGHT_ACCESS_LOSS * factor_access_loss +
                WEIGHT_TREND * factor_trend
            )

            # Confidence reported separately: average cluster confidence or default 0.5
            confidences = [cl.c_support for cl in ev_list]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.50

            # Rule: Verified imminent life threats force CRITICAL tier regardless of score
            has_verified_threat = any(
                cl.status == EvidenceStatus.VERIFIED and cl.estimated_people >= 5
                for cl in ev_list
            )

            flags = []
            if has_verified_threat:
                flags.append("VERIFIED_IMMINENT_LIFE_THREAT")
            if people_upper > people_expected * 1.5 and people_upper >= 20:
                flags.append(f"UNVERIFIED_HIGH_CASUALTY_CLAIM_{people_upper}_PEOPLE")
            if factor_access_loss >= 0.4:
                flags.append("CRITICAL_ACCESS_RESTRICTED")

            # Tier assignment based on score_expected (unless forced to CRITICAL)
            if has_verified_threat or score_expected >= 0.70:
                tier = "CRITICAL"
            elif score_expected >= 0.50:
                tier = "HIGH"
            elif score_expected >= 0.30:
                tier = "MEDIUM"
            else:
                tier = "LOW"

            # Meaningful counterfactual explanation
            what_would_change = (
                f"Confirming {people_upper - people_expected} unverified casualty claims would elevate expected score by "
                f"+{(score_upper - score_expected):.2f}. A new road cut would add +{WEIGHT_ACCESS_LOSS * 0.4:.2f}."
            )

            ev_ids = [cl.cluster_id for cl in ev_list]
            ev_summary = (
                f"{len(ev_list)} incident clusters ({len(verified_or_corrob)} verified/corroborated). "
                f"People in danger: {people_expected} confirmed (up to {people_upper} claimed)."
            )

            scored_zones.append(
                ZoneExplanation(
                    zone_id=code,
                    zone_name=z.name,
                    rank=999,  # assigned after sorting
                    tier=tier,
                    score_expected=round(score_expected, 4),
                    score_upper=round(score_upper, 4),
                    confidence=round(avg_confidence, 3),
                    factor_breakdown={
                        "life_threat": round(factor_life_expected, 3),
                        "exposure": round(factor_exposure, 3),
                        "vulnerability": round(factor_vulnerability, 3),
                        "access_loss": round(factor_access_loss, 3),
                        "trend": round(factor_trend, 3),
                    },
                    evidence_ids=ev_ids,
                    evidence_summary=ev_summary,
                    flags=flags,
                    what_would_change_this=what_would_change,
                    data_freshness_min=10.0,
                    is_synthetic=True,
                    verify_next=False,
                )
            )

        # Sort primarily by expected score descending
        scored_zones.sort(key=lambda x: x.score_expected, reverse=True)
        for i, item in enumerate(scored_zones):
            item.rank = i + 1

        # Check if score_upper would change ranking: if so, flag verify_next
        upper_sorted = sorted(scored_zones, key=lambda x: x.score_upper, reverse=True)
        upper_order = [z.zone_id for z in upper_sorted]
        expected_order = [z.zone_id for z in scored_zones]
        for z in scored_zones:
            if upper_order.index(z.zone_id) < expected_order.index(z.zone_id):
                z.verify_next = True

        return scored_zones

