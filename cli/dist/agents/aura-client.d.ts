/**
 * AURA Multi-Agent API Client
 */
import WebSocket from 'ws';
interface AuraSession {
    session_id: string;
    created_at: string;
    status: string;
}
interface AuraResponse {
    session_id: string;
    final_response: string;
    agent_responses: any[];
    total_iterations: number;
    execution_time_ms: number;
    consciousness_metrics?: any;
    quantum_backend_used?: string;
}
interface AgentLattice {
    session_id: string;
    nodes: any[];
    active_agents: number;
    total_interactions: number;
    lattice_coherence: number;
    timestamp: string;
}
export declare class AuraClient {
    private client;
    private baseURL;
    private token;
    constructor(baseURL?: string);
    setToken(token: string): void;
    createSession(): Promise<AuraSession>;
    getSession(sessionId: string): Promise<any>;
    endSession(sessionId: string): Promise<void>;
    chat(sessionId: string, prompt: string, options?: {
        agents_enabled?: string[];
        max_iterations?: number;
        temperature?: number;
        quantum_enhanced?: boolean;
        include_traces?: boolean;
    }): Promise<AuraResponse>;
    getLattice(sessionId: string): Promise<AgentLattice>;
    getMessages(sessionId: string, limit?: number): Promise<any>;
    getUsage(startDate?: string, endDate?: string): Promise<any>;
    health(): Promise<any>;
    getWebSocketURL(sessionId: string): string;
    connectWebSocket(sessionId: string): WebSocket;
}
export {};
//# sourceMappingURL=aura-client.d.ts.map