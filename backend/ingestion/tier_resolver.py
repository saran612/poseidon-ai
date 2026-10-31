from dataclasses import dataclass
from typing import Optional
from backend.ingestion.envelope import AuthStatus, SourceTier


@dataclass
class TierResolution:
    tier: SourceTier
    base_trust: float
    is_rejected: bool
    reason: str


ROLE_TIER_MAPPING = {
    "T1": (SourceTier.T1, 0.90),
    "FIELD_OFFICER": (SourceTier.T1, 0.90),
    "GOVERNMENT": (SourceTier.T1, 0.90),
    "T2": (SourceTier.T2, 0.75),
    "SENSOR": (SourceTier.T2, 0.75),
    "T3": (SourceTier.T3, 0.45),
    "CITIZEN": (SourceTier.T3, 0.45),
    "CITIZEN_APP": (SourceTier.T3, 0.45),
    "T4": (SourceTier.T4, 0.20),
    "PUBLIC": (SourceTier.T4, 0.20),
    "UNKNOWN": (SourceTier.T4, 0.20),
}


class TierResolver:
    @staticmethod
    def resolve(
        auth_status: AuthStatus,
        device_role: Optional[str] = None,
        is_known_device: bool = False,
    ) -> TierResolution:
        """Resolve source tier and base trust based on strict cryptographic authentication and device role."""
        if auth_status in (AuthStatus.INVALID_MAC, AuthStatus.REPLAY, AuthStatus.MALFORMED):
            return TierResolution(
                tier=SourceTier.T4,
                base_trust=0.0,
                is_rejected=True,
                reason=f"Rejected due to security violation: {auth_status.value}",
            )

        if auth_status == AuthStatus.VALID and is_known_device and device_role:
            role_norm = device_role.upper().strip()
            if role_norm in ROLE_TIER_MAPPING:
                tier, trust = ROLE_TIER_MAPPING[role_norm]
                return TierResolution(
                    tier=tier,
                    base_trust=trust,
                    is_rejected=False,
                    reason=f"Authenticated device role '{role_norm}' mapped to {tier.value}",
                )

        if auth_status == AuthStatus.VALID and is_known_device:
            # Authenticated but role unassigned: default conservatively to T3
            return TierResolution(
                tier=SourceTier.T3,
                base_trust=0.45,
                is_rejected=False,
                reason="Authenticated device with default citizen tier T3",
            )

        # Unauthenticated, unknown device, or public report: T4
        return TierResolution(
            tier=SourceTier.T4,
            base_trust=0.20,
            is_rejected=False,
            reason="Unauthenticated or unknown source assigned public tier T4",
        )

