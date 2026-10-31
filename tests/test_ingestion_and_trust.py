from datetime import datetime, timedelta, timezone
import pytest

from poseidon.ingestion.codec import encode_frame, decode_frame, encode_sms_payload, decode_sms_payload
from poseidon.ingestion.envelope import AuthStatus, SourceTier
from poseidon.ingestion.message_router import MessageRouter
from poseidon.ingestion.replay_protection import ReplayProtectionEngine
from poseidon.ingestion.transports.base import RawTransportPacket
from poseidon.trust.engine import EvidenceTrustEngine, EvidenceStatus


SECRET_KEY = b"test-secret-key-for-node-32bytes!"


def test_compact_frame_codec_roundtrip():
    """Verify 31-byte binary frame encoding and decoding."""
    now = datetime(2026, 10, 31, 10, 0, tzinfo=timezone.utc)
    frame = encode_frame(
        device_id=101,
        counter=42,
        message_type=1,
        latitude=10.998523,
        longitude=76.965412,
        people_affected=15,
        flags=0x01,  # GPS fix
        observed_at=now,
        key=SECRET_KEY,
    )
    assert len(frame) == 31

    decoded = decode_frame(frame, key=SECRET_KEY)
    assert decoded.device_id == 101
    assert decoded.counter == 42
    assert decoded.message_type == 1
    assert decoded.people_affected == 15
    assert decoded.is_mac_valid is True
    assert pytest.approx(decoded.latitude, rel=1e-5) == 10.998523
    assert pytest.approx(decoded.longitude, rel=1e-5) == 76.965412


def test_invalid_hmac_rejected():
    """Mandatory test: Invalid HMAC tag is rejected."""
    now = datetime(2026, 10, 31, 10, 0, tzinfo=timezone.utc)
    frame = bytearray(encode_frame(
        device_id=101,
        counter=1,
        message_type=1,
        latitude=10.99,
        longitude=76.96,
        people_affected=0,
        flags=0,
        observed_at=now,
        key=SECRET_KEY,
    ))
    # Tamper with byte
    frame[10] ^= 0xFF
    decoded = decode_frame(bytes(frame), key=SECRET_KEY)
    assert decoded.is_mac_valid is False


def test_sliding_window_replay_protection():
    """Mandatory test: Duplicate counters rejected, out-of-order within window accepted."""
    engine = ReplayProtectionEngine(window_size=64)
    dev = 50

    # 1. First counter 100 accepted
    ok, reason = engine.validate_and_update(dev, 100)
    assert ok is True

    # 2. Duplicate 100 rejected
    ok, reason = engine.validate_and_update(dev, 100)
    assert ok is False
    assert "REPLAY" in reason

    # 3. New highest counter 105 accepted
    ok, reason = engine.validate_and_update(dev, 105)
    assert ok is True

    # 4. Out-of-order counter 102 (within window 105 - 102 = 3 < 64) accepted
    ok, reason = engine.validate_and_update(dev, 102)
    assert ok is True
    assert "OUT_OF_ORDER" in reason

    # 5. Duplicate of 102 rejected
    ok, reason = engine.validate_and_update(dev, 102)
    assert ok is False

    # 6. Counter 20 (lag 105 - 20 = 85 >= 64) outside window rejected
    ok, reason = engine.validate_and_update(dev, 20)
    assert ok is False
    assert "EXPIRED" in reason


