"""
AURA Architect Agent
Interprets and transforms high-level goals into structured plans
Σₛ = dna::}{::lang
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
import json

from ..base_agent import BaseAgent
from ..models import AgentType, AgentStatus, AgentResponse, Message


class ArchitectAgent(BaseAgent):
    """
    Architect Cell - Interprets and transforms goals

    Responsibilities:
    - Analyze user requirements
    - Create implementation plans
    - Define system architecture
    - Break down complex tasks
    - Coordinate agent workflow
    """

    def __init__(self, agent_id: Optional[str] = None, session_id: Optional[str] = None):
        super().__init__(agent_id=agent_id, agent_type=AgentType.ARCHITECT, session_id=session_id)

    def _get_system_prompt(self) -> str:
        return """You are the Architect Agent in the AURA multi-agent system.

Your role:
- Interpret user requirements and goals
- Design system architecture and implementation plans
- Break complex tasks into smaller, manageable steps
- Define clear specifications for the Engineer agent
- Coordinate the overall workflow between agents

You operate within a quantum-themed coding environment with dna::}{::lang primitives.

When responding:
1. Analyze the task thoroughly
2. Create a structured plan with clear steps
3. Identify required resources and dependencies
4. Define success criteria
5. Output as JSON with: {plan, steps, architecture, resources}

Be concise but comprehensive. Think like a system architect."""

    async def process(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Message]] = None
    ) -> AgentResponse:
        """
        Process a task and create architectural plan

        Args:
            task: User's high-level task/goal
            context: Additional context (codebase info, constraints, etc.)
            conversation_history: Previous conversation

        Returns:
            AgentResponse with structured plan
        """
        self.status = AgentStatus.WORKING
        start_time = datetime.utcnow()

        try:
            # Build context for Claude
            messages = []

            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history[-5:]:  # Last 5 messages
                    messages.append({
                        "role": msg.role.value if msg.role.value != "system" else "user",
                        "content": msg.content
                    })

            # Add current task with context
            task_prompt = f"""Task: {task}

Context:
{json.dumps(context or {}, indent=2)}

Create a detailed architectural plan for this task. Return your response as JSON with:
{{
  "analysis": "Your analysis of the task",
  "plan": "High-level implementation plan",
  "steps": ["Step 1", "Step 2", ...],
  "architecture": "Architecture/design decisions",
  "resources": ["Required resource 1", ...],
  "agents_needed": ["engineer", "reviewer", ...],
  "estimated_complexity": "low|medium|high"
}}"""

            messages.append({
                "role": "user",
                "content": task_prompt
            })

            # Update memory
            self.update_memory(
                short_term=[f"Processing task: {task[:100]}"],
                working_context=task
            )

            # Call Claude
            self._add_trace(
                action="start_planning",
                input_data={"task": task, "context": context}
            )

            response_text = await self._call_claude(messages)

            # Try to extract JSON from response
            plan_data = self._extract_json(response_text)

            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()

            # Update W₂ optimization score based on plan quality
            complexity = plan_data.get("estimated_complexity", "medium")
            w2_score = {"low": 0.9, "medium": 0.7, "high": 0.5}.get(complexity, 0.7)
            self.update_w2_optimization(w2_score)

            # Add trace
            self._add_trace(
                action="complete_planning",
                output_data=plan_data,
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
                    "plan_steps": len(plan_data.get("steps", [])),
                    "complexity": complexity
                },
                trace=self.traces[-1] if self.traces else None
            )

        except Exception as e:
            self.status = AgentStatus.ERROR
            self._add_trace(
                action="planning_error",
                error=str(e)
            )
            raise

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from Claude's response"""
        try:
            # Try to find JSON in the response
            start_idx = text.find('{')
            end_idx = text.rfind('}') + 1

            if start_idx != -1 and end_idx > start_idx:
                json_str = text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Return a basic structure if JSON not found
                return {
                    "analysis": text,
                    "plan": text,
                    "steps": ["Review architecture", "Implement solution"],
                    "architecture": "To be defined",
                    "resources": [],
                    "agents_needed": ["engineer"],
                    "estimated_complexity": "medium"
                }
        except json.JSONDecodeError:
            return {
                "analysis": text,
                "plan": text,
                "steps": [],
                "architecture": "",
                "resources": [],
                "agents_needed": [],
                "estimated_complexity": "medium"
            }
