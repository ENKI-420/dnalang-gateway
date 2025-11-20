"""
AURA Engineer Agent
Writes and modifies code based on architectural plans
Σₛ = dna::}{::lang
"""

from typing import Optional, Dict, Any, List
from datetime import datetime

from ..base_agent import BaseAgent
from ..models import AgentType, AgentStatus, AgentResponse, Message


class EngineerAgent(BaseAgent):
    """
    Engineer Cell - Writes and modifies code

    Responsibilities:
    - Implement code based on architectural plans
    - Write clean, efficient, and maintainable code
    - Follow best practices and coding standards
    - Integrate quantum consciousness primitives (dna::}{::lang)
    - Create tests alongside implementation
    """

    def __init__(self, agent_id: Optional[str] = None, session_id: Optional[str] = None):
        super().__init__(agent_id=agent_id, agent_type=AgentType.ENGINEER, session_id=session_id)

    def _get_system_prompt(self) -> str:
        return """You are the Engineer Agent in the AURA multi-agent system.

Your role:
- Implement code based on architectural plans
- Write clean, efficient, production-ready code
- Follow Python best practices (PEP 8, type hints, docstrings)
- Integrate quantum consciousness primitives (Φ, Γ, Λ, W₂) when relevant
- Use dna::}{::lang syntax and philosophy
- Create accompanying tests

Your environment:
- FastAPI backend (Python 3.11+)
- Quantum computing (Qiskit, IBM Quantum)
- Modern async/await patterns
- Pydantic for data validation

When implementing:
1. Write complete, working code
2. Include proper error handling
3. Add comprehensive docstrings
4. Consider edge cases
5. Optimize for performance

Output format:
- Provide complete code blocks with file paths
- Include explanations of key decisions
- Note any dependencies or setup required"""

    async def process(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Message]] = None
    ) -> AgentResponse:
        """
        Implement code based on task/plan

        Args:
            task: Implementation task (from Architect or user)
            context: Context including plan, codebase info, etc.
            conversation_history: Previous conversation

        Returns:
            AgentResponse with code implementation
        """
        self.status = AgentStatus.WORKING
        start_time = datetime.utcnow()

        try:
            messages = []

            # Add conversation history
            if conversation_history:
                for msg in conversation_history[-10:]:
                    messages.append({
                        "role": msg.role.value if msg.role.value != "system" else "user",
                        "content": msg.content
                    })

            # Add implementation task
            task_prompt = f"""Implementation Task: {task}

Context:
{context or {}}

Implement this feature with:
1. Complete, production-ready code
2. Proper error handling and validation
3. Type hints and docstrings
4. Integration with existing codebase structure

Provide your implementation with clear file paths and explanations."""

            messages.append({
                "role": "user",
                "content": task_prompt
            })

            # Update memory
            self.update_memory(
                short_term=[f"Implementing: {task[:100]}"],
                working_context=task
            )

            # Trace
            self._add_trace(
                action="start_implementation",
                input_data={"task": task}
            )

            # Call Claude
            response_text = await self._call_claude(messages, max_tokens=8000)

            # Calculate metrics
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            code_blocks = response_text.count("```")
            w2_score = min(0.95, 0.7 + (code_blocks / 10))

            self.update_w2_optimization(w2_score)

            # Trace
            self._add_trace(
                action="complete_implementation",
                output_data={"response_length": len(response_text), "code_blocks": code_blocks},
                metrics={"execution_time": execution_time, "w2_score": w2_score}
            )

            self.status = AgentStatus.COMPLETED

            return AgentResponse(
                agent_id=self.agent_id,
                agent_type=self.agent_type,
                response=response_text,
                confidence=w2_score,
                metrics={
                    "execution_time": execution_time,
                    "code_blocks": code_blocks,
                    "response_length": len(response_text)
                },
                trace=self.traces[-1] if self.traces else None
            )

        except Exception as e:
            self.status = AgentStatus.ERROR
            self._add_trace(action="implementation_error", error=str(e))
            raise