@pytest.mark.asyncio
async def test_multi_transport_deduplication():
    """Mandatory test: The same report arriving via Wi-Fi, SMS, and LoRa counts as ONE evidence record."""
    router = MessageRouter()
    router.register_device(
        numeric_id=202,
        device_code="DEV-202",
        role="T2",
        secret_key=SECRET_KEY,
    )

    now = datetime.now(timezone.utc)
    frame_bytes = encode_frame(
        device_id=202,
        counter=1,
        message_type=1,
        latitude=10.998,
        longitude=76.965,
        people_affected=0,
        flags=0x01,
        observed_at=now,
        key=SECRET_KEY,
    )

    # 1. Ingest via Wi-Fi
    pkt_wifi = RawTransportPacket(
        packet_id="wifi-001",
        transport_name="WIFI",
        raw_payload_bytes=frame_bytes,
        received_at=now,
        metadata={"ip": "192.168.1.100"},
    )
    env_wifi, is_dup1, _ = await router.ingest_packet(pkt_wifi)
    assert is_dup1 is False
    assert env_wifi.source_tier == SourceTier.T2

    # 2. Ingest same frame via SMS Base64
    sms_b64 = encode_sms_payload(frame_bytes)
    raw_from_sms = decode_sms_payload(sms_b64)
    pkt_sms = RawTransportPacket(
        packet_id="sms-001",
        transport_name="SMS",
        raw_payload_bytes=raw_from_sms,
        received_at=now + timedelta(seconds=2),
        metadata={"sender_phone": "+919442111111"},
    )
    env_sms, is_dup2, _ = await router.ingest_packet(pkt_sms)
    assert is_dup2 is True
    assert env_sms.message_id == env_wifi.message_id

    # 3. Ingest same frame via LoRa
    pkt_lora = RawTransportPacket(
        packet_id="lora-001",
        transport_name="LORA",
        raw_payload_bytes=frame_bytes,
        received_at=now + timedelta(seconds=5),
        metadata={"rssi_dbm": -88.0, "snr_db": 8.0},
    )
    env_lora, is_dup3, _ = await router.ingest_packet(pkt_lora)
    assert is_dup3 is True
    assert env_lora.message_id == env_wifi.message_id

    # Verify receipts recorded 3 transport entries under 1 message ID
    receipts = router.receipts[env_wifi.message_id]
    assert len(receipts) == 3
    assert set(r["transport"] for r in receipts) == {"WIFI", "SMS", "LORA"}


@pytest.mark.asyncio
async def test_future_timestamp_rejected():
    """Mandatory test: A timestamp more than five minutes in the future is rejected."""
    router = MessageRouter(future_drift_limit_sec=300)
    router.register_device(
        numeric_id=303,
        device_code="DEV-303",
        role="T1",
        secret_key=SECRET_KEY,
    )

    future_time = datetime.now(timezone.utc) + timedelta(minutes=10)
    frame = encode_frame(
        device_id=303,
        counter=1,
        message_type=1,
        latitude=10.99,
        longitude=76.96,
        people_affected=0,
        flags=1,
        observed_at=future_time,
        key=SECRET_KEY,
    )
    pkt = RawTransportPacket("pkt-f", "WIFI", frame, datetime.now(timezone.utc), {})
    env, _, _ = await router.ingest_packet(pkt)
    assert env.authentication_status == AuthStatus.MALFORMED
    assert "future drift" in env.metadata.get("error", "")


@pytest.mark.asyncio
async def test_unknown_sms_sender_cannot_become_t1():
    """Mandatory test: Unknown SMS senders cannot become T1."""
    router = MessageRouter()
    # Unregistered device ID 999
    now = datetime.now(timezone.utc)
    frame = encode_frame(
        device_id=999,
        counter=1,
        message_type=1,
        latitude=10.99,
        longitude=76.96,
        people_affected=0,
        flags=0,
        observed_at=now,
        key=b"bogus-key-for-unregistered-device",
    )
    pkt = RawTransportPacket("pkt-unknown", "SMS", frame, now, {"sender_phone": "+919999999999"})
    env, _, _ = await router.ingest_packet(pkt)
    assert env.source_tier == SourceTier.T4
    assert env.authentication_status == AuthStatus.UNKNOWN_DEVICE


def test_public_reports_alone_cannot_reach_verified():
    """Mandatory test: Public reports alone cannot achieve Verified status (cap C_support at 0.60)."""
    engine = EvidenceTrustEngine()
    now = datetime.now(timezone.utc)

    # 5 independent citizen reports
    ev_list = []
    for i in range(5):
        envelope = MessageRouter().devices  # dummy
        from poseidon.ingestion.envelope import NormalizedEnvelope
        env = NormalizedEnvelope(
            message_id=f"cit-{i}",
            origin_id=f"orig-cit-{i}",
            transport=SourceTier.T3,  # type: ignore
            observed_at=now - timedelta(minutes=10),
            received_at=now,
            raw_payload_hex="aa",
            authenticated=True,
            authentication_status=AuthStatus.VALID,
            source_tier=SourceTier.T3,
            sequence_number=i,
            latitude=11.001,
            longitude=76.961,
            location_precision_meters=10.0,
            people_affected=5,
        )
        ev = engine.evaluate_envelope(env, incident_type="FLOOD_WATER_LEVEL", now=now)
        ev_list.append(ev)

    clusters = engine.cluster_and_evaluate(ev_list)
    assert len(clusters) == 1
    cl = clusters[0]
    # C_support capped at 0.60 because no T1 or T2 source exists!
    assert cl.c_support <= 0.60
    assert cl.status != EvidenceStatus.VERIFIED


def test_t1_source_produces_verified_status():
    """Mandatory test: T1 confirmation can satisfy the Verified rule when thresholds met."""
    engine = EvidenceTrustEngine()
    now = datetime.now(timezone.utc)
    # Set officer with established reputation (1.10)
    engine.set_reputation("DEV-OFFICER-01", 1.10)

    from poseidon.ingestion.envelope import NormalizedEnvelope
    env_t1 = NormalizedEnvelope(
        message_id="t1-001",
        origin_id="orig-t1-001",
        transport="WIFI",  # type: ignore
        device_id="DEV-OFFICER-01",
        observed_at=now - timedelta(minutes=2),  # very fresh
        received_at=now,
        raw_payload_hex="bb",
        authenticated=True,
        authentication_status=AuthStatus.VALID,
        source_tier=SourceTier.T1,
        sequence_number=1,
        latitude=10.998,
        longitude=76.965,
        location_precision_meters=5.0,
        people_affected=20,
    )
    ev_t1 = engine.evaluate_envelope(env_t1, incident_type="GOVERNMENT_ALERT", now=now)
    assert ev_t1.confidence >= 0.85

    clusters = engine.cluster_and_evaluate([ev_t1])
    assert len(clusters) == 1
    assert clusters[0].status == EvidenceStatus.VERIFIED


def test_sensor_freshness_decay_from_observed_at():
    """Mandatory test: Sensor freshness decays correctly from observed_at, not received_at."""
    engine = EvidenceTrustEngine()
    now = datetime(2026, 10, 31, 12, 0, tzinfo=timezone.utc)

    # Water-level sensor half-life is 30 minutes.
    # At 30 mins: freshness = 0.5
    f30, _ = engine.calculate_freshness(now - timedelta(minutes=30), "WATER_LEVEL", now=now)
    assert pytest.approx(f30, abs=0.01) == 0.50

    # At 60 mins: freshness = 0.25
    f60, _ = engine.calculate_freshness(now - timedelta(minutes=60), "WATER_LEVEL", now=now)
    assert pytest.approx(f60, abs=0.01) == 0.25

    # Delayed 6 hours (360 mins) -> (360/30 = 12 half-lives) -> freshness ~ 0.0002
    f360, _ = engine.calculate_freshness(now - timedelta(hours=6), "WATER_LEVEL", now=now)
    assert f360 < 0.001


