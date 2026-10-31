from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional


class AuthStatus(str, Enum):
    VALID = "VALID"
    INVALID_MAC = "INVALID_MAC"
    REPLAY = "REPLAY"
    UNKNOWN_DEVICE = "UNKNOWN_DEVICE"
    UNVERIFIED = "UNVERIFIED"
    MALFORMED = "MALFORMED"


class SourceTier(str, Enum):
    T1 = "T1"  # Verified government / authenticated field officer
    T2 = "T2"  # Authenticated sensor
    T3 = "T3"  # Known citizen app / verified citizen
    T4 = "T4"  # Unknown / unverified / public forward


class TransportType(str, Enum):
    WIFI = "WIFI"
    SMS = "SMS"
    LORA = "LORA"
    BLUETOOTH = "BLUETOOTH"


@dataclass
class NormalizedEnvelope:
    message_id: str
    origin_id: str
    transport: TransportType
    observed_at: datetime
    received_at: datetime
    raw_payload_hex: str
    authenticated: bool
    authentication_status: AuthStatus
    source_tier: SourceTier
    sequence_number: int
    protocol_version: int = 1
    device_id: Optional[str] = None
    numeric_device_id: Optional[int] = None
    message_type: int = 1
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_precision_meters: float = 10.0
    people_affected: int = 0
    flags: int = 0
    is_synthetic: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

