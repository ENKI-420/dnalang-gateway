/**
 * Solve Command - Interactive Problem Solving
 * Uses knowledge base and command generation to solve development problems
 */
import { Solution } from '../knowledge/problem-solver';
export declare class SolveCommand {
    private problemSolver;
    private commandGenerator;
    constructor(auraURL?: string);
    /**
     * Interactive problem solving session
     */
    solve(options?: any): Promise<void>;
    /**
     * Display solution in formatted output
     */
    private displaySolution;
    /**
     * Execute command sequence with user confirmation
     */
    private executeCommandSequence;
    /**
     * Gather context about current environment
     */
    private gatherContext;
    /**
     * Classify problem domain from description
     */
    private classifyDomain;
    /**
     * Export solution to file
     */
    exportSolution(solution: Solution, filepath: string): Promise<void>;
}
//# sourceMappingURL=solve-command.d.ts.map