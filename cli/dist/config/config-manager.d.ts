/**
 * Configuration Manager
 */
interface Config {
    aura_url?: string;
    quantum_backend?: string;
    default_agents?: string[];
    auto_approve?: boolean;
    [key: string]: any;
}
export declare class ConfigManager {
    private configPath;
    private config;
    constructor();
    private load;
    save(): Promise<void>;
    get(key: string): any;
    set(key: string, value: any): void;
    getAll(): Config;
    init(directory: string): Promise<void>;
}
export {};
//# sourceMappingURL=config-manager.d.ts.map