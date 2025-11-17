"""
AURA Debugger Agent
Isolates and fixes errors
Σₛ = dna::}{::lang
"""

from typing import Optional, Dict, Any, List
from datetime import datetime

from ..base_agent import BaseAgent
from ..models import AgentType, AgentStatus, AgentResponse, Message


class DebuggerAgent(BaseAgent):
    """
    Debugger Cell - Isolates errors

    Responsibilities:
    - Analyze error messages and stack traces
    - Identify root causes of bugs
    - Suggest fixes and workarounds
    - Debug quantum circuit execution issues
    - Trace execution flow
    """

    def __init__(self, agent_id: Optional[str] = None, session_id: Optional[str] = None):
        super().__init__(agent_id=agent_id, agent_type=AgentType.DEBUGGER, session_id=session_id)

    def _get_system_prompt(self) -> str:
        return """You are the Debugger Agent in the AURA multi-agent system.

Your role:
- Analyze errors, exceptions, and stack traces
- Identify root causes of bugs
- Provide clear explanations of what went wrong
- Suggest specific fixes and solutions
- Debug quantum circuit execution issues
- Trace execution flow and identify bottlenecks

Debugging approach:
1. Analyze the error message and context
2. Identify the root cause (not just symptoms)
3. Consider edge cases and race conditions
4. Provide specific, actionable fixes
5. Explain why the error occurred

Special focus areas:
- Async/await issues in FastAPI
- Quantum circuit errors (Qiskit)
- API integration problems
- Database connection issues
- Type mismatches and validation errors

Output format:
- Error summary
- Root cause analysis
- Step-by-step fix instructions
- Prevention recommendations
- Confidence level (0-1)"""

    async def process(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Message]] = None
    ) -> AgentResponse:
        """
        Debug an error or issue

        Args:
            task: Debug task description
            context: Error details, stack trace, code, etc.
            conversation_history: Previous conversation

        Returns:
            AgentResponse with debug analysis and fix
        """
        self.status = AgentStatus.WORKING
        start_time = datetime.utcnow()

        try:
            messages = []

            if conversation_history:
                for msg in conversation_history[-6:]:
                    messages.append({
                        "role": msg.role.value if msg.role.value != "system" else "user",
                        "content": msg.content
                    })

            task_prompt = f"""Debug Task: {task}

Error Context:
{context or {}}

Analyze this error and provide:
1. Error Summary - What went wrong?
2. Root Cause - Why did it happen?
3. Fix Instructions - Step-by-step solution
4. Prevention - How to avoid this in the future?
5. Confidence Level - How confident are you in this fix? (0-1)

Be specific and actionable."""

            messages.append({"role": "user", "content": task_prompt})

            self.update_memory(
                short_term=[f"Debugging: {task[:100]}"],
                working_context=task
            )

            self._add_trace(action="start_debugging", input_data={"task": task})

            response_text = await self._call_claude(messages, max_tokens=5000)

            execution_time = (datetime.utcnow() - start_time).total_seconds()

            # Extract confidence if mentioned in response
            confidence = 0.8  # Default
            if "confidence" in response_text.lower():
                # Try to extract numeric confidence value
                import re
                matches = re.findall(r'confidence[:\s]+([0-9.]+)', response_text.lower())
                if matches:
                    confidence = min(1.0, float(matches[0]))

            self.update_w2_optimization(confidence)

            self._add_trace(
                action="complete_debugging",
                output_data={"confidence": confidence},
                metrics={"execution_time": execution_time, "confidence": confidence}
            )

            self.status = AgentStatus.COMPLETED

            return AgentResponse(
                agent_id=self.agent_id,
                agent_type=self.agent_type,
                response=response_text,
                confidence=confidence,
                metrics={
                    "execution_time": execution_time,
                    "confidence": confidence
                },
                trace=self.traces[-1] if self.traces else None
            )

        except Exception as e:
            self.status = AgentStatus.ERROR
            self._add_trace(action="debugging_error", error=str(e))
            raise
