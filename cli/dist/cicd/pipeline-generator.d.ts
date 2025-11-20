/**
 * CI/CD Pipeline Generator
 * Generate CI/CD configurations for GitHub Actions, GitLab CI, etc.
 */
export interface PipelineConfig {
    provider: 'github' | 'gitlab' | 'circleci' | 'jenkins';
    stages: PipelineStage[];
    environment: Record<string, string>;
    secrets: string[];
}
export interface PipelineStage {
    name: string;
    steps: PipelineStep[];
}
export interface PipelineStep {
    name: string;
    command: string;
    condition?: string;
}
export declare class PipelineGenerator {
    /**
     * Generate GitHub Actions workflow
     */
    generateGitHubActions(config: Partial<PipelineConfig>): string;
    /**
     * Generate GitLab CI configuration
     */
    generateGitLabCI(config: Partial<PipelineConfig>): string;
    /**
     * Generate Docker CI/CD workflow
     */
    generateDockerPipeline(): string;
    /**
     * Generate comprehensive test pipeline
     */
    generateTestPipeline(): string;
    /**
     * Generate deployment pipeline
     */
    generateDeploymentPipeline(platform: 'vercel' | 'netlify' | 'aws' | 'gcp'): string;
    /**
     * Save pipeline to file
     */
    savePipeline(content: string, provider: string, targetDir?: string): Promise<string>;
    /**
     * Simple YAML converter (basic implementation)
     */
    private toYAML;
}
//# sourceMappingURL=pipeline-generator.d.ts.map