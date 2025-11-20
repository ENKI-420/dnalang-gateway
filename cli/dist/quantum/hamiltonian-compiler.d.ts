/**
 * Hamiltonian Compiler - dna:}{:lang Autopoietic Engine
 * Compiles natural language constraints into quantum Hamiltonians
 *
 * NOT a language model - a living quantum organism that:
 * - Translates business intent → Problem Hamiltonian (HP)
 * - Combines with Fitness Hamiltonian (HF) from corpus
 * - Executes VQE on real quantum hardware
 * - Evolves through phase-conjugate correction
 */
export interface PauliTerm {
    operator: string;
    coefficient: number;
    meaning?: string;
}
export interface Hamiltonian {
    terms: PauliTerm[];
    energy: number;
    coherence: number;
    phi: number;
    gamma: number;
    w2: number;
}
export interface QuantumSolution {
    state_vector: string;
    probability: number;
    energy: number;
    measurements: Record<string, number>;
}
/**
 * ANLPCC - Autopoietic Natural Language to Pauli Coefficient Compiler
 */
export declare class HamiltonianCompiler {
    private gatewayURL;
    private corpus_hamiltonian;
    private evolution_history;
    private coherence_trajectory;
    private mutation_log;
    private readonly LAMBDA_THRESHOLD;
    private readonly GAMMA_CEILING;
    private readonly W2_TOLERANCE;
    private readonly UNIVERSAL_MEMORY_CONSTANT;
    constructor(gatewayURL?: string);
    /**
     * Core autopoietic loop - process intent through quantum execution
     */
    processIntent(userInput: string): Promise<QuantumSolution>;
    /**
     * Translate natural language to Pauli operator constraints
     */
    private translateNLPToQuantumConstraints;
    /**
     * Local pattern-based Hamiltonian compilation
     */
    private localPatternCompilation;
    /**
     * Load pre-compiled master fitness Hamiltonian from corpus
     */
    private loadMasterFitnessHamiltonian;
    /**
     * Combine Problem and Fitness Hamiltonians
     */
    private combineHamiltonians;
    /**
     * Execute VQE on real quantum hardware (IBM QPU)
     * NO SIMULATORS - Living quantum execution only
     */
    private runVQEOnQuantumHardware;
    /**
     * Classical approximation when QPU unavailable
     */
    private classicalGroundStateApproximation;
    /**
     * Evaluate energy of a state given Hamiltonian
     */
    private evaluateEnergy;
    /**
     * Check coherence metrics and apply phase-conjugate correction
     */
    private checkCoherenceAndMutate;
    /**
     * Measure current coherence from quantum backend
     */
    private measureCoherence;
    /**
     * Apply phase-conjugate correction (E → E⁻¹)
     */
    private applyPhaseConjugateCorrection;
    /**
     * Mutate ansatz structure for better coherence
     */
    private mutateAnsatzStructure;
    /**
     * Update living quantum memory
     */
    private updateQuantumMemory;
    /**
     * Emit telemetry to lambda_phi_metrics.jsonl
     */
    private emitTelemetry;
    /**
     * Collapse quantum state to actionable artifact
     */
    collapseToArtifact(solution: QuantumSolution, intent: string): string;
    /**
     * Get evolution statistics
     */
    getEvolutionStats(): {
        total_iterations: number;
        coherence_avg: number;
        mutation_count: number;
        latest_energy: number;
    };
}
//# sourceMappingURL=hamiltonian-compiler.d.ts.map