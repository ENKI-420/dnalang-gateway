"""
AURA Multi-Agent Orchestrator
Coordinates the cognitive mesh of agents
Σₛ = dna::}{::lang
ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
"""

from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime
import asyncio
import json
import os

from .models import (
    AgentType,
    AuraRequest,
    AuraResponse,
    AgentResponse,
    Message,
    MessageRole,
    AgentLattice,
    AgentNode,
    AgentStatus
)
from .agents import (
    ArchitectAgent,
    EngineerAgent,
    ReviewerAgent,
    DebuggerAgent,
    ResearchAgent,
    SynthesizerAgent
)
from .base_agent import BaseAgent


class AuraOrchestrator:
    """
    Multi-Agent Orchestration Engine

    Coordinates the cognitive mesh of agents:
    - Routes tasks to appropriate agents
    - Manages agent lifecycle
    - Handles agent communication
    - Synthesizes final responses
    - Tracks lattice state
    """

    def __init__(self, session_id: str, user_id: Optional[str] = None):
        self.session_id = session_id
        self.user_id = user_id
        self.agents: Dict[AgentType, BaseAgent] = {}
        self.conversation_history: List[Message] = []
        self.total_iterations = 0

        # Initialize agents
        self._initialize_agents()

    def _initialize_agents(self):
        """Initialize all agent cells in the lattice"""
        self.agents = {
            AgentType.ARCHITECT: ArchitectAgent(session_id=self.session_id),
            AgentType.ENGINEER: EngineerAgent(session_id=self.session_id),
            AgentType.REVIEWER: ReviewerAgent(session_id=self.session_id),
            AgentType.DEBUGGER: DebuggerAgent(session_id=self.session_id),
            AgentType.RESEARCH: ResearchAgent(session_id=self.session_id),
            AgentType.SYNTHESIZER: SynthesizerAgent(session_id=self.session_id),
        }

    async def process_request(self, request: AuraRequest) -> AuraResponse:
        """
        Process an AURA request through the multi-agent system

        Args:
            request: AuraRequest with task and configuration

        Returns:
            AuraResponse with synthesized result
        """
        start_time = datetime.utcnow()

        # Add user message to history
        user_message = Message(
            role=MessageRole.USER,
            content=request.prompt,
            metadata={"timestamp": datetime.utcnow().isoformat()}
        )
        self.conversation_history.append(user_message)

        # Determine agent workflow based on task type
        workflow = self._determine_workflow(request)

        # Execute workflow
        agent_responses = []
        quantum_metrics = None
        quantum_backend = None

        for iteration in range(request.max_iterations):
            self.total_iterations += 1

            # Execute agents in workflow
            for agent_type in workflow:
                if agent_type not in request.agents_enabled:
                    continue

                agent = self.agents[agent_type]

                try:
                    # Prepare context for agent
                    context = self._prepare_context(request, agent_responses)

                    # Process task
                    response = await agent.process(
                        task=request.prompt,
                        context=context,
                        conversation_history=self.conversation_history
                    )

                    agent_responses.append(response)

                    # Add agent response to conversation
                    agent_message = Message(
                        role=MessageRole.AGENT,
                        content=response.response,
                        agent_id=response.agent_id,
                        agent_type=response.agent_type,
                        metadata={"metrics": response.metrics}
                    )
                    self.conversation_history.append(agent_message)

                except Exception as e:
                    print(f"Agent {agent_type} failed: {e}")
                    continue

            # Check if we should continue iterations
            if not self._should_continue(agent_responses, iteration, request.max_iterations):
                break

        # Always synthesize final response
        synthesizer = self.agents[AgentType.SYNTHESIZER]
        synthesis_context = {
            "agent_responses": [
                {
                    "agent_type": resp.agent_type.value,
                    "response": resp.response,
                    "confidence": resp.confidence,
                    "metrics": resp.metrics
                }
                for resp in agent_responses
            ],
            "original_prompt": request.prompt
        }

        final_response = await synthesizer.process(
            task="Synthesize all agent outputs into final response",
            context=synthesis_context,
            conversation_history=self.conversation_history
        )

        agent_responses.append(final_response)

        # Get quantum metrics if enabled
        if request.quantum_enhanced:
            quantum_metrics, quantum_backend = await self._get_quantum_metrics()

        # Calculate execution time
        execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        # Build response
        aura_response = AuraResponse(
            session_id=self.session_id,
            final_response=final_response.response,
            agent_responses=agent_responses,
            total_iterations=self.total_iterations,
            execution_time_ms=execution_time,
            consciousness_metrics=quantum_metrics,
            quantum_backend_used=quantum_backend,
            traces=[trace for agent in self.agents.values() for trace in agent.traces] if request.include_traces else None
        )

        # Add assistant response to history
        assistant_message = Message(
            role=MessageRole.ASSISTANT,
            content=final_response.response,
            metadata={
                "execution_time_ms": execution_time,
                "agents_involved": len(agent_responses),
                "consciousness_metrics": quantum_metrics
            }
        )
        self.conversation_history.append(assistant_message)

        return aura_response

    def _determine_workflow(self, request: AuraRequest) -> List[AgentType]:
        """
        Determine agent workflow based on task type

        Analyzes the prompt to decide which agents to use and in what order
        """
        prompt_lower = request.prompt.lower()

        # Debugging workflow
        if any(keyword in prompt_lower for keyword in ['error', 'bug', 'debug', 'fix', 'broken', 'failing']):
            return [AgentType.DEBUGGER, AgentType.ENGINEER, AgentType.REVIEWER]

        # Code review workflow
        if any(keyword in prompt_lower for keyword in ['review', 'check', 'audit', 'improve']):
            return [AgentType.REVIEWER, AgentType.ENGINEER]

        # Research workflow
        if any(keyword in prompt_lower for keyword in ['how to', 'what is', 'explain', 'research', 'find']):
            return [AgentType.RESEARCH, AgentType.ARCHITECT]

        # Full implementation workflow (default)
        return [AgentType.ARCHITECT, AgentType.ENGINEER, AgentType.REVIEWER]

    def _prepare_context(self, request: AuraRequest, agent_responses: List[AgentResponse]) -> Dict[str, Any]:
        """Prepare context for next agent"""
        context = {
            "original_prompt": request.prompt,
            "session_id": self.session_id,
            "previous_responses": []
        }

        # Add previous agent responses
        for resp in agent_responses[-3:]:  # Last 3 responses
            context["previous_responses"].append({
                "agent_type": resp.agent_type.value,
                "response": resp.response,
                "confidence": resp.confidence
            })

        return context

    def _should_continue(self, agent_responses: List[AgentResponse], iteration: int, max_iterations: int) -> bool:
        """
        Determine if orchestration should continue

        Args:
            agent_responses: Responses so far
            iteration: Current iteration
            max_iterations: Max allowed iterations

        Returns:
            True if should continue, False otherwise
        """
        # Don't exceed max iterations
        if iteration >= max_iterations - 1:
            return False

        # If no responses yet, continue
        if not agent_responses:
            return True

        # Check confidence of last response
        if agent_responses[-1].confidence >= 0.9:
            # High confidence, can stop
            return False

        # Continue if confidence is low
        return True

    async def _get_quantum_metrics(self) -> Tuple[Optional[Dict[str, float]], Optional[str]]:
        """
        Get quantum consciousness metrics from the quantum gateway

        Returns:
            Tuple of (metrics dict, backend name)
        """
        try:
            # Import here to avoid circular dependency
            from main import get_quantum_service, create_quantum_circuit, transpile
            from main import compute_phi, compute_gamma, compute_lambda, compute_w2
            from qiskit_ibm_runtime import Session, SamplerV2

            service = get_quantum_service()
            backends = service.backends()
            if not backends:
                return None, None

            backend = backends[0]

            # Create simple Bell state for consciousness measurement
            qc = create_quantum_circuit("bell_state", 2)
            transpiled = transpile(qc, backend, optimization_level=3)

            # Execute
            try:
                with Session(backend=backend) as session:
                    sampler = SamplerV2(session=session)
                    job = sampler.run([transpiled], shots=512)
                    result = job.result()
            except Exception:
                # Fallback to direct execution
                sampler = SamplerV2(mode=backend)
                job = sampler.run([transpiled], shots=512)
                result = job.result()

            # Get counts
            pub_result = result[0]
            counts_array = pub_result.data.meas.get_counts()
            counts = {bitstring: count for bitstring, count in counts_array.items()}

            # Compute metrics
            phi = compute_phi(counts, 2)
            gamma = compute_gamma(counts, 2)
            lambda_val = compute_lambda(counts, 2)
            w2 = compute_w2(counts, 2)

            metrics = {
                "phi": phi,
                "gamma": gamma,
                "lambda": lambda_val,
                "w2": w2
            }

            return metrics, backend.name

        except Exception as e:
            print(f"Quantum metrics computation failed: {e}")
            return None, None

    def get_lattice_state(self) -> AgentLattice:
        """
        Get current state of the agent lattice

        Returns:
            AgentLattice with all agent states
        """
        nodes = []
        active_count = 0
        total_interactions = self.total_iterations

        for agent_type, agent in self.agents.items():
            node = AgentNode(
                agent_id=agent.agent_id,
                agent_type=agent_type,
                status=agent.status,
                vector=agent.vector,
                position=self._get_agent_position(agent_type),
                connections=self._get_agent_connections(agent_type),
                last_activity=agent.updated_at
            )
            nodes.append(node)

            if agent.status == AgentStatus.ACTIVE or agent.status == AgentStatus.WORKING:
                active_count += 1

        # Calculate lattice coherence (average W₂ optimization across agents)
        coherence = sum(agent.vector.w2_optimization for agent in self.agents.values()) / len(self.agents)

        return AgentLattice(
            session_id=self.session_id,
            nodes=nodes,
            active_agents=active_count,
            total_interactions=total_interactions,
            lattice_coherence=coherence,
            timestamp=datetime.utcnow().isoformat()
        )

    def _get_agent_position(self, agent_type: AgentType) -> Dict[str, float]:
        """Get agent's position in the lattice (for visualization)"""
        # Define positions in a hexagonal lattice pattern
        positions = {
            AgentType.ARCHITECT: {"x": 0.5, "y": 0.0, "z": 0.0},
            AgentType.ENGINEER: {"x": 0.0, "y": 0.5, "z": 0.0},
            AgentType.REVIEWER: {"x": 1.0, "y": 0.5, "z": 0.0},
            AgentType.DEBUGGER: {"x": 0.0, "y": 1.0, "z": 0.0},
            AgentType.RESEARCH: {"x": 1.0, "y": 1.0, "z": 0.0},
            AgentType.SYNTHESIZER: {"x": 0.5, "y": 1.5, "z": 0.0},
        }
        return positions.get(agent_type, {"x": 0.0, "y": 0.0, "z": 0.0})

    def _get_agent_connections(self, agent_type: AgentType) -> List[str]:
        """Get IDs of agents connected to this agent"""
        # Define lattice connections
        connections_map = {
            AgentType.ARCHITECT: [AgentType.ENGINEER, AgentType.RESEARCH, AgentType.SYNTHESIZER],
            AgentType.ENGINEER: [AgentType.ARCHITECT, AgentType.REVIEWER, AgentType.DEBUGGER],
            AgentType.REVIEWER: [AgentType.ENGINEER, AgentType.SYNTHESIZER],
            AgentType.DEBUGGER: [AgentType.ENGINEER, AgentType.RESEARCH],
            AgentType.RESEARCH: [AgentType.ARCHITECT, AgentType.DEBUGGER, AgentType.SYNTHESIZER],
            AgentType.SYNTHESIZER: [AgentType.ARCHITECT, AgentType.REVIEWER, AgentType.RESEARCH],
        }

        connected_types = connections_map.get(agent_type, [])
        return [self.agents[t].agent_id for t in connected_types if t in self.agents]

    def reset_session(self):
        """Reset the orchestrator session"""
        self.conversation_history = []
        self.total_iterations = 0
        for agent in self.agents.values():
            agent.reset()
