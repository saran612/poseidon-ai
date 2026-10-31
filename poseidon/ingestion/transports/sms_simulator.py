import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional
import uuid

from poseidon.ingestion.codec import decode_sms_payload, encode_sms_payload
from poseidon.ingestion.transports.base import BaseTransport, RawTransportPacket, TransportStatus


class SMSSimulatorTransport(BaseTransport):
    """GSM/LTE Modem & SMS Gateway Simulator."""

    def __init__(self, modem_port: str = "COM3_SIMULATED", sim_number: str = "+919442000000"):
        self.modem_port = modem_port
        self.sim_number = sim_number
        self.is_connected = True
        self.inbox: asyncio.Queue[RawTransportPacket] = asyncio.Queue()
        self.outbox: List[Dict[str, any]] = []
        self.acknowledged_ids: set[str] = set()
        self.packets_received = 0
        self.packets_sent = 0
        self.last_activity: Optional[datetime] = None

    async def send(self, message: bytes, destination: str, **kwargs) -> bool:
        if not self.is_connected:
            return False
        # Wrap binary frame in Base64 for SMS transmission
        b64_text = encode_sms_payload(message)
        self.outbox.append({
            "to_phone": destination,
            "sms_text": b64_text,
            "bytes_len": len(message),
            "sent_at": datetime.now(timezone.utc),
        })
        self.packets_sent += 1
        self.last_activity = datetime.now(timezone.utc)
        return True

    async def receive(self) -> Optional[RawTransportPacket]:
        if not self.is_connected or self.inbox.empty():
            return None
        packet = await self.inbox.get()
        self.packets_received += 1
        self.last_activity = datetime.now(timezone.utc)
        return packet

    async def push_sms(self, sender_phone: str, sms_text_or_bytes: str | bytes) -> str:
        """Receive SMS from carrier network containing Base64 frame or raw bytes."""
        if isinstance(sms_text_or_bytes, str):
            raw_bytes = decode_sms_payload(sms_text_or_bytes)
        else:
            raw_bytes = sms_text_or_bytes

        packet_id = f"sms-{uuid.uuid4().hex[:8]}"
        packet = RawTransportPacket(
            packet_id=packet_id,
            transport_name="SMS",
            raw_payload_bytes=raw_bytes,
            received_at=datetime.now(timezone.utc),
            metadata={
                "sender_phone": sender_phone,
                "gateway_sim": self.sim_number,
                "csq_signal": 24,  # -65 dBm (good)
            },
        )
        await self.inbox.put(packet)
        return packet_id

    async def acknowledge(self, message_id: str) -> bool:
        self.acknowledged_ids.add(message_id)
        return True

    async def health_check(self) -> bool:
        return self.is_connected

    async def reconnect(self) -> bool:
        self.is_connected = True
        return True

    def get_transport_status(self) -> TransportStatus:
        return TransportStatus(
            name="SMS",
            is_online=self.is_connected,
            packets_received=self.packets_received,
            packets_sent=self.packets_sent,
            last_activity=self.last_activity,
            channel_info={
                "modem_port": self.modem_port,
                "sim_number": self.sim_number,
                "csq": 24,
                "operator": "Emergency Private GSM",
            },
        )

