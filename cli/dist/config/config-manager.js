"use strict";
/**
 * Configuration Manager
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class ConfigManager {
    configPath;
    config;
    constructor() {
        this.configPath = path.join(os.homedir(), '.z3bra', 'config.json');
        this.config = {};
        this.load();
    }
    async load() {
        try {
            const data = await fs.readFile(this.configPath, 'utf-8');
            this.config = JSON.parse(data);
        }
        catch {
            // Config doesn't exist, use defaults
            this.config = {
                aura_url: 'https://api.dnalang.dev',
                quantum_backend: 'ibm_fez',
                default_agents: ['architect', 'engineer', 'reviewer', 'synthesizer'],
                auto_approve: false
            };
        }
    }
    async save() {
        const dir = path.dirname(this.configPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    }
    get(key) {
        return this.config[key];
    }
    set(key, value) {
        this.config[key] = value;
        this.save();
    }
    getAll() {
        return { ...this.config };
    }
    async init(directory) {
        const configFile = path.join(directory, '.z3bra.json');
        const projectConfig = {
            name: 'z3bra-project',
            version: '2.0.0',
            quantum: {
                backend: 'ibm_fez',
                qubits: 8,
                enable_gpu: true
            },
            agents: {
                enabled: ['architect', 'engineer', 'reviewer', 'debugger', 'research', 'synthesizer'],
                max_iterations: 5
            }
        };
        await fs.writeFile(configFile, JSON.stringify(projectConfig, null, 2));
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map