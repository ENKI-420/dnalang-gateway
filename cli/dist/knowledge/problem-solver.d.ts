/**
 * Problem Solver - Knowledge Base & Solution Generator
 * Provides context-aware problem solving with actionable solutions
 */
export interface Problem {
    description: string;
    domain: string;
    context?: {
        files?: string[];
        logs?: string[];
        environment?: Record<string, string>;
    };
}
export interface Solution {
    steps: SolutionStep[];
    commands: string[];
    explanation: string;
    confidence: number;
    references: string[];
}
export interface SolutionStep {
    description: string;
    command?: string;
    expected_output?: string;
    validation?: string;
}
export interface KnowledgeEntry {
    pattern: RegExp;
    domain: string;
    solutions: {
        steps: string[];
        commands: string[];
        references: string[];
    };
}
export declare class ProblemSolver {
    private knowledgeBase;
    private gatewayURL;
    constructor(gatewayURL?: string);
    /**
     * Solve a problem and return actionable solutions
     */
    solve(problem: Problem): Promise<Solution>;
    /**
     * Classify problem domain using NLP
     */
    private classifyDomain;
    /**
     * Search knowledge base for matching solutions
     */
    private searchKnowledgeBase;
    /**
     * Query AURA agents for solution
     */
    private queryAuraAgents;
    /**
     * Generate generic solution when knowledge base and AURA fail
     */
    private generateGenericSolution;
    /**
     * Initialize knowledge base with common problem patterns
     */
    private initializeKnowledgeBase;
    /**
     * Add custom knowledge entry
     */
    addKnowledge(entry: KnowledgeEntry): void;
    /**
     * Get all knowledge domains
     */
    getDomains(): string[];
    /**
     * Export knowledge base
     */
    exportKnowledge(filepath: string): Promise<void>;
    /**
     * Import knowledge base
     */
    importKnowledge(filepath: string): Promise<void>;
}
//# sourceMappingURL=problem-solver.d.ts.map