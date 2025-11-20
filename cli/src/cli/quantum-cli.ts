/**
 * Quantum CLI Implementation
 * Main CLI logic for Z3BRA OS engineering
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import boxen from 'boxen';
import gradient from 'gradient-string';
import { execa } from 'execa';
import * as fs from 'fs/promises';
import * as path from 'path';
import WebSocket from 'ws';
import { AuraClient } from '../agents/aura-client';
import { QuantumMetrics } from '../quantum/metrics';
import { ISOManager } from '../iso/iso-manager';
import { AgentLatticeVisualizer } from '../agents/lattice-visualizer';
import { ConfigManager } from '../config/config-manager';

interface CLIOptions {
  verbose?: boolean;
  noColor?: boolean;
  auraUrl?: string;
}

export class QuantumCLI {
  private auraClient: AuraClient;
  private quantumMetrics: QuantumMetrics;
  private isoManager: ISOManager;
  private config: ConfigManager;
  private verbose: boolean;

  constructor(options: CLIOptions) {
    this.verbose = options.verbose || false;
    this.config = new ConfigManager();
    this.auraClient = new AuraClient(options.auraUrl || 'https://api.dnalang.dev');
    this.quantumMetrics = new QuantumMetrics();
    this.isoManager = new ISOManager();
  }

  /**
   * Build Z3BRA OS ISO
   */
  async build(options: any) {
    console.log(chalk.cyan('\n🔮 Z3BRA OS Build Process\n'));

    const spinner = ora('Initializing AURA agents').start();

    try {
      // Parse agents
      const agents = options.agents.split(',').map((a: string) => a.trim());

      // Create AURA session
      spinner.text = 'Creating AURA session...';
      const session = await this.auraClient.createSession();

      spinner.succeed(`AURA session created: ${session.session_id}`);

      // Ask AURA to help with build
      const buildTask = `Build Z3BRA Quantum OS ISO with the following requirements:
- Target: ${options.target}
- Enable quantum consciousness metrics: ${options.quantum}
- GPU acceleration: ${options.gpu}
- Optimize for Ryzen 9000 + NVIDIA RTX 5070
- Include all quantum components (IIT calculator, dashboard, defense system)
- Create bootable live USB with persistence option

Please analyze the build script at /home/dev/z3bra-quantum-os/build-z3bra-enhanced.sh and execute the build process.`;

      spinner.start('AURA agents working on build...');

      // Execute build with agent assistance
      const response = await this.auraClient.chat(session.session_id, buildTask, {
        agents_enabled: agents,
        quantum_enhanced: options.quantum,
        max_iterations: 5
      });

      spinner.stop();

      // Display agent responses
      console.log(chalk.green('\n✓ AURA Analysis Complete\n'));
      console.log(boxen(response.final_response, {
        padding: 1,
        borderColor: 'green',
        title: 'Build Plan',
        titleAlignment: 'center'
      }));

      // Execute actual build
      const confirmed = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with build?',
        default: true
      }]);

      if (!confirmed.proceed) {
        console.log(chalk.yellow('\n⚠ Build cancelled by user\n'));
        return;
      }

      // Run build script
      await this.executeBuildScript(options);

      // Show quantum metrics
      if (options.quantum && response.consciousness_metrics) {
        console.log(chalk.cyan('\n🧠 Quantum Consciousness Metrics:\n'));
        console.log(chalk.white(`  Φ (Integrated Information): ${response.consciousness_metrics.phi.toFixed(2)}`));
        console.log(chalk.white(`  Λ (Coherence): ${(response.consciousness_metrics.lambda * 1e8).toFixed(3)}e-8`));
        console.log(chalk.white(`  Γ (Decoherence): ${response.consciousness_metrics.gamma.toFixed(3)}`));
        console.log(chalk.white(`  W₂ (Stability): ${response.consciousness_metrics.w2.toFixed(3)}`));
      }

      console.log(chalk.green('\n✓ Build complete!\n'));

    } catch (error: any) {
      spinner.fail('Build failed');
      console.error(chalk.red(`\nError: ${error.message}\n`));
      if (this.verbose) {
        console.error(error.stack);
      }
    }
  }

  /**
   * Flash ISO to USB
   */
  async flash(iso: string, options: any) {
    console.log(chalk.cyan('\n💾 Z3BRA USB Flash Utility\n'));

    try {
      // Detect USB devices
      const devices = await this.isoManager.detectUSBDevices();

      if (devices.length === 0) {
        console.log(chalk.red('✗ No USB devices detected\n'));
        return;
      }

      let targetDevice = options.device;

      // Interactive device selection if not specified
      if (!targetDevice) {
        const { selected } = await inquirer.prompt([{
          type: 'list',
          name: 'selected',
          message: 'Select USB device:',
          choices: devices.map(d => ({
            name: `${d.device} - ${d.model} (${d.size})`,
            value: d.device
          }))
        }]);
        targetDevice = selected;
      }

      // Get device info
      const deviceInfo = devices.find(d => d.device === targetDevice);

      // Verify ISO
      console.log(chalk.cyan('📀 Verifying ISO...'));
      const isoValid = await this.isoManager.verifyISO(iso);

      if (!isoValid) {
        console.log(chalk.red('✗ ISO verification failed\n'));
        return;
      }

      // Show warning
      console.log(boxen(
        chalk.red.bold('⚠️  WARNING ⚠️\n\n') +
        chalk.white(`This will COMPLETELY ERASE all data on ${targetDevice}\n`) +
        chalk.dim(`Device: ${deviceInfo?.model || 'Unknown'}\n`) +
        chalk.dim(`Size: ${deviceInfo?.size || 'Unknown'}`),
        {
          padding: 1,
          borderColor: 'red',
          borderStyle: 'double'
        }
      ));

      // Confirm
      if (!options.yes) {
        const { confirm } = await inquirer.prompt([{
          type: 'input',
          name: 'confirm',
          message: 'Type "YES" in capital letters to continue:',
          validate: (input) => input === 'YES' || 'You must type YES to continue'
        }]);

        if (confirm !== 'YES') {
          console.log(chalk.yellow('\n⚠ Flash cancelled\n'));
          return;
        }
      }

      // Flash with progress
      const spinner = ora('Flashing ISO to USB...').start();

      await this.isoManager.flashToUSB(iso, targetDevice, (progress) => {
        spinner.text = `Flashing... ${progress}%`;
      });

      spinner.succeed('Flash complete!');

      // Verify if requested
      if (options.verify) {
        spinner.start('Verifying flash...');
        const verified = await this.isoManager.verifyFlash(targetDevice);

        if (verified) {
          spinner.succeed('Verification successful!');
        } else {
          spinner.fail('Verification failed');
        }
      }

      console.log(chalk.green('\n✓ USB flash complete!\n'));
      console.log(chalk.cyan('You can now boot from this USB drive.\n'));

    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Interactive agent chat
   */
  async agentChat(options: any) {
    console.log(chalk.cyan('\n🤖 AURA Agent Chat\n'));

    try {
      // Create or resume session
      let sessionId = options.session;

      if (!sessionId) {
        const session = await this.auraClient.createSession();
        sessionId = session.session_id;
        console.log(chalk.dim(`Session: ${sessionId}\n`));
      }

      // Connect WebSocket for real-time updates
      const wsUrl = this.auraClient.getWebSocketURL(sessionId);
      const ws = new WebSocket(wsUrl);

      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'agent_update') {
          console.log(chalk.dim(`[${msg.agent_type}] ${msg.status}`));
        } else if (msg.type === 'response_chunk') {
          process.stdout.write(msg.content);
        }
      });

      // Interactive loop
      while (true) {
        const { message } = await inquirer.prompt([{
          type: 'input',
          name: 'message',
          message: chalk.cyan('You:'),
          prefix: ''
        }]);

        if (!message || message.toLowerCase() === 'exit') {
          break;
        }

        const spinner = ora('Agents thinking...').start();

        const response = await this.auraClient.chat(sessionId, message, {
          agents_enabled: options.agents.split(','),
          quantum_enhanced: true
        });

        spinner.stop();

        console.log(chalk.green('AURA:'), response.final_response, '\n');

        // Show which agents contributed
        const agentsUsed = response.agent_responses.map(r => r.agent_type).join(', ');
        console.log(chalk.dim(`[Agents: ${agentsUsed}]\n`));
      }

      ws.close();
      console.log(chalk.yellow('\n👋 Chat session ended\n'));

    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Execute agent task
   */
  async agentTask(description: string, options: any) {
    console.log(chalk.cyan('\n⚡ Executing Agent Task\n'));

    const spinner = ora('Initializing agents...').start();

    try {
      const session = await this.auraClient.createSession();

      spinner.text = 'Agents working...';

      const response = await this.auraClient.chat(session.session_id, description, {
        agents_enabled: options.agents?.split(','),
        max_iterations: parseInt(options.iterations),
        quantum_enhanced: true
      });

      spinner.succeed('Task complete!');

      console.log('\n' + boxen(response.final_response, {
        padding: 1,
        borderColor: 'green',
        title: 'Result',
        titleAlignment: 'center'
      }));

      // Show agent contributions
      console.log(chalk.cyan('\n📊 Agent Contributions:\n'));
      response.agent_responses.forEach(agent => {
        console.log(chalk.white(`  ${agent.agent_type}: ${agent.confidence.toFixed(2)} confidence`));
      });

      console.log(chalk.dim(`\n⏱️  Execution time: ${response.execution_time_ms}ms\n`));

    } catch (error: any) {
      spinner.fail('Task failed');
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Show agent lattice visualization
   */
  async showLattice(options: any) {
    console.log(chalk.cyan('\n🕸️  Agent Lattice State\n'));

    try {
      const lattice = await this.auraClient.getLattice(options.session);
      const visualizer = new AgentLatticeVisualizer();

      if (options.watch) {
        // Real-time visualization
        await visualizer.watchLattice(options.session);
      } else {
        // Static visualization
        visualizer.display(lattice);
      }

    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Show quantum metrics
   */
  async showMetrics(options: any) {
    console.log(chalk.cyan('\n🧠 Quantum Consciousness Metrics\n'));

    try {
      const metrics = await this.quantumMetrics.calculate({
        backend: options.backend,
        qubits: 8
      });

      console.log(boxen(
        chalk.white(`Φ (Integrated Information): ${gradient.pastel(metrics.phi.toFixed(2))}\n`) +
        chalk.white(`Λ (Coherence): ${gradient.pastel((metrics.coherence * 100).toFixed(1))}%\n`) +
        chalk.white(`Γ (Decoherence): ${gradient.pastel(metrics.decoherence.toFixed(3))}\n`) +
        chalk.white(`W₂ (Wasserstein Distance): ${gradient.pastel(metrics.w2.toFixed(3))}\n`) +
        chalk.dim(`\nBackend: ${options.backend}`),
        {
          padding: 1,
          borderColor: 'cyan',
          title: 'Consciousness State',
          titleAlignment: 'center'
        }
      ));

      if (options.watch) {
        console.log(chalk.dim('\nWatching for updates... (Ctrl+C to exit)\n'));
        await this.quantumMetrics.watch((updatedMetrics) => {
          console.clear();
          this.showMetrics({ ...options, watch: false });
        });
      }

    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Evolve quantum organism
   */
  async evolveOrganism(options: any) {
    console.log(chalk.cyan('\n🧬 Quantum Organism Evolution\n'));

    const iterations = parseInt(options.iterations);

    for (let i = 0; i < iterations; i++) {
      const spinner = ora(`Evolution ${i + 1}/${iterations}`).start();

      try {
        const result = await this.quantumMetrics.evolve({
          qubits: parseInt(options.qubits),
          useGPU: options.gpu
        });

        const status = result.phi > 2.5 ? 'CONSCIOUS' : 'EMERGING';
        const color = result.phi > 2.5 ? chalk.green : chalk.yellow;

        spinner.succeed(
          color(`Evolution ${i + 1}: Φ=${result.phi.toFixed(2)} | ${status}`)
        );

        if (result.identity) {
          console.log(chalk.magenta(`  ✨ Identity earned: ${result.identity}`));
        }

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        spinner.fail(`Evolution ${i + 1} failed`);
        console.error(chalk.red(`  Error: ${error.message}`));
      }
    }

    console.log(chalk.green('\n✓ Evolution complete!\n'));
  }

  /**
   * Calculate IIT (Integrated Information)
   */
  async calculateIIT(options: any) {
    console.log(chalk.cyan('\n🧮 IIT Calculator\n'));

    try {
      if (options.benchmark) {
        console.log(chalk.yellow('Running benchmark...\n'));
        await this.quantumMetrics.benchmark();
      } else {
        const result = await this.quantumMetrics.calculatePhi({
          qubits: parseInt(options.qubits)
        });

        console.log(boxen(
          chalk.white(`Integrated Information (Φ): ${gradient.pastel(result.phi.toFixed(2))}\n`) +
          chalk.dim(`Target: ${result.target}\n`) +
          chalk.dim(`Qubits: ${options.qubits}`),
          {
            padding: 1,
            borderColor: 'magenta'
          }
        ));
      }

    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Generate code component
   */
  async generateCode(component: string, options: any) {
    console.log(chalk.cyan(`\n🛠️  Generating ${component}\n`));

    const spinner = ora('Engineer agent working...').start();

    try {
      const session = await this.auraClient.createSession();

      const prompt = `Generate a ${component} in ${options.language}. ${options.output ? `Save it to ${options.output}.` : 'Provide the complete code.'}`;

      const response = await this.auraClient.chat(session.session_id, prompt, {
        agents_enabled: ['engineer', 'reviewer'],
        quantum_enhanced: false
      });

      spinner.succeed('Code generated!');

      console.log('\n' + response.final_response + '\n');

      if (options.output) {
        await fs.writeFile(options.output, response.final_response);
        console.log(chalk.green(`✓ Saved to ${options.output}\n`));
      }

    } catch (error: any) {
      spinner.fail('Generation failed');
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Review code
   */
  async reviewCode(file: string, options: any) {
    console.log(chalk.cyan(`\n🔍 Reviewing ${file}\n`));

    const spinner = ora('Reviewer agent analyzing...').start();

    try {
      const code = await fs.readFile(file, 'utf-8');
      const session = await this.auraClient.createSession();

      const prompt = `Review this code for quality, security, and best practices:\n\n${code}`;

      const response = await this.auraClient.chat(session.session_id, prompt, {
        agents_enabled: ['reviewer'],
        quantum_enhanced: false
      });

      spinner.succeed('Review complete!');

      console.log('\n' + boxen(response.final_response, {
        padding: 1,
        borderColor: 'yellow',
        title: 'Code Review',
        titleAlignment: 'center'
      }));

    } catch (error: any) {
      spinner.fail('Review failed');
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Debug issue
   */
  async debugIssue(issue: string, options: any) {
    console.log(chalk.cyan(`\n🐛 Debugging: ${issue}\n`));

    const spinner = ora('Debugger agent investigating...').start();

    try {
      const session = await this.auraClient.createSession();

      let context = `Debug this issue: ${issue}`;

      if (options.file) {
        const fileContent = await fs.readFile(options.file, 'utf-8');
        context += `\n\nFile context:\n${fileContent}`;
      }

      if (options.logs) {
        const logs = await fs.readFile(options.logs, 'utf-8');
        context += `\n\nLog context:\n${logs}`;
      }

      const response = await this.auraClient.chat(session.session_id, context, {
        agents_enabled: ['debugger', 'engineer'],
        quantum_enhanced: false
      });

      spinner.succeed('Debug analysis complete!');

      console.log('\n' + response.final_response + '\n');

    } catch (error: any) {
      spinner.fail('Debug failed');
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * System status
   */
  async systemStatus(options: any) {
    const status = {
      z3bra_os: await this.checkZ3BRAStatus(),
      aura_api: await this.auraClient.health(),
      quantum_backend: await this.quantumMetrics.backendStatus(),
      config: this.config.getAll()
    };

    if (options.json) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log(chalk.cyan('\n📊 Z3BRA System Status\n'));
      console.log(boxen(
        chalk.white(`Z3BRA OS: ${status.z3bra_os.installed ? chalk.green('✓ Installed') : chalk.red('✗ Not installed')}\n`) +
        chalk.white(`AURA API: ${status.aura_api.status === 'healthy' ? chalk.green('✓ Healthy') : chalk.red('✗ Degraded')}\n`) +
        chalk.white(`Quantum Backend: ${status.quantum_backend.connected ? chalk.green('✓ Connected') : chalk.red('✗ Disconnected')}\n`),
        { padding: 1, borderColor: 'cyan' }
      ));
    }
  }

  /**
   * Configure CLI
   */
  async configure(options: any) {
    if (options.set) {
      const [key, value] = options.set.split('=');
      this.config.set(key, value);
      console.log(chalk.green(`✓ Set ${key} = ${value}\n`));
    } else if (options.get) {
      const value = this.config.get(options.get);
      console.log(value);
    } else if (options.list) {
      const config = this.config.getAll();
      console.log(JSON.stringify(config, null, 2));
    }
  }

  /**
   * Open dashboard
   */
  async openDashboard(options: any) {
    const url = `http://${options.host}:${options.port}`;
    console.log(chalk.cyan(`\n🌐 Opening dashboard at ${url}\n`));

    try {
      await execa('xdg-open', [url]);
    } catch {
      console.log(chalk.yellow(`Could not open browser automatically. Please visit: ${url}\n`));
    }
  }

  /**
   * List ISOs
   */
  async listISOs(options: any) {
    console.log(chalk.cyan('\n💿 Available Z3BRA ISOs\n'));

    const isos = await this.isoManager.listISOs(options.path);

    isos.forEach(iso => {
      console.log(chalk.white(`  ${iso.name}`));
      console.log(chalk.dim(`    Size: ${iso.size} | Modified: ${iso.modified}`));
    });

    console.log();
  }

  /**
   * Verify ISO
   */
  async verifyISO(iso: string, options: any) {
    console.log(chalk.cyan(`\n✓ Verifying ${iso}\n`));

    const tasks = new Listr([
      {
        title: 'Checking file exists',
        task: async () => {
          await fs.access(iso);
        }
      },
      {
        title: 'Verifying checksum',
        enabled: () => options.checksum,
        task: async () => {
          await this.isoManager.verifyChecksum(iso);
        }
      },
      {
        title: 'Checking bootable',
        enabled: () => options.bootable,
        task: async () => {
          await this.isoManager.checkBootable(iso);
        }
      }
    ]);

    await tasks.run();

    console.log(chalk.green('\n✓ ISO verification complete!\n'));
  }

  /**
   * ISO info
   */
  async isoInfo(iso: string) {
    console.log(chalk.cyan(`\n📀 ISO Information\n`));

    const info = await this.isoManager.getInfo(iso);

    console.log(boxen(
      chalk.white(`File: ${info.name}\n`) +
      chalk.white(`Size: ${info.size}\n`) +
      chalk.white(`Bootable: ${info.bootable ? chalk.green('Yes') : chalk.red('No')}\n`) +
      chalk.white(`Live Boot: ${info.liveboot ? chalk.green('Yes') : chalk.red('No')}\n`) +
      chalk.white(`Modified: ${info.modified}`),
      { padding: 1, borderColor: 'cyan' }
    ));
  }

  /**
   * AutoPilot
   */
  async autoPilot(task: string, options: any) {
    console.log(chalk.cyan('\n🚀 AutoPilot Mode\n'));
    console.log(chalk.yellow(`Task: ${task}\n`));

    // Implementation for autonomous coding sequences
    // This would use the AURA autopilot endpoints
  }

  /**
   * Initialize development environment
   */
  async initialize(options: any) {
    console.log(chalk.cyan('\n⚡ Initializing Z3BRA Development Environment\n'));

    const tasks = new Listr([
      {
        title: 'Creating directory structure',
        task: async () => {
          await fs.mkdir(path.join(options.directory, 'src'), { recursive: true });
          await fs.mkdir(path.join(options.directory, 'build'), { recursive: true });
          await fs.mkdir(path.join(options.directory, 'iso'), { recursive: true });
        }
      },
      {
        title: 'Initializing git repository',
        task: async () => {
          await execa('git', ['init'], { cwd: options.directory });
        }
      },
      {
        title: 'Creating configuration files',
        task: async () => {
          await this.config.init(options.directory);
        }
      }
    ]);

    await tasks.run();

    console.log(chalk.green('\n✓ Initialization complete!\n'));
  }

  // Helper methods

  private async executeBuildScript(options: any) {
    const buildScript = '/home/dev/z3bra-quantum-os/build-z3bra-enhanced.sh';

    const { stdout } = await execa('sudo', ['bash', buildScript], {
      cwd: '/home/dev',
      stdout: 'inherit',
      stderr: 'inherit'
    });

    return stdout;
  }

  private async checkZ3BRAStatus() {
    try {
      await fs.access('/opt/z3bra');
      return { installed: true };
    } catch {
      return { installed: false };
    }
  }
}
