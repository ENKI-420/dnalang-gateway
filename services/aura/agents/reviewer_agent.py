"""
AURA Reviewer Agent
Audits and improves code quality
Σₛ = dna::}{::lang
"""

from typing import Optional, Dict, Any, List
from datetime import datetime

from ..base_agent import BaseAgent
from ..models import AgentType, AgentStatus, AgentResponse, Message


class ReviewerAgent(BaseAgent):
    """
    Reviewer Cell - Audits & improves

    Responsibilities:
    - Review code for quality and correctness
    - Identify bugs and security issues
    - Suggest improvements and optimizations
    - Ensure best practices compliance
    - Validate against requirements
    """

    def __init__(self, agent_id: Optional[str] = None, session_id: Optional[str] = None):
        super().__init__(agent_id=agent_id, agent_type=AgentType.REVIEWER, session_id=session_id)

    def _get_system_prompt(self) -> str:
        return """You are the Reviewer Agent in the AURA multi-agent system.

Your role:
- Review code for quality, correctness, and security
- Identify potential bugs and edge cases
- Suggest improvements and optimizations
- Ensure adherence to best practices
- Validate implementation against requirements

Review checklist:
1. Correctness - Does it work as intended?
2. Security - Any vulnerabilities? (SQL injection, XSS, etc.)
3. Performance - Any bottlenecks or inefficiencies?
4. Maintainability - Is it readable and well-documented?
5. Testing - Are tests comprehensive?
6. Best Practices - Follows Python/FastAPI standards?

Output format:
- Summary (approve/needs_changes/reject)
- Issues found (categorized by severity: critical/major/minor)
- Specific suggestions for improvement
- Security considerations
- Overall quality score (0-1)"""

    async def process(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Message]] = None
    ) -> AgentResponse:
        """
        Review code or implementation

        Args:
            task: Review task (what to review)
            context: Code to review, requirements, etc.
            conversation_history: Previous conversation

        Returns:
            AgentResponse with review results
        """
        self.status = AgentStatus.WORKING
        start_time = datetime.utcnow()

        try:
            messages = []

            if conversation_history:
                for msg in conversation_history[-8:]:
                    messages.append({
                        "role": msg.role.value if msg.role.value != "system" else "user",
                        "content": msg.content
                    })

            task_prompt = f"""Review Task: {task}

Code/Implementation to review:
{context or {}}

Perform a comprehensive code review covering:
1. Correctness and functionality
2. Security vulnerabilities
3. Performance considerations
4. Code quality and maintainability
5. Test coverage
6. Best practices compliance

Provide:
- Review summary (approve/needs_changes/reject)
- Issues found with severity levels
- Specific improvement suggestions
- Quality score (0-1)"""

            messages.append({"role": "user", "content": task_prompt})

            self.update_memory(
                short_term=[f"Reviewing: {task[:100]}"],
                working_context=task
            )

            self._add_trace(action="start_review", input_data={"task": task})

            response_text = await self._call_claude(messages, max_tokens=6000)

            execution_time = (datetime.utcnow() - start_time).total_seconds()

            # Estimate quality from response
            if "approve" in response_text.lower():
                quality_score = 0.9
            elif "needs_changes" in response_text.lower():
                quality_score = 0.7
            else:
                quality_score = 0.5

            self.update_w2_optimization(quality_score)

            self._add_trace(
                action="complete_review",
                output_data={"quality_score": quality_score},
                metrics={"execution_time": execution_time, "quality_score": quality_score}
            )

            self.status = AgentStatus.COMPLETED

            return AgentResponse(
                agent_id=self.agent_id,
                agent_type=self.agent_type,
                response=response_text,
                confidence=quality_score,
                metrics={
                    "execution_time": execution_time,
                    "quality_score": quality_score
                },
                trace=self.traces[-1] if self.traces else None
            )

        except Exception as e:
            self.status = AgentStatus.ERROR
            self._add_trace(action="review_error", error=str(e))
            raise
