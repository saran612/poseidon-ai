import base64
import hashlib
import hmac
import struct
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, Tuple

FRAME_FORMAT = ">B H I B i i H B I 8s"
FRAME_SIZE = 31  # bytes
COORD_SCALE = 1e7  # 10^7 for sub-meter resolution with int32
NO_COORD_SENTINEL = 0x7FFFFFFF  # Max signed 32-bit int representing missing GPS


@dataclass
class DecodedFrame:
    version: int
    device_id: int
    counter: int
    message_type: int
    latitude: Optional[float]
    longitude: Optional[float]
    people_affected: int
    flags: int
    observed_at: datetime
    hmac_tag: bytes
    is_mac_valid: bool
    raw_bytes: bytes


def compute_hmac_8(key: bytes, data_to_sign: bytes) -> bytes:
    """Compute truncated 8-byte HMAC-SHA256."""
    full_digest = hmac.new(key, data_to_sign, hashlib.sha256).digest()
    return full_digest[:8]


def encode_frame(
    device_id: int,
    counter: int,
    message_type: int,
    latitude: Optional[float],
    longitude: Optional[float],
    people_affected: int,
    flags: int,
    observed_at: datetime,
    key: bytes,
    version: int = 1,
) -> bytes:
    """Encode parameters into a 31-byte compact binary frame."""
    if not (0 <= device_id <= 0xFFFF):
        raise ValueError(f"device_id {device_id} must fit in uint16 (0-65535)")
    if not (0 <= counter <= 0xFFFFFFFF):
        raise ValueError("counter must fit in uint32")

    lat_int = int(round(latitude * COORD_SCALE)) if latitude is not None else NO_COORD_SENTINEL
    lon_int = int(round(longitude * COORD_SCALE)) if longitude is not None else NO_COORD_SENTINEL
    people_int = min(max(0, people_affected), 0xFFFF)
    flags_int = flags & 0xFF

    # Timestamp in epoch minutes
    ts_min = int(observed_at.replace(tzinfo=timezone.utc).timestamp() // 60)
    if not (0 <= ts_min <= 0xFFFFFFFF):
        raise ValueError("timestamp minutes out of uint32 bounds")

    # Pack the 23-byte payload to sign
    payload_to_sign = struct.pack(
        ">B H I B i i H B I",
        version & 0xFF,
        device_id,
        counter,
        message_type & 0xFF,
        lat_int,
        lon_int,
        people_int,
        flags_int,
        ts_min,
    )

    tag = compute_hmac_8(key, payload_to_sign)
    return payload_to_sign + tag


def decode_frame(raw_bytes: bytes, key: Optional[bytes] = None) -> DecodedFrame:
    """Decode 31-byte compact binary frame and verify HMAC if key provided."""
    if len(raw_bytes) != FRAME_SIZE:
        raise ValueError(f"Invalid frame length: expected {FRAME_SIZE} bytes, got {len(raw_bytes)}")

    payload_to_sign = raw_bytes[:23]
    incoming_tag = raw_bytes[23:31]

    version, device_id, counter, msg_type, lat_int, lon_int, people, flags, ts_min = struct.unpack(
        ">B H I B i i H B I", payload_to_sign
    )

    lat = None if lat_int == NO_COORD_SENTINEL else float(lat_int) / COORD_SCALE
    lon = None if lon_int == NO_COORD_SENTINEL else float(lon_int) / COORD_SCALE

    observed_at = datetime.fromtimestamp(ts_min * 60, tz=timezone.utc)

    is_valid = False
    if key is not None:
        expected_tag = compute_hmac_8(key, payload_to_sign)
        is_valid = hmac.compare_digest(expected_tag, incoming_tag)

    return DecodedFrame(
        version=version,
        device_id=device_id,
        counter=counter,
        message_type=msg_type,
        latitude=lat,
        longitude=lon,
        people_affected=people,
        flags=flags,
        observed_at=observed_at,
        hmac_tag=incoming_tag,
        is_mac_valid=is_valid,
        raw_bytes=raw_bytes,
    )


def encode_sms_payload(frame_bytes: bytes) -> str:
    """Encode binary frame for SMS transport using Base64."""
    return base64.b64encode(frame_bytes).decode("ascii")


def decode_sms_payload(sms_text: str) -> bytes:
    """Decode SMS Base64 payload into raw binary frame."""
    cleaned = sms_text.strip()
    return base64.b64decode(cleaned)

