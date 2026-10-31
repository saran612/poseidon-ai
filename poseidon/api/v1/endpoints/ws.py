import asyncio
import json
from datetime import datetime, timezone
from typing import List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        dead = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)


ws_manager = WebSocketManager()


def get_ws_manager() -> WebSocketManager:
    return ws_manager


@router.websocket("/ws/updates")
async def websocket_updates_endpoint(websocket: WebSocket):
    """Real-time bidirectional WebSocket connection for incident alerts, plan changes, and assignment updates."""
    await ws_manager.connect(websocket)
    try:
        # Send initial connection confirmation
        await websocket.send_text(
            json.dumps({
                "type": "CONNECTION_ESTABLISHED",
                "system": "POSEIDON AI Real-Time Channel",
                "connected_at": datetime.now(timezone.utc).isoformat(),
            })
        )
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                # Handle client ping
                if msg.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG", "timestamp": datetime.now(timezone.utc).isoformat()}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
