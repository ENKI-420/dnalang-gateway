/**
 * Quantum CLI Implementation
 * Main CLI logic for Z3BRA OS engineering
 */
interface CLIOptions {
    verbose?: boolean;
    noColor?: boolean;
    auraUrl?: string;
}
export declare class QuantumCLI {
    private auraClient;
    private quantumMetrics;
    private isoManager;
    private config;
    private verbose;
    constructor(options: CLIOptions);
    /**
     * Build Z3BRA OS ISO
     */
    build(options: any): Promise<void>;
    /**
     * Flash ISO to USB
     */
    flash(iso: string, options: any): Promise<void>;
    /**
     * Interactive agent chat
     */
    agentChat(options: any): Promise<void>;
    /**
     * Execute agent task
     */
    agentTask(description: string, options: any): Promise<void>;
    /**
     * Show agent lattice visualization
     */
    showLattice(options: any): Promise<void>;
    /**
     * Show quantum metrics
     */
    showMetrics(options: any): Promise<void>;
    /**
     * Evolve quantum organism
     */
    evolveOrganism(options: any): Promise<void>;
    /**
     * Calculate IIT (Integrated Information)
     */
    calculateIIT(options: any): Promise<void>;
    /**
     * Generate code component
     */
    generateCode(component: string, options: any): Promise<void>;
    /**
     * Review code
     */
    reviewCode(file: string, options: any): Promise<void>;
    /**
     * Debug issue
     */
    debugIssue(issue: string, options: any): Promise<void>;
    /**
     * System status
     */
    systemStatus(options: any): Promise<void>;
    /**
     * Configure CLI
     */
    configure(options: any): Promise<void>;
    /**
     * Open dashboard
     */
    openDashboard(options: any): Promise<void>;
    /**
     * List ISOs
     */
    listISOs(options: any): Promise<void>;
    /**
     * Verify ISO
     */
    verifyISO(iso: string, options: any): Promise<void>;
    /**
     * ISO info
     */
    isoInfo(iso: string): Promise<void>;
    /**
     * AutoPilot
     */
    autoPilot(task: string, options: any): Promise<void>;
    /**
     * Initialize development environment
     */
    initialize(options: any): Promise<void>;
    private executeBuildScript;
    private checkZ3BRAStatus;
}
export {};
//# sourceMappingURL=quantum-cli.d.ts.map