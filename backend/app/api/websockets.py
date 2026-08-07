from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio

router = APIRouter(prefix="", tags=["WebSockets & Live Push"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

async def broadcast_websocket_event(event_type: str, data: Dict[str, Any]):
    """Helper function to broadcast event to all connected clients."""
    await manager.broadcast({
        "event": event_type,
        "payload": data
    })

@router.websocket("/live-updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send connection confirmation
        await websocket.send_json({"event": "CONNECTED", "message": "Connected to RouteMind Live Stream"})
        while True:
            # Wait for client messages (e.g. driver GPS ping)
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                # Echo or handle ping
                if parsed.get("action") == "PING":
                    await websocket.send_json({"event": "PONG", "timestamp": parsed.get("timestamp")})
                elif parsed.get("action") == "DRIVER_LOCATION_UPDATE":
                    await manager.broadcast({
                        "event": "DRIVER_LOCATION_CHANGED",
                        "payload": parsed.get("data")
                    })
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
