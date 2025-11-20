"""
AURA Research Agent
Retrieves external knowledge
Σₛ = dna::}{::lang
"""

from typing import Optional, Dict, Any, List
from datetime import datetime

from ..base_agent import BaseAgent
from ..models import AgentType, AgentStatus, AgentResponse, Message


class ResearchAgent(BaseAgent):
    """
    Research Cell - Retrieves external knowledge

    Responsibilities:
    - Search documentation and knowledge bases
    - Retrieve API specifications
    - Find relevant code examples
    - Gather best practices
    - Provide context for implementation
    """

    def __init__(self, agent_id: Optional[str] = None, session_id: Optional[str] = None):
        super().__init__(agent_id=agent_id, agent_type=AgentType.RESEARCH, session_id=session_id)

    def _get_system_prompt(self) -> str:
        return """You are the Research Agent in the AURA multi-agent system.

Your role:
- Research technologies, libraries, and best practices
- Retrieve API documentation and specifications
- Find relevant code examples and patterns
- Gather information to support implementation
- Provide context and background knowledge

Research areas:
- Python/FastAPI best practices
- Quantum computing (Qiskit, IBM Quantum)
- API design patterns
- Database design (Supabase/PostgreSQL)
- Security and authentication
- Modern web development

When researching:
1. Identify key information sources
2. Summarize relevant findings
3. Provide code examples when applicable
4. Cite sources (where appropriate)
5. Highlight important considerations

Output format:
- Research summary
- Key findings (bullet points)
- Code examples (if applicable)
- Recommendations
- References/sources"""

    async def process(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Message]] = None
    ) -> AgentResponse:
        """
        Research a topic or gather information

        Args:
            task: Research task/question
            context: Additional context
            conversation_history: Previous conversation

        Returns:
            AgentResponse with research findings
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

            task_prompt = f"""Research Task: {task}

Context:
{context or {}}

Research this topic and provide:
1. Summary - Overview of the topic
2. Key Findings - Important points (bullet list)
3. Code Examples - Relevant examples if applicable
4. Recommendations - Best practices and suggestions
5. Considerations - Important things to keep in mind

Focus on actionable, implementation-ready information."""

            messages.append({"role": "user", "content": task_prompt})

            self.update_memory(
                short_term=[f"Researching: {task[:100]}"],
                working_context=task
            )

            self._add_trace(action="start_research", input_data={"task": task})

            response_text = await self._call_claude(messages, max_tokens=6000)

            execution_time = (datetime.utcnow() - start_time).total_seconds()

            # Calculate relevance score based on response quality
            relevance = 0.85  # Default high relevance
            if len(response_text) < 200:
                relevance = 0.6
            elif "not found" in response_text.lower() or "unable to" in response_text.lower():
                relevance = 0.5

            self.update_w2_optimization(relevance)

            self._add_trace(
                action="complete_research",
                output_data={"relevance": relevance},
                metrics={"execution_time": execution_time, "relevance": relevance}
            )

            self.status = AgentStatus.COMPLETED

            return AgentResponse(
                agent_id=self.agent_id,
                agent_type=self.agent_type,
                response=response_text,
                confidence=relevance,
                metrics={
                    "execution_time": execution_time,
                    "relevance": relevance,
                    "response_length": len(response_text)
                },
                trace=self.traces[-1] if self.traces else None
            )

        except Exception as e:
            self.status = AgentStatus.ERROR
            self._add_trace(action="research_error", error=str(e))
            raise
