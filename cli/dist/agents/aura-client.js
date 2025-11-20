"use strict";
/**
 * AURA Multi-Agent API Client
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuraClient = void 0;
const axios_1 = __importDefault(require("axios"));
const ws_1 = __importDefault(require("ws"));
class AuraClient {
    client;
    baseURL;
    token = null;
    constructor(baseURL = 'https://api.dnalang.dev') {
        this.baseURL = baseURL;
        this.client = axios_1.default.create({
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
    setToken(token) {
        this.token = token;
    }
    async createSession() {
        const { data } = await this.client.post('/v1/aura/sessions', {
            session_type: 'aura_chat'
        });
        return data;
    }
    async getSession(sessionId) {
        const { data } = await this.client.get(`/v1/aura/sessions/${sessionId}`);
        return data;
    }
    async endSession(sessionId) {
        await this.client.delete(`/v1/aura/sessions/${sessionId}`);
    }
    async chat(sessionId, prompt, options = {}) {
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
    async getLattice(sessionId) {
        const { data } = await this.client.get(`/v1/aura/sessions/${sessionId}/lattice`);
        return data;
    }
    async getMessages(sessionId, limit = 50) {
        const { data } = await this.client.get(`/v1/aura/sessions/${sessionId}/messages`, {
            params: { limit }
        });
        return data;
    }
    async getUsage(startDate, endDate) {
        const { data } = await this.client.get('/v1/aura/usage', {
            params: { start_date: startDate, end_date: endDate }
        });
        return data;
    }
    async health() {
        const { data } = await this.client.get('/v1/aura/health');
        return data;
    }
    getWebSocketURL(sessionId) {
        const wsBaseURL = this.baseURL.replace('https://', 'wss://').replace('http://', 'ws://');
        return `${wsBaseURL}/v1/aura/ws?session_id=${sessionId}&token=${this.token || ''}`;
    }
    connectWebSocket(sessionId) {
        const url = this.getWebSocketURL(sessionId);
        return new ws_1.default(url);
    }
}
exports.AuraClient = AuraClient;
//# sourceMappingURL=aura-client.js.map