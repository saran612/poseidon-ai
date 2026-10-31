import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Optional
import uuid

from backend.ingestion.transports.base import BaseTransport, RawTransportPacket, TransportStatus


class LoRaSimulatorTransport(BaseTransport):
    """Sub-GHz LoRa Radio Gateway Simulator (865-867 MHz IN865 band)."""

    def __init__(self, gateway_id: str = "GW-NOYYAL-01", frequency_mhz: float = 865.0625):
        self.gateway_id = gateway_id
        self.frequency_mhz = frequency_mhz
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
            "dest_node": destination,
            "raw_hex": message.hex(),
            "freq_mhz": self.frequency_mhz,
            "sf": kwargs.get("sf", 10),
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

    async def push_lora_packet(
        self,
        raw_bytes: bytes,
        rssi_dbm: float = -92.0,
        snr_db: float = 6.5,
        node_addr: str = "0x2601004A",
    ) -> str:
        """Receive RF packet over simulated LoRa channel."""
        packet_id = f"lora-{uuid.uuid4().hex[:8]}"
        packet = RawTransportPacket(
            packet_id=packet_id,
            transport_name="LORA",
            raw_payload_bytes=raw_bytes,
            received_at=datetime.now(timezone.utc),
            metadata={
                "gateway_id": self.gateway_id,
                "node_addr": node_addr,
                "rssi_dbm": rssi_dbm,
                "snr_db": snr_db,
                "freq_mhz": self.frequency_mhz,
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
            name="LORA",
            is_online=self.is_connected,
            packets_received=self.packets_received,
            packets_sent=self.packets_sent,
            last_activity=self.last_activity,
            channel_info={
                "gateway_id": self.gateway_id,
                "freq_mhz": self.frequency_mhz,
                "bandwidth_khz": 125,
                "default_sf": 10,
            },
        )

