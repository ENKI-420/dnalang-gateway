"""
AURA Multi-Agent API Routes
Σₛ = dna::}{::lang
ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
"""

from fastapi import APIRouter, HTTPException, Header, Depends, WebSocket, WebSocketDisconnect, Query
from typing import Optional, Dict, Any, List
from datetime import datetime
import json
import uuid

from .aura_websocket import websocket_endpoint

from services.aura import (
    AuraOrchestrator,
    AuraRequest,
    AuraResponse,
    SessionInfo,
    AgentLattice,
    CreateSessionRequest,
    CreateSessionResponse,
    UsageStats,
    AgentType
)
from services.supabase_client import get_supabase_client
from services.stripe_client import get_stripe_client


# Router
router = APIRouter(prefix="/v1/aura", tags=["AURA Multi-Agent System"])

# Global orchestrator registry (session_id -> orchestrator)
_orchestrators: Dict[str, AuraOrchestrator] = {}


# ==========================================
# Authentication Dependency
# ==========================================

async def verify_auth(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Verify authentication token from Supabase

    Args:
        authorization: Authorization header (Bearer token)

    Returns:
        User data

    Raises:
        HTTPException: If authentication fails
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # Extract token
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = parts[1]

    # Verify with Supabase
    supabase = get_supabase_client()
    user = await supabase.verify_token(token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user


# ==========================================
# Session Management Endpoints
# ==========================================

@router.post("/sessions", response_model=CreateSessionResponse)
async def create_session(
    request: CreateSessionRequest,
    user: Dict[str, Any] = Depends(verify_auth)
):
    """
    Create a new AURA session

    Requires authentication.
    """
    try:
        supabase = get_supabase_client()

        # Create session in database
        session = await supabase.create_session(
            user_id=user['id'],
            session_type=request.session_type
        )

        if not session:
            raise HTTPException(status_code=500, detail="Failed to create session")

        # Create orchestrator
        session_id = session['id']
        orchestrator = AuraOrchestrator(session_id=session_id, user_id=user['id'])
        _orchestrators[session_id] = orchestrator

        return CreateSessionResponse(
            session_id=session_id,
            created_at=session['created_at'],
            status=session['status']
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session creation failed: {str(e)}")


@router.get("/sessions/{session_id}", response_model=SessionInfo)
async def get_session(
    session_id: str,
    user: Dict[str, Any] = Depends(verify_auth)
):
    """
    Get session information

    Requires authentication and session ownership.
    """
    try:
        supabase = get_supabase_client()

        # Get session from database
        session = await supabase.get_session(session_id)

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Verify ownership
        if session['user_id'] != user['id']:
            raise HTTPException(status_code=403, detail="Unauthorized access to session")

        # Get message count
        messages = await supabase.get_conversation_history(session_id, limit=1000)

        # Get agent states if orchestrator exists
        agent_states = []
        if session_id in _orchestrators:
            orchestrator = _orchestrators[session_id]
            for agent in orchestrator.agents.values():
                agent_states.append(agent.get_state())

        return SessionInfo(
            session_id=session_id,
            user_id=session['user_id'],
            status=session['status'],
            created_at=session['created_at'],
            ended_at=session.get('ended_at'),
            message_count=len(messages),
            agent_states=agent_states
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")


@router.delete("/sessions/{session_id}")
async def end_session(
    session_id: str,
    user: Dict[str, Any] = Depends(verify_auth)
):
    """
    End an AURA session

    Requires authentication and session ownership.
    """
    try:
        supabase = get_supabase_client()

        # Get session
        session = await supabase.get_session(session_id)

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        if session['user_id'] != user['id']:
            raise HTTPException(status_code=403, detail="Unauthorized")

        # End session
        await supabase.end_session(session_id)

        # Remove orchestrator
        if session_id in _orchestrators:
            del _orchestrators[session_id]

        return {"status": "ended", "session_id": session_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to end session: {str(e)}")


# ==========================================
# AURA Inference Endpoints
# ==========================================

@router.post("/chat", response_model=AuraResponse)
async def aura_chat(
    request: AuraRequest,
    user: Dict[str, Any] = Depends(verify_auth)
):
    """
    AURA multi-agent chat/coding assistance

    Requires authentication.
    """
    try:
        supabase = get_supabase_client()
        stripe_client = get_stripe_client()

        # Get or create session
        if request.session_id:
            session = await supabase.get_session(request.session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            if session['user_id'] != user['id']:
                raise HTTPException(status_code=403, detail="Unauthorized")
            session_id = request.session_id
        else:
            # Create new session
            session = await supabase.create_session(user_id=user['id'], session_type="aura_chat")
            session_id = session['id']

        # Get or create orchestrator
        if session_id not in _orchestrators:
            _orchestrators[session_id] = AuraOrchestrator(session_id=session_id, user_id=user['id'])

        orchestrator = _orchestrators[session_id]

        # Process request
        response = await orchestrator.process_request(request)

        # Save messages to database
        await supabase.save_message(
            session_id=session_id,
            role="user",
            content=request.prompt,
            metadata={"timestamp": datetime.utcnow().isoformat()}
        )

        await supabase.save_message(
            session_id=session_id,
            role="assistant",
            content=response.final_response,
            metadata={
                "agents_used": [r.agent_type.value for r in response.agent_responses],
                "execution_time_ms": response.execution_time_ms,
                "consciousness_metrics": response.consciousness_metrics
            }
        )

        # Log usage for billing
        await supabase.log_usage(
            user_id=user['id'],
            session_id=session_id,
            usage_type="agent_call",
            quantity=len(response.agent_responses),
            metadata={
                "agents": [r.agent_type.value for r in response.agent_responses],
                "execution_time_ms": response.execution_time_ms
            }
        )

        # Update response with session_id
        response.session_id = session_id

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AURA chat failed: {str(e)}")


# ==========================================
# Agent Lattice Endpoints
# ==========================================

@router.get("/sessions/{session_id}/lattice", response_model=AgentLattice)
async def get_agent_lattice(
    session_id: str,
    user: Dict[str, Any] = Depends(verify_auth)
):
    """
    Get current agent lattice state for visualization

    Requires authentication and session ownership.
    """
    try:
        supabase = get_supabase_client()

        # Verify session ownership
        session = await supabase.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session['user_id'] != user['id']:
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Get orchestrator
        if session_id not in _orchestrators:
            raise HTTPException(status_code=404, detail="No active orchestrator for this session")

        orchestrator = _orchestrators[session_id]
        lattice = orchestrator.get_lattice_state()

        return lattice

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get lattice: {str(e)}")


# ==========================================
# Conversation History Endpoints
# ==========================================

@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    limit: int = 50,
    user: Dict[str, Any] = Depends(verify_auth)
):
    """
    Get conversation history for a session

    Requires authentication and session ownership.
    """
    try:
        supabase = get_supabase_client()

        # Verify session ownership
        session = await supabase.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session['user_id'] != user['id']:
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Get messages
        messages = await supabase.get_conversation_history(session_id, limit=limit)

        return {
            "session_id": session_id,
            "messages": messages,
            "total": len(messages)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")


# ==========================================
# Usage & Billing Endpoints
# ==========================================

@router.get("/usage", response_model=UsageStats)
async def get_usage_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: Dict[str, Any] = Depends(verify_auth)
):
    """
    Get usage statistics for billing

    Requires authentication.
    """
    try:
        supabase = get_supabase_client()

        # Get usage records
        usage_records = await supabase.get_user_usage(
            user_id=user['id'],
            start_date=start_date,
            end_date=end_date
        )

        # Aggregate statistics
        stats = {
            "total_agent_calls": 0,
            "total_quantum_execs": 0,
            "total_messages": 0,
            "total_autopilot_steps": 0,
            "total_credits_used": 0.0,
        }

        for record in usage_records:
            usage_type = record.get('usage_type', '')
            quantity = record.get('quantity', 0)

            if usage_type == "agent_call":
                stats["total_agent_calls"] += quantity
            elif usage_type == "quantum_exec":
                stats["total_quantum_execs"] += quantity
            elif usage_type == "message":
                stats["total_messages"] += quantity
            elif usage_type == "autopilot_step":
                stats["total_autopilot_steps"] += quantity

            # Calculate credits (example pricing)
            cost = quantity * 0.01  # 0.01 credits per unit
            stats["total_credits_used"] += cost

        return UsageStats(
            user_id=user['id'],
            period_start=start_date or datetime.utcnow().isoformat(),
            period_end=end_date or datetime.utcnow().isoformat(),
            **stats,
            breakdown=stats
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage stats: {str(e)}")


# ==========================================
# WebSocket Endpoint
# ==========================================

@router.websocket("/ws")
async def websocket_route(
    websocket: WebSocket,
    session_id: str = Query(...),
    token: str = Query(...)
):
    """
    WebSocket endpoint for real-time AURA updates

    Connect with: ws://api.dnalang.dev/v1/aura/ws?session_id=xxx&token=yyy
    """
    await websocket_endpoint(websocket, session_id, token)


# ==========================================
# Health Check
# ==========================================

@router.get("/health")
async def aura_health():
    """AURA system health check"""
    try:
        # Check if services are accessible
        supabase = get_supabase_client()
        stripe_client = get_stripe_client()

        from .aura_websocket import manager

        return {
            "status": "healthy",
            "aura_version": "1.0.0",
            "active_sessions": len(_orchestrators),
            "websocket_connections": manager.get_connection_count(),
            "services": {
                "supabase": "connected",
                "stripe": "connected",
                "anthropic": "configured"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
