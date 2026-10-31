from datetime import datetime, timezone
import hashlib
import time
from typing import Dict, Optional, Tuple
import uuid

from poseidon.ingestion.codec import decode_frame, DecodedFrame
from poseidon.ingestion.envelope import AuthStatus, NormalizedEnvelope, SourceTier, TransportType
from poseidon.ingestion.replay_protection import ReplayProtectionEngine
from poseidon.ingestion.tier_resolver import TierResolver
from poseidon.ingestion.transports.base import RawTransportPacket


class RegisteredDevice:
    def __init__(
        self,
        numeric_id: int,
        device_code: str,
        role: str,
        secret_key: bytes,
        owner_name: str = "Operator",
    ):
        self.numeric_id = numeric_id
        self.device_code = device_code
        self.role = role  # T1 (field officer), T2 (sensor), T3 (citizen)
        self.secret_key = secret_key
        self.owner_name = owner_name
        self.is_revoked = False


class MessageRouter:
    """Central Ingestion Pipeline handling authentication, replay protection, deduplication, and normalization."""

    def __init__(self, future_drift_limit_sec: int = 300):
        self.future_drift_limit_sec = future_drift_limit_sec
        self.devices: Dict[int, RegisteredDevice] = {}
        self.replay_engine = ReplayProtectionEngine(window_size=64)
        
        # In-memory deduplication caches for fast idempotency before/alongside DB
        self.seen_origins: Dict[str, str] = {}  # origin_id -> message_id
        self.receipts: Dict[str, list] = {}  # message_id -> list of receipt metadata

    def register_device(
        self,
        numeric_id: int,
        device_code: str,
        role: str,
        secret_key: bytes,
        owner_name: str = "Operator",
    ) -> None:
        self.devices[numeric_id] = RegisteredDevice(
            numeric_id=numeric_id,
            device_code=device_code,
            role=role,
            secret_key=secret_key,
            owner_name=owner_name,
        )

    def revoke_device(self, numeric_id: int) -> None:
        if numeric_id in self.devices:
            self.devices[numeric_id].is_revoked = True

    def compute_origin_id(self, device_id: int, counter: int, observed_at_min: int) -> str:
        """Deterministic origin ID identifying unique incident transmission."""
        h = hashlib.sha256(f"{device_id}:{counter}:{observed_at_min}".encode("ascii")).hexdigest()
        return f"orig-{h[:16]}"

    async def ingest_packet(self, packet: RawTransportPacket) -> Tuple[NormalizedEnvelope, bool, float]:
        """Ingest raw transport packet.
        
        Returns:
            (envelope, is_transport_duplicate, t_ingested_ms)
        """
        start_t = time.perf_counter()
        now_utc = datetime.now(timezone.utc)
        raw_bytes = packet.raw_payload_bytes
        raw_hex = raw_bytes.hex()
        transport = TransportType(packet.transport_name.upper())

        # 1. Parse Compact Binary Frame
        try:
            # First pass decode without key to inspect device_id
            pre_frame = decode_frame(raw_bytes, key=None)
            device_id = pre_frame.device_id
            counter = pre_frame.counter
            observed_at = pre_frame.observed_at
            
            # Timestamp sanity check: Reject if > 5 minutes in future
            future_drift = (observed_at - now_utc).total_seconds()
            if future_drift > self.future_drift_limit_sec:
                envelope = NormalizedEnvelope(
                    message_id=f"msg-{uuid.uuid4().hex[:12]}",
                    origin_id=f"rejected-future-{device_id}-{counter}",
                    transport=transport,
                    observed_at=observed_at,
                    received_at=now_utc,
                    raw_payload_hex=raw_hex,
                    authenticated=False,
                    authentication_status=AuthStatus.MALFORMED,
                    source_tier=SourceTier.T4,
                    sequence_number=counter,
                    protocol_version=pre_frame.version,
                    device_id=None,
                    numeric_device_id=device_id,
                    metadata={"error": f"Timestamp exceeds max future drift ({future_drift:.1f}s > {self.future_drift_limit_sec}s)"},
                )
                latency_ms = (time.perf_counter() - start_t) * 1000.0
                return envelope, False, latency_ms

            # 2. Authenticate Device & Key
            registered = self.devices.get(device_id)
            if not registered or registered.is_revoked:
                auth_status = AuthStatus.UNKNOWN_DEVICE
                is_mac_valid = False
            else:
                # Re-decode with secret key to verify HMAC
                verified_frame = decode_frame(raw_bytes, key=registered.secret_key)
                is_mac_valid = verified_frame.is_mac_valid
                auth_status = AuthStatus.VALID if is_mac_valid else AuthStatus.INVALID_MAC

            # 3. Sliding-window Replay Protection
            if is_mac_valid:
                valid_seq, replay_reason = self.replay_engine.validate_and_update(device_id, counter)
                if not valid_seq:
                    auth_status = AuthStatus.REPLAY

            # 4. Source Tier Resolution
            resolution = TierResolver.resolve(
                auth_status=auth_status,
                device_role=registered.role if registered else None,
                is_known_device=registered is not None and not registered.is_revoked,
            )

            # 5. Deterministic Origin ID & Multi-Transport Deduplication
            ts_min = int(observed_at.timestamp() // 60)
            origin_id = self.compute_origin_id(device_id, counter, ts_min)

            is_duplicate = False
            if origin_id in self.seen_origins:
                # Message already ingested via another transport!
                message_id = self.seen_origins[origin_id]
                is_duplicate = True
                self.receipts[message_id].append({
                    "transport": transport.value,
                    "received_at": now_utc,
                    "packet_id": packet.packet_id,
                    "metadata": packet.metadata,
                })
            else:
                # Brand new originating message
                message_id = f"msg-{uuid.uuid4().hex[:12]}"
                self.seen_origins[origin_id] = message_id
                self.receipts[message_id] = [{
                    "transport": transport.value,
                    "received_at": now_utc,
                    "packet_id": packet.packet_id,
                    "metadata": packet.metadata,
                }]

            # Location precision: standard GPS default is ~10m; coarse SMS/unverified defaults to wider
            precision_m = 10.0 if (pre_frame.flags & 0x01) else 1000.0
            if transport == TransportType.SMS and not (pre_frame.flags & 0x01):
                precision_m = 1500.0

            envelope = NormalizedEnvelope(
                message_id=message_id,
                origin_id=origin_id,
                transport=transport,
                observed_at=observed_at,
                received_at=now_utc,
                raw_payload_hex=raw_hex,
                authenticated=(auth_status == AuthStatus.VALID),
                authentication_status=auth_status,
                source_tier=resolution.tier,
                sequence_number=counter,
                protocol_version=pre_frame.version,
                device_id=registered.device_code if registered else None,
                numeric_device_id=device_id,
                message_type=pre_frame.message_type,
                latitude=pre_frame.latitude,
                longitude=pre_frame.longitude,
                location_precision_meters=precision_m,
                people_affected=pre_frame.people_affected,
                flags=pre_frame.flags,
                metadata={
                    "base_trust": resolution.base_trust,
                    "is_rejected": resolution.is_rejected,
                    "tier_reason": resolution.reason,
                    "transport_metadata": packet.metadata,
                },
            )

        except Exception as e:
            message_id = f"err-{uuid.uuid4().hex[:12]}"
            envelope = NormalizedEnvelope(
                message_id=message_id,
                origin_id=f"malformed-{uuid.uuid4().hex[:8]}",
                transport=transport,
                observed_at=now_utc,
                received_at=now_utc,
                raw_payload_hex=raw_hex,
                authenticated=False,
                authentication_status=AuthStatus.MALFORMED,
                source_tier=SourceTier.T4,
                sequence_number=0,
                protocol_version=0,
                metadata={"error": str(e)},
            )
            is_duplicate = False

        latency_ms = (time.perf_counter() - start_t) * 1000.0
        return envelope, is_duplicate, latency_ms

