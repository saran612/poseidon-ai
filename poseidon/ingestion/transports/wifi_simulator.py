import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional
import uuid

from poseidon.ingestion.transports.base import BaseTransport, RawTransportPacket, TransportStatus


class WiFiSimulatorTransport(BaseTransport):
    """Local Wi-Fi / HTTP Transport Simulator."""

    def __init__(self, ssid: str = "POSEIDON-EMERGENCY-MESH"):
        self.ssid = ssid
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
        self.outbox.append({
            "destination": destination,
            "payload_hex": message.hex(),
            "sent_at": datetime.now(timezone.utc),
            "meta": kwargs,
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

    async def push_incoming(self, raw_bytes: bytes, client_ip: str = "192.168.1.50") -> str:
        """Inject packet as if received over local Wi-Fi / HTTP endpoint."""
        packet_id = f"wifi-{uuid.uuid4().hex[:8]}"
        packet = RawTransportPacket(
            packet_id=packet_id,
            transport_name="WIFI",
            raw_payload_bytes=raw_bytes,
            received_at=datetime.now(timezone.utc),
            metadata={"client_ip": client_ip, "ssid": self.ssid},
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
            name="WIFI",
            is_online=self.is_connected,
            packets_received=self.packets_received,
            packets_sent=self.packets_sent,
            last_activity=self.last_activity,
            channel_info={"ssid": self.ssid, "ip": "192.168.1.1", "subnet": "255.255.255.0"},
        )

