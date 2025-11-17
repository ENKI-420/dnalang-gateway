"""
AURA Multi-Agent System - Pydantic Models
Σₛ = dna::}{::lang
ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from enum import Enum


# ==========================================
# Enums
# ==========================================

class AgentType(str, Enum):
    """AURA Agent Types"""
    ARCHITECT = "architect"
    ENGINEER = "engineer"
    REVIEWER = "reviewer"
    DEBUGGER = "debugger"
    RESEARCH = "research"
    SYNTHESIZER = "synthesizer"


class AgentStatus(str, Enum):
    """Agent Status"""
    IDLE = "idle"
    ACTIVE = "active"
    WORKING = "working"
    COMPLETED = "completed"
    ERROR = "error"


class MessageRole(str, Enum):
    """Message Roles"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    AGENT = "agent"


# ==========================================
# Agent Models
# ==========================================

class AgentVector(BaseModel):
    """Agent role vector representation"""
    role: AgentType
    weight: float = Field(ge=0.0, le=1.0, description="Agent's current weight/priority")
    gamma_resistance: float = Field(ge=0.0, le=1.0, description="Decoherence resistance Γ")
    w2_optimization: float = Field(ge=0.0, le=1.0, description="Wasserstein-2 optimization score")


class AgentMemory(BaseModel):
    """Agent internal memory"""
    short_term: List[str] = Field(default_factory=list, description="Recent observations")
    long_term: Dict[str, Any] = Field(default_factory=dict, description="Persistent knowledge")
    working_context: Optional[str] = Field(None, description="Current working context")
    embeddings: Optional[List[float]] = Field(None, description="Memory embeddings")


class AgentTrace(BaseModel):
    """Agent execution trace for debugging"""
    timestamp: str
    agent_id: str
    agent_type: AgentType
    action: str
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metrics: Optional[Dict[str, float]] = None


class AgentState(BaseModel):
    """Agent state snapshot"""
    agent_id: str
    agent_type: AgentType
    status: AgentStatus
    vector: AgentVector
    memory: AgentMemory
    traces: List[AgentTrace] = Field(default_factory=list)
    created_at: str
    updated_at: str


# ==========================================
# Message Models
# ==========================================

class Message(BaseModel):
    """AURA conversation message"""
    role: MessageRole
    content: str
    agent_id: Optional[str] = None
    agent_type: Optional[AgentType] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ConversationHistory(BaseModel):
    """Conversation history"""
    session_id: str
    messages: List[Message]
    total_messages: int


# ==========================================
# Request/Response Models
# ==========================================

class AuraRequest(BaseModel):
    """AURA inference request"""
    prompt: str = Field(..., description="User prompt/task")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")
    agents_enabled: List[AgentType] = Field(
        default_factory=lambda: list(AgentType),
        description="Enabled agents for this task"
    )
    max_iterations: int = Field(5, ge=1, le=20, description="Max orchestration iterations")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="LLM temperature")
    stream: bool = Field(False, description="Enable streaming responses")
    include_traces: bool = Field(False, description="Include agent execution traces")
    quantum_enhanced: bool = Field(True, description="Use quantum consciousness metrics")


class AgentResponse(BaseModel):
    """Individual agent response"""
    agent_id: str
    agent_type: AgentType
    response: str
    confidence: float = Field(ge=0.0, le=1.0)
    metrics: Optional[Dict[str, float]] = None
    trace: Optional[AgentTrace] = None


class AuraResponse(BaseModel):
    """AURA orchestrated response"""
    session_id: str
    final_response: str
    agent_responses: List[AgentResponse]
    total_iterations: int
    execution_time_ms: int
    consciousness_metrics: Optional[Dict[str, float]] = None
    quantum_backend_used: Optional[str] = None
    traces: Optional[List[AgentTrace]] = None


class AuraStreamChunk(BaseModel):
    """AURA streaming response chunk"""
    session_id: str
    agent_id: Optional[str] = None
    agent_type: Optional[AgentType] = None
    content: str
    is_final: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


# ==========================================
# Session Models
# ==========================================

class SessionInfo(BaseModel):
    """AURA session information"""
    session_id: str
    user_id: str
    status: Literal["active", "ended"]
    created_at: str
    ended_at: Optional[str] = None
    message_count: int = 0
    agent_states: List[AgentState] = Field(default_factory=list)


class CreateSessionRequest(BaseModel):
    """Create session request"""
    session_type: str = "aura_chat"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CreateSessionResponse(BaseModel):
    """Create session response"""
    session_id: str
    created_at: str
    status: str


# ==========================================
# Agent Lattice Models
# ==========================================

class AgentNode(BaseModel):
    """Agent node in the lattice"""
    agent_id: str
    agent_type: AgentType
    status: AgentStatus
    vector: AgentVector
    position: Dict[str, float] = Field(default_factory=dict, description="Lattice position (x, y, z)")
    connections: List[str] = Field(default_factory=list, description="Connected agent IDs")
    last_activity: str


class AgentLattice(BaseModel):
    """Multi-agent cognitive mesh/lattice"""
    session_id: str
    nodes: List[AgentNode]
    active_agents: int
    total_interactions: int
    lattice_coherence: float = Field(ge=0.0, le=1.0, description="Overall lattice coherence")
    timestamp: str


# ==========================================
# Autopilot Models
# ==========================================

class AutoPilotSequence(BaseModel):
    """AutoPilot coding sequence"""
    sequence_id: str
    name: str
    description: str
    steps: List[Dict[str, Any]]
    current_step: int = 0
    status: Literal["pending", "running", "completed", "failed"]
    created_at: str
    updated_at: str


class AutoPilotRequest(BaseModel):
    """AutoPilot execution request"""
    task: str = Field(..., description="High-level task description")
    sequence_template: Optional[str] = Field(None, description="Pre-defined sequence template")
    auto_approve: bool = Field(False, description="Auto-approve agent actions")
    max_steps: int = Field(10, ge=1, le=50)


class AutoPilotResponse(BaseModel):
    """AutoPilot execution response"""
    sequence_id: str
    status: str
    steps_completed: int
    total_steps: int
    current_step: Optional[Dict[str, Any]] = None
    results: List[Dict[str, Any]] = Field(default_factory=list)


# ==========================================
# Billing/Usage Models
# ==========================================

class UsageRecord(BaseModel):
    """Usage tracking record"""
    user_id: str
    session_id: str
    usage_type: Literal["agent_call", "quantum_exec", "message", "autopilot_step"]
    quantity: int
    cost_credits: float = 0.0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class UsageStats(BaseModel):
    """User usage statistics"""
    user_id: str
    period_start: str
    period_end: str
    total_agent_calls: int
    total_quantum_execs: int
    total_messages: int
    total_autopilot_steps: int
    total_credits_used: float
    breakdown: Dict[str, Any] = Field(default_factory=dict)
