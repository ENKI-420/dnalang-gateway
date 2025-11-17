"""
AURA WebSocket Support for Real-Time Agent Updates
Σₛ = dna::}{::lang
"""

from fastapi import WebSocket, WebSocketDisconnect, Query
from typing import Dict, Set
import json
import asyncio
from datetime import datetime


class ConnectionManager:
    """
    Manages WebSocket connections for real-time AURA updates

    Features:
    - Per-session connection tracking
    - Agent lattice state broadcasting
    - Agent response streaming
    - Real-time metrics updates
    """

    def __init__(self):
        # session_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept and register a websocket connection"""
        await websocket.accept()

        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()

        self.active_connections[session_id].add(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        """Remove a websocket connection"""
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)

            # Clean up empty session sets
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific websocket"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Failed to send message: {e}")

    async def broadcast_to_session(self, message: dict, session_id: str):
        """Broadcast message to all connections in a session"""
        if session_id not in self.active_connections:
            return

        # Create list to avoid modification during iteration
        connections = list(self.active_connections[session_id])

        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Failed to broadcast to connection: {e}")
                # Remove failed connection
                self.disconnect(connection, session_id)

    async def send_agent_update(
        self,
        session_id: str,
        agent_id: str,
        agent_type: str,
        status: str,
        message: str = None,
        metrics: dict = None
    ):
        """Send agent status update"""
        update = {
            "type": "agent_update",
            "session_id": session_id,
            "agent_id": agent_id,
            "agent_type": agent_type,
            "status": status,
            "message": message,
            "metrics": metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_session(update, session_id)

    async def send_lattice_update(self, session_id: str, lattice_data: dict):
        """Send agent lattice state update"""
        update = {
            "type": "lattice_update",
            "session_id": session_id,
            "lattice": lattice_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_session(update, session_id)

    async def send_response_chunk(
        self,
        session_id: str,
        agent_id: str,
        agent_type: str,
        content: str,
        is_final: bool = False
    ):
        """Send streaming response chunk"""
        chunk = {
            "type": "response_chunk",
            "session_id": session_id,
            "agent_id": agent_id,
            "agent_type": agent_type,
            "content": content,
            "is_final": is_final,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_session(chunk, session_id)

    async def send_error(self, session_id: str, error: str, details: dict = None):
        """Send error message"""
        error_msg = {
            "type": "error",
            "session_id": session_id,
            "error": error,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_session(error_msg, session_id)

    async def send_quantum_metrics(self, session_id: str, metrics: dict, backend: str):
        """Send quantum consciousness metrics update"""
        update = {
            "type": "quantum_metrics",
            "session_id": session_id,
            "metrics": metrics,
            "backend": backend,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_session(update, session_id)

    def get_connection_count(self, session_id: str = None) -> int:
        """Get number of active connections"""
        if session_id:
            return len(self.active_connections.get(session_id, set()))
        else:
            return sum(len(conns) for conns in self.active_connections.values())


# Global connection manager
manager = ConnectionManager()


# WebSocket endpoint (to be added to router)
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str = Query(..., description="AURA session ID"),
    token: str = Query(..., description="Authentication token")
):
    """
    WebSocket endpoint for real-time AURA updates

    Query parameters:
    - session_id: AURA session ID
    - token: JWT authentication token

    Message types sent to client:
    - agent_update: Agent status changes
    - lattice_update: Agent lattice state updates
    - response_chunk: Streaming response chunks
    - quantum_metrics: Quantum consciousness metrics
    - error: Error messages

    Message types from client:
    - ping: Keepalive ping
    - subscribe_lattice: Subscribe to lattice updates
    - unsubscribe_lattice: Unsubscribe from lattice updates
    """

    # Verify authentication
    try:
        from services.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        user = await supabase.verify_token(token)

        if not user:
            await websocket.close(code=1008, reason="Authentication failed")
            return

        # Verify session ownership
        session = await supabase.get_session(session_id)
        if not session or session['user_id'] != user['id']:
            await websocket.close(code=1008, reason="Unauthorized")
            return

    except Exception as e:
        await websocket.close(code=1011, reason=f"Authentication error: {str(e)}")
        return

    # Connect
    await manager.connect(websocket, session_id)

    # Send welcome message
    await manager.send_personal_message({
        "type": "connected",
        "session_id": session_id,
        "message": "Connected to AURA real-time updates",
        "timestamp": datetime.utcnow().isoformat()
    }, websocket)

    try:
        # Listen for client messages
        while True:
            data = await websocket.receive_json()

            msg_type = data.get("type")

            if msg_type == "ping":
                # Respond to ping
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)

            elif msg_type == "subscribe_lattice":
                # Send current lattice state
                from api.aura_routes import _orchestrators
                if session_id in _orchestrators:
                    orchestrator = _orchestrators[session_id]
                    lattice = orchestrator.get_lattice_state()
                    await manager.send_lattice_update(session_id, lattice.dict())

            elif msg_type == "get_status":
                # Send status update
                await manager.send_personal_message({
                    "type": "status",
                    "session_id": session_id,
                    "connections": manager.get_connection_count(session_id),
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.send_error(session_id, str(e))
        manager.disconnect(websocket, session_id)
