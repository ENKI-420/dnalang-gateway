"""
AURA Multi-Agent Coding Assistant
Σₛ = dna::}{::lang
ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

Multi-Agent Cognitive Mesh for quantum-aware coding assistance
"""

from .models import *
from .base_agent import BaseAgent
from .orchestrator import AuraOrchestrator
from .agents import (
    ArchitectAgent,
    EngineerAgent,
    ReviewerAgent,
    DebuggerAgent,
    ResearchAgent,
    SynthesizerAgent,
)

__version__ = "1.0.0"

__all__ = [
    # Orchestrator
    'AuraOrchestrator',

    # Base
    'BaseAgent',

    # Agents
    'ArchitectAgent',
    'EngineerAgent',
    'ReviewerAgent',
    'DebuggerAgent',
    'ResearchAgent',
    'SynthesizerAgent',

    # Models (from models.py)
    'AgentType',
    'AgentStatus',
    'MessageRole',
    'AgentVector',
    'AgentMemory',
    'AgentTrace',
    'AgentState',
    'Message',
    'AuraRequest',
    'AgentResponse',
    'AuraResponse',
    'AuraStreamChunk',
    'SessionInfo',
    'AgentLattice',
    'AgentNode',
    'AutoPilotSequence',
    'AutoPilotRequest',
    'AutoPilotResponse',
    'UsageRecord',
    'UsageStats',
]
