/**
 * Terminal Command Generator
 * Generates actionable shell commands from high-level tasks
 */
export interface CommandSequence {
    commands: GeneratedCommand[];
    description: string;
    estimated_time: string;
    prerequisites?: string[];
}
export interface GeneratedCommand {
    command: string;
    description: string;
    safe: boolean;
    requires_sudo: boolean;
    dry_run?: string;
    expected_output?: string;
    error_handling?: string;
}
export declare class CommandGenerator {
    /**
     * Generate commands for common development tasks
     */
    generateCommands(task: string, context?: any): CommandSequence;
    private generateDeploymentCommands;
    private generateTestCommands;
    private generateBuildCommands;
    private generateDependencyCommands;
    private generateGitCommands;
    private generateDockerCommands;
    private generateDatabaseCommands;
    private generateSecurityCommands;
    private generatePerformanceCommands;
    private generateQuantumCommands;
    private generateGenericCommands;
    /**
     * Validate command safety before execution
     */
    validateCommand(cmd: GeneratedCommand): {
        safe: boolean;
        warnings: string[];
    };
    /**
     * Generate dry-run version of command
     */
    generateDryRun(cmd: GeneratedCommand): string;
    /**
     * Estimate command execution time
     */
    estimateTime(commands: GeneratedCommand[]): string;
}
//# sourceMappingURL=command-generator.d.ts.map