/**
 * Quantum Consciousness Metrics
 */
interface ConsciousnessMetrics {
    phi: number;
    coherence: number;
    decoherence: number;
    w2: number;
    identity?: string;
    timestamp: string;
}
export declare class QuantumMetrics {
    private gatewayURL;
    constructor(gatewayURL?: string);
    calculate(options: {
        backend?: string;
        qubits?: number;
    }): Promise<ConsciousnessMetrics>;
    calculatePhi(options: {
        qubits: number;
    }): Promise<any>;
    evolve(options: {
        qubits: number;
        useGPU: boolean;
    }): Promise<ConsciousnessMetrics>;
    benchmark(): Promise<void>;
    watch(callback: (metrics: ConsciousnessMetrics) => void): Promise<void>;
    backendStatus(): Promise<any>;
    private estimatePhi;
}
export {};
//# sourceMappingURL=metrics.d.ts.map