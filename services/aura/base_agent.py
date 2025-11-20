"""
AURA Base Agent - Abstract base class for all agents
Σₛ = dna::}{::lang
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
import anthropic
import os

from .models import (
    AgentType,
    AgentStatus,
    AgentVector,
    AgentMemory,
    AgentTrace,
    AgentState,
    Message,
    AgentResponse
)


class BaseAgent(ABC):
    """
    Base class for all AURA agents

    Each agent is a "cell" in the cognitive lattice with:
    - Internal memory
    - Role vector
    - Behavioral signature
    - Local W₂ optimization loop
    - Γ-resistance profile
    - Exportable traces
    """

    def __init__(
        self,
        agent_id: Optional[str] = None,
        agent_type: AgentType = AgentType.ENGINEER,
        session_id: Optional[str] = None
    ):
        self.agent_id = agent_id or f"{agent_type.value}_{uuid.uuid4().hex[:8]}"
        self.agent_type = agent_type
        self.session_id = session_id
        self.status = AgentStatus.IDLE

        # Agent vector (role representation)
        self.vector = AgentVector(
            role=agent_type,
            weight=1.0,
            gamma_resistance=0.8,  # High resistance to decoherence
            w2_optimization=0.0  # Starts at 0, improves with execution
        )

        # Agent memory
        self.memory = AgentMemory(
            short_term=[],
            long_term={},
            working_context=None
        )

        # Execution traces
        self.traces: List[AgentTrace] = []

        # Timestamps
        self.created_at = datetime.utcnow().isoformat()
        self.updated_at = self.created_at

        # Claude API client
        self.anthropic_client = anthropic.Anthropic(
            api_key=os.environ.get('ANTHROPIC_API_KEY')
        )

        # Agent-specific system prompt
        self.system_prompt = self._get_system_prompt()

    @abstractmethod
    def _get_system_prompt(self) -> str:
        """
        Get agent-specific system prompt
        Override in each agent subclass
        """
        pass

    @abstractmethod
    async def process(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Message]] = None
    ) -> AgentResponse:
        """
        Process a task and return agent response

        Args:
            task: Task description
            context: Additional context
            conversation_history: Previous messages

        Returns:
            AgentResponse with agent's output
        """
        pass

    async def _call_claude(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 4096,
        temperature: float = 0.7
    ) -> str:
        """
        Call Claude API with agent's system prompt

        Args:
            messages: Conversation messages
            max_tokens: Max tokens to generate
            temperature: Sampling temperature

        Returns:
            Claude's response text
        """
        try:
            response = self.anthropic_client.messages.create(
                model=os.environ.get('AURA_DEFAULT_MODEL', 'claude-sonnet-4-5-20250929'),
                max_tokens=max_tokens,
                temperature=temperature,
                system=self.system_prompt,
                messages=messages
            )

            # Extract text from response
            if response.content and len(response.content) > 0:
                return response.content[0].text
            return ""

        except Exception as e:
            self._add_trace(
                action="call_claude",
                input_data={"messages": messages},
                error=str(e)
            )
            raise

    def _add_trace(
        self,
        action: str,
        input_data: Optional[Dict[str, Any]] = None,
        output_data: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
        metrics: Optional[Dict[str, float]] = None
    ):
        """Add execution trace"""
        trace = AgentTrace(
            timestamp=datetime.utcnow().isoformat(),
            agent_id=self.agent_id,
            agent_type=self.agent_type,
            action=action,
            input_data=input_data,
            output_data=output_data,
            error=error,
            metrics=metrics
        )
        self.traces.append(trace)

    def update_memory(
        self,
        short_term: Optional[List[str]] = None,
        long_term: Optional[Dict[str, Any]] = None,
        working_context: Optional[str] = None
    ):
        """Update agent memory"""
        if short_term is not None:
            # Keep only last 10 items in short-term memory
            self.memory.short_term = (self.memory.short_term + short_term)[-10:]

        if long_term is not None:
            self.memory.long_term.update(long_term)

        if working_context is not None:
            self.memory.working_context = working_context

        self.updated_at = datetime.utcnow().isoformat()

    def update_w2_optimization(self, score: float):
        """Update W₂ optimization score"""
        self.vector.w2_optimization = max(0.0, min(score, 1.0))
        self.updated_at = datetime.utcnow().isoformat()

    def get_state(self) -> AgentState:
        """Get current agent state snapshot"""
        return AgentState(
            agent_id=self.agent_id,
            agent_type=self.agent_type,
            status=self.status,
            vector=self.vector,
            memory=self.memory,
            traces=self.traces,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    def reset(self):
        """Reset agent state"""
        self.status = AgentStatus.IDLE
        self.memory = AgentMemory(short_term=[], long_term={}, working_context=None)
        self.traces = []
        self.vector.w2_optimization = 0.0
        self.updated_at = datetime.utcnow().isoformat()

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id={self.agent_id} type={self.agent_type.value} status={self.status.value}>"