def test_asymmetric_safety_contradictory_road_remains_closed():
    """Mandatory test: Contradictory road reports keep the road closed."""
    engine = EvidenceTrustEngine()
    now = datetime(2026, 10, 31, 10, 0, tzinfo=timezone.utc)
    road_id = "ROAD-NOYYAL-BRIDGE-01"

    # 1. Closed by T1 officer at 10:00
    st1, _ = engine.update_road_status(road_id, "CLOSED", SourceTier.T1, now)
    assert st1 == "CLOSED"

    # 2. Citizen report (T3) claims road is OPEN at 10:15
    st2, reason2 = engine.update_road_status(road_id, "OPEN", SourceTier.T3, now + timedelta(minutes=15))
    # Must remain CLOSED because T3 rank < T1 rank
    assert st2 == "CLOSED"
    assert "rejected" in reason2.lower()


def test_ten_whatsapp_forwards_produce_one_cluster_and_no_casualty_inflation():
    """Mandatory test 1: Ten near-identical WhatsApp forwards produce one independent evidence cluster.
    Casualties are not summed; conservative max or median is used.
    """
    engine = EvidenceTrustEngine()
    now = datetime.now(timezone.utc)

    # 10 forwarded reports of the same 15 trapped people at the same location
    from poseidon.ingestion.envelope import NormalizedEnvelope
    forwards = []
    for i in range(10):
        env = NormalizedEnvelope(
            message_id=f"fwd-msg-{i}",
            origin_id=f"fwd-orig-{i}",
            transport="SMS",  # type: ignore
            observed_at=now - timedelta(minutes=15),
            received_at=now,
            raw_payload_hex="cc",
            authenticated=False,
            authentication_status=AuthStatus.UNVERIFIED,
            source_tier=SourceTier.T4,
            sequence_number=i,
            latitude=10.9924,
            longitude=76.9582,
            location_precision_meters=50.0,
            people_affected=15,  # Same 15 people reported
        )
        ev = engine.evaluate_envelope(env, incident_type="CASUALTY", now=now)
        forwards.append(ev)

    clusters = engine.cluster_and_evaluate(forwards, spatial_threshold_m=300.0)
    assert len(clusters) == 1
    cl = clusters[0]
    # People affected MUST NOT be summed to 150! It must be 15.
    assert cl.estimated_people == 15
    # Status cannot be VERIFIED since it's unverified public forwards
    assert cl.status != EvidenceStatus.VERIFIED


def test_coarse_location_widens_cluster_matching_radius():
    """Mandatory test 18: Coarse location uncertainty affects duplicate matching radius."""
    engine = EvidenceTrustEngine()
    now = datetime.now(timezone.utc)

    from poseidon.ingestion.envelope import NormalizedEnvelope
    # Base report at (10.9900, 76.9600)
    ev1 = engine.evaluate_envelope(
        NormalizedEnvelope(
            message_id="msg-base",
            origin_id="orig-base",
            transport="WIFI",  # type: ignore
            observed_at=now,
            received_at=now,
            raw_payload_hex="dd",
            authenticated=True,
            authentication_status=AuthStatus.VALID,
            source_tier=SourceTier.T3,
            sequence_number=1,
            latitude=10.9900,
            longitude=76.9600,
            location_precision_meters=10.0,
            people_affected=2,
        ),
        now=now,
    )

    # Second report 450 meters away with coarse precision (600 meters uncertainty)
    # Haversine delta of approx 0.004 degrees is ~440 meters
    ev2 = engine.evaluate_envelope(
        NormalizedEnvelope(
            message_id="msg-coarse",
            origin_id="orig-coarse",
            transport="SMS",  # type: ignore
            observed_at=now,
            received_at=now,
            raw_payload_hex="ee",
            authenticated=False,
            authentication_status=AuthStatus.UNVERIFIED,
            source_tier=SourceTier.T4,
            sequence_number=2,
            latitude=10.9940,
            longitude=76.9600,
            location_precision_meters=600.0,  # Coarse!
            people_affected=2,
        ),
        now=now,
    )

    # Standard radius is 300m, but effective radius expands by (600 - 20) = 880m -> 440m fits!
    clusters = engine.cluster_and_evaluate([ev1, ev2], spatial_threshold_m=300.0)
    assert len(clusters) == 1
