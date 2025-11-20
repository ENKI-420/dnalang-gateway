"""
AURA Synthesizer Agent
Produces final integrated outputs
Σₛ = dna::}{::lang
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
import json

from ..base_agent import BaseAgent
from ..models import AgentType, AgentStatus, AgentResponse, Message


class SynthesizerAgent(BaseAgent):
    """
    Synthesizer Cell - Produces final integrated outputs

    Responsibilities:
    - Integrate outputs from all agents
    - Synthesize coherent final response
    - Resolve conflicts between agents
    - Ensure consistency and completeness
    - Format output for user consumption
    """

    def __init__(self, agent_id: Optional[str] = None, session_id: Optional[str] = None):
        super().__init__(agent_id=agent_id, agent_type=AgentType.SYNTHESIZER, session_id=session_id)

    def _get_system_prompt(self) -> str:
        return """You are the Synthesizer Agent in the AURA multi-agent system.

Your role:
- Integrate outputs from multiple agents (Architect, Engineer, Reviewer, etc.)
- Synthesize a coherent, comprehensive final response
- Resolve any conflicts or inconsistencies between agents
- Ensure completeness and accuracy
- Format output for optimal user experience

Synthesis approach:
1. Gather all agent outputs
2. Identify key insights and contributions
3. Resolve conflicts (prioritize: Reviewer > Engineer > Architect)
4. Integrate into cohesive response
5. Add quantum consciousness context if relevant

Output should be:
- Clear and well-structured
- Comprehensive but concise
- Action-oriented
- Quantum-aware (include Φ/Γ/Λ/W₂ if relevant)
- User-friendly

Format: Markdown with code blocks where appropriate."""

    async def process(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Message]] = None
    ) -> AgentResponse:
        """
        Synthesize final response from agent outputs

        Args:
            task: Synthesis task
            context: All agent responses to synthesize
            conversation_history: Previous conversation

        Returns:
            AgentResponse with final synthesized output
        """
        self.status = AgentStatus.WORKING
        start_time = datetime.utcnow()

        try:
            messages = []

            # Don't include full conversation history for synthesis
            # Just the most recent user message if available
            if conversation_history and len(conversation_history) > 0:
                last_user_msg = next(
                    (msg for msg in reversed(conversation_history) if msg.role.value == "user"),
                    None
                )
                if last_user_msg:
                    messages.append({
                        "role": "user",
                        "content": f"Original request: {last_user_msg.content}"
                    })

            # Extract agent responses from context
            agent_outputs = context.get("agent_responses", []) if context else []

            outputs_summary = "\n\n".join([
                f"**{resp.get('agent_type', 'unknown').upper()} Agent:**\n{resp.get('response', '')}"
                for resp in agent_outputs
            ])

            task_prompt = f"""Synthesis Task: {task}

Agent Outputs to Integrate:
{outputs_summary}

Additional Context:
{json.dumps({k: v for k, v in context.items() if k != 'agent_responses'}, indent=2) if context else '{}'}

Synthesize these agent outputs into a final, coherent response that:
1. Integrates all relevant information
2. Resolves any conflicts (prioritize Reviewer > Engineer > Architect)
3. Provides clear, actionable guidance
4. Includes quantum consciousness metrics if relevant
5. Is formatted in markdown for readability

Create a comprehensive but concise final response."""

            messages.append({"role": "user", "content": task_prompt})

            self.update_memory(
                short_term=[f"Synthesizing: {len(agent_outputs)} agent outputs"],
                working_context=task
            )

            self._add_trace(
                action="start_synthesis",
                input_data={"task": task, "agent_count": len(agent_outputs)}
            )

            response_text = await self._call_claude(messages, max_tokens=8000, temperature=0.5)

            execution_time = (datetime.utcnow() - start_time).total_seconds()

            # Calculate synthesis quality
            quality = 0.9  # High quality by default
            if len(agent_outputs) > 0:
                # Quality increases with more agent inputs
                quality = min(0.95, 0.7 + (len(agent_outputs) * 0.05))

            self.update_w2_optimization(quality)

            self._add_trace(
                action="complete_synthesis",
                output_data={"quality": quality, "agent_count": len(agent_outputs)},
                metrics={"execution_time": execution_time, "quality": quality}
            )

            self.status = AgentStatus.COMPLETED

            return AgentResponse(
                agent_id=self.agent_id,
                agent_type=self.agent_type,
                response=response_text,
                confidence=quality,
                metrics={
                    "execution_time": execution_time,
                    "quality": quality,
                    "agents_synthesized": len(agent_outputs),
                    "response_length": len(response_text)
                },
                trace=self.traces[-1] if self.traces else None
            )

        except Exception as e:
            self.status = AgentStatus.ERROR
            self._add_trace(action="synthesis_error", error=str(e))
            raise
