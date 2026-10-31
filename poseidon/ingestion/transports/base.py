from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class RawTransportPacket:
    packet_id: str
    transport_name: str
    raw_payload_bytes: bytes
    received_at: datetime
    metadata: Dict[str, Any]


@dataclass
class TransportStatus:
    name: str
    is_online: bool
    packets_received: int
    packets_sent: int
    last_activity: Optional[datetime]
    channel_info: Dict[str, Any]


class BaseTransport(ABC):
    """Common interface for all local emergency communication paths."""

    @abstractmethod
    async def send(self, message: bytes, destination: str, **kwargs) -> bool:
        """Send raw binary frame or packet to destination."""
        pass

    @abstractmethod
    async def receive(self) -> Optional[RawTransportPacket]:
        """Receive next packet from incoming queue."""
        pass

    @abstractmethod
    async def acknowledge(self, message_id: str) -> bool:
        """Deliver transport-level acknowledgement back to device/gateway."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify connectivity and hardware/socket health."""
        pass

    @abstractmethod
    async def reconnect(self) -> bool:
        """Attempt to restore transport link."""
        pass

    @abstractmethod
    def get_transport_status(self) -> TransportStatus:
        """Return operational health and statistical metrics."""
        pass

