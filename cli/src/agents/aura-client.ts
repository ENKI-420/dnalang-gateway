/**
 * AURA Multi-Agent API Client
 */

import axios, { AxiosInstance } from 'axios';
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

export class AuraClient {
  private client: AxiosInstance;
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'https://api.dnalang.dev') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
  }

  async createSession(): Promise<AuraSession> {
    const { data } = await this.client.post('/v1/aura/sessions', {
      session_type: 'aura_chat'
    });
    return data;
  }

  async getSession(sessionId: string): Promise<any> {
    const { data } = await this.client.get(`/v1/aura/sessions/${sessionId}`);
    return data;
  }

  async endSession(sessionId: string): Promise<void> {
    await this.client.delete(`/v1/aura/sessions/${sessionId}`);
  }

  async chat(
    sessionId: string,
    prompt: string,
    options: {
      agents_enabled?: string[];
      max_iterations?: number;
      temperature?: number;
      quantum_enhanced?: boolean;
      include_traces?: boolean;
    } = {}
  ): Promise<AuraResponse> {
    const { data } = await this.client.post('/v1/aura/chat', {
      prompt,
      session_id: sessionId,
      agents_enabled: options.agents_enabled || ['architect', 'engineer', 'reviewer', 'synthesizer'],
      max_iterations: options.max_iterations || 5,
      temperature: options.temperature || 0.7,
      quantum_enhanced: options.quantum_enhanced !== false,
      include_traces: options.include_traces || false,
      stream: false
    });
    return data;
  }

  async getLattice(sessionId: string): Promise<AgentLattice> {
    const { data } = await this.client.get(`/v1/aura/sessions/${sessionId}/lattice`);
    return data;
  }

  async getMessages(sessionId: string, limit: number = 50): Promise<any> {
    const { data } = await this.client.get(`/v1/aura/sessions/${sessionId}/messages`, {
      params: { limit }
    });
    return data;
  }

  async getUsage(startDate?: string, endDate?: string): Promise<any> {
    const { data} = await this.client.get('/v1/aura/usage', {
      params: { start_date: startDate, end_date: endDate }
    });
    return data;
  }

  async health(): Promise<any> {
    const { data } = await this.client.get('/v1/aura/health');
    return data;
  }

  getWebSocketURL(sessionId: string): string {
    const wsBaseURL = this.baseURL.replace('https://', 'wss://').replace('http://', 'ws://');
    return `${wsBaseURL}/v1/aura/ws?session_id=${sessionId}&token=${this.token || ''}`;
  }

  connectWebSocket(sessionId: string): WebSocket {
    const url = this.getWebSocketURL(sessionId);
    return new WebSocket(url);
  }
}
