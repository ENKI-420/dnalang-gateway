/**
 * Project Scaffolder
 * Generate project templates for common use cases
 */
export interface ProjectTemplate {
    name: string;
    description: string;
    files: TemplateFile[];
    dependencies: string[];
    devDependencies: string[];
    scripts: Record<string, string>;
    postInstall?: string[];
}
export interface TemplateFile {
    path: string;
    content: string;
}
export declare class ProjectScaffolder {
    /**
     * Get available templates
     */
    getTemplates(): ProjectTemplate[];
    /**
     * Scaffold a project from template
     */
    scaffold(template: ProjectTemplate, targetDir: string): Promise<void>;
    /**
     * Next.js Full-Stack Template
     */
    private getNextJsTemplate;
    /**
     * Express API Template
     */
    private getExpressAPITemplate;
    /**
     * React Component Library Template
     */
    private getReactLibraryTemplate;
    /**
     * Python ML Project Template
     */
    private getPythonMLTemplate;
    /**
     * Quantum Computing Project Template
     */
    private getQuantumProjectTemplate;
    /**
     * Dockerized Full-Stack Template
     */
    private getDockerizedFullStackTemplate;
    /**
     * Microservice Template
     */
    private getMicroserviceTemplate;
    private arrayToObject;
}
//# sourceMappingURL=project-scaffolder.d.ts.map