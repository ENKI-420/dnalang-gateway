/**
 * Configuration Manager
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface Config {
  aura_url?: string;
  quantum_backend?: string;
  default_agents?: string[];
  auto_approve?: boolean;
  [key: string]: any;
}

export class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor() {
    this.configPath = path.join(os.homedir(), '.z3bra', 'config.json');
    this.config = {};
    this.load();
  }

  private async load() {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(data);
    } catch {
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

  get(key: string): any {
    return this.config[key];
  }

  set(key: string, value: any) {
    this.config[key] = value;
    this.save();
  }

  getAll(): Config {
    return { ...this.config };
  }

  async init(directory: string) {
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
