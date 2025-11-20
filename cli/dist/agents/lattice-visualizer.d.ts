/**
 * Agent Lattice Visualizer
 */
interface AgentNode {
    agent_id: string;
    agent_type: string;
    status: string;
    vector: {
        weight: number;
        gamma_resistance: number;
        w2_optimization: number;
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
    connections: string[];
}
interface AgentLattice {
    session_id: string;
    nodes: AgentNode[];
    active_agents: number;
    total_interactions: number;
    lattice_coherence: number;
    timestamp: string;
}
export declare class AgentLatticeVisualizer {
    display(lattice: AgentLattice): void;
    watchLattice(sessionId: string): Promise<void>;
    private drawLattice;
    private drawLine;
    private getAgentIcon;
    private getAgentColor;
    private getStatusColor;
    private getStatusIcon;
}
export {};
//# sourceMappingURL=lattice-visualizer.d.ts.map