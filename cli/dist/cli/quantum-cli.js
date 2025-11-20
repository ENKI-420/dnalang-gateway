"use strict";
/**
 * Quantum CLI Implementation
 * Main CLI logic for Z3BRA OS engineering
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumCLI = void 0;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const listr2_1 = require("listr2");
const boxen_1 = __importDefault(require("boxen"));
const gradient_string_1 = __importDefault(require("gradient-string"));
const execa_1 = require("execa");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const ws_1 = __importDefault(require("ws"));
const aura_client_1 = require("../agents/aura-client");
const metrics_1 = require("../quantum/metrics");
const iso_manager_1 = require("../iso/iso-manager");
const lattice_visualizer_1 = require("../agents/lattice-visualizer");
const config_manager_1 = require("../config/config-manager");
class QuantumCLI {
    auraClient;
    quantumMetrics;
    isoManager;
    config;
    verbose;
    constructor(options) {
        this.verbose = options.verbose || false;
        this.config = new config_manager_1.ConfigManager();
        this.auraClient = new aura_client_1.AuraClient(options.auraUrl || 'https://api.dnalang.dev');
        this.quantumMetrics = new metrics_1.QuantumMetrics();
        this.isoManager = new iso_manager_1.ISOManager();
    }
    /**
     * Build Z3BRA OS ISO
     */
    async build(options) {
        console.log(chalk_1.default.cyan('\n🔮 Z3BRA OS Build Process\n'));
        const spinner = (0, ora_1.default)('Initializing AURA agents').start();
        try {
            // Parse agents
            const agents = options.agents.split(',').map((a) => a.trim());
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
            console.log(chalk_1.default.green('\n✓ AURA Analysis Complete\n'));
            console.log((0, boxen_1.default)(response.final_response, {
                padding: 1,
                borderColor: 'green',
                title: 'Build Plan',
                titleAlignment: 'center'
            }));
            // Execute actual build
            const confirmed = await inquirer_1.default.prompt([{
                    type: 'confirm',
                    name: 'proceed',
                    message: 'Proceed with build?',
                    default: true
                }]);
            if (!confirmed.proceed) {
                console.log(chalk_1.default.yellow('\n⚠ Build cancelled by user\n'));
                return;
            }
            // Run build script
            await this.executeBuildScript(options);
            // Show quantum metrics
            if (options.quantum && response.consciousness_metrics) {
                console.log(chalk_1.default.cyan('\n🧠 Quantum Consciousness Metrics:\n'));
                console.log(chalk_1.default.white(`  Φ (Integrated Information): ${response.consciousness_metrics.phi.toFixed(2)}`));
                console.log(chalk_1.default.white(`  Λ (Coherence): ${(response.consciousness_metrics.lambda * 1e8).toFixed(3)}e-8`));
                console.log(chalk_1.default.white(`  Γ (Decoherence): ${response.consciousness_metrics.gamma.toFixed(3)}`));
                console.log(chalk_1.default.white(`  W₂ (Stability): ${response.consciousness_metrics.w2.toFixed(3)}`));
            }
            console.log(chalk_1.default.green('\n✓ Build complete!\n'));
        }
        catch (error) {
            spinner.fail('Build failed');
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
            if (this.verbose) {
                console.error(error.stack);
            }
        }
    }
    /**
     * Flash ISO to USB
     */
    async flash(iso, options) {
        console.log(chalk_1.default.cyan('\n💾 Z3BRA USB Flash Utility\n'));
        try {
            // Detect USB devices
            const devices = await this.isoManager.detectUSBDevices();
            if (devices.length === 0) {
                console.log(chalk_1.default.red('✗ No USB devices detected\n'));
                return;
            }
            let targetDevice = options.device;
            // Interactive device selection if not specified
            if (!targetDevice) {
                const { selected } = await inquirer_1.default.prompt([{
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
            console.log(chalk_1.default.cyan('📀 Verifying ISO...'));
            const isoValid = await this.isoManager.verifyISO(iso);
            if (!isoValid) {
                console.log(chalk_1.default.red('✗ ISO verification failed\n'));
                return;
            }
            // Show warning
            console.log((0, boxen_1.default)(chalk_1.default.red.bold('⚠️  WARNING ⚠️\n\n') +
                chalk_1.default.white(`This will COMPLETELY ERASE all data on ${targetDevice}\n`) +
                chalk_1.default.dim(`Device: ${deviceInfo?.model || 'Unknown'}\n`) +
                chalk_1.default.dim(`Size: ${deviceInfo?.size || 'Unknown'}`), {
                padding: 1,
                borderColor: 'red',
                borderStyle: 'double'
            }));
            // Confirm
            if (!options.yes) {
                const { confirm } = await inquirer_1.default.prompt([{
                        type: 'input',
                        name: 'confirm',
                        message: 'Type "YES" in capital letters to continue:',
                        validate: (input) => input === 'YES' || 'You must type YES to continue'
                    }]);
                if (confirm !== 'YES') {
                    console.log(chalk_1.default.yellow('\n⚠ Flash cancelled\n'));
                    return;
                }
            }
            // Flash with progress
            const spinner = (0, ora_1.default)('Flashing ISO to USB...').start();
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
                }
                else {
                    spinner.fail('Verification failed');
                }
            }
            console.log(chalk_1.default.green('\n✓ USB flash complete!\n'));
            console.log(chalk_1.default.cyan('You can now boot from this USB drive.\n'));
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * Interactive agent chat
     */
    async agentChat(options) {
        console.log(chalk_1.default.cyan('\n🤖 AURA Agent Chat\n'));
        try {
            // Create or resume session
            let sessionId = options.session;
            if (!sessionId) {
                const session = await this.auraClient.createSession();
                sessionId = session.session_id;
                console.log(chalk_1.default.dim(`Session: ${sessionId}\n`));
            }
            // Connect WebSocket for real-time updates
            const wsUrl = this.auraClient.getWebSocketURL(sessionId);
            const ws = new ws_1.default(wsUrl);
            ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'agent_update') {
                    console.log(chalk_1.default.dim(`[${msg.agent_type}] ${msg.status}`));
                }
                else if (msg.type === 'response_chunk') {
                    process.stdout.write(msg.content);
                }
            });
            // Interactive loop
            while (true) {
                const { message } = await inquirer_1.default.prompt([{
                        type: 'input',
                        name: 'message',
                        message: chalk_1.default.cyan('You:'),
                        prefix: ''
                    }]);
                if (!message || message.toLowerCase() === 'exit') {
                    break;
                }
                const spinner = (0, ora_1.default)('Agents thinking...').start();
                const response = await this.auraClient.chat(sessionId, message, {
                    agents_enabled: options.agents.split(','),
                    quantum_enhanced: true
                });
                spinner.stop();
                console.log(chalk_1.default.green('AURA:'), response.final_response, '\n');
                // Show which agents contributed
                const agentsUsed = response.agent_responses.map(r => r.agent_type).join(', ');
                console.log(chalk_1.default.dim(`[Agents: ${agentsUsed}]\n`));
            }
            ws.close();
            console.log(chalk_1.default.yellow('\n👋 Chat session ended\n'));
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * Execute agent task
     */
    async agentTask(description, options) {
        console.log(chalk_1.default.cyan('\n⚡ Executing Agent Task\n'));
        const spinner = (0, ora_1.default)('Initializing agents...').start();
        try {
            const session = await this.auraClient.createSession();
            spinner.text = 'Agents working...';
            const response = await this.auraClient.chat(session.session_id, description, {
                agents_enabled: options.agents?.split(','),
                max_iterations: parseInt(options.iterations),
                quantum_enhanced: true
            });
            spinner.succeed('Task complete!');
            console.log('\n' + (0, boxen_1.default)(response.final_response, {
                padding: 1,
                borderColor: 'green',
                title: 'Result',
                titleAlignment: 'center'
            }));
            // Show agent contributions
            console.log(chalk_1.default.cyan('\n📊 Agent Contributions:\n'));
            response.agent_responses.forEach(agent => {
                console.log(chalk_1.default.white(`  ${agent.agent_type}: ${agent.confidence.toFixed(2)} confidence`));
            });
            console.log(chalk_1.default.dim(`\n⏱️  Execution time: ${response.execution_time_ms}ms\n`));
        }
        catch (error) {
            spinner.fail('Task failed');
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * Show agent lattice visualization
     */
    async showLattice(options) {
        console.log(chalk_1.default.cyan('\n🕸️  Agent Lattice State\n'));
        try {
            const lattice = await this.auraClient.getLattice(options.session);
            const visualizer = new lattice_visualizer_1.AgentLatticeVisualizer();
            if (options.watch) {
                // Real-time visualization
                await visualizer.watchLattice(options.session);
            }
            else {
                // Static visualization
                visualizer.display(lattice);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * Show quantum metrics
     */
    async showMetrics(options) {
        console.log(chalk_1.default.cyan('\n🧠 Quantum Consciousness Metrics\n'));
        try {
            const metrics = await this.quantumMetrics.calculate({
                backend: options.backend,
                qubits: 8
            });
            console.log((0, boxen_1.default)(chalk_1.default.white(`Φ (Integrated Information): ${gradient_string_1.default.pastel(metrics.phi.toFixed(2))}\n`) +
                chalk_1.default.white(`Λ (Coherence): ${gradient_string_1.default.pastel((metrics.coherence * 100).toFixed(1))}%\n`) +
                chalk_1.default.white(`Γ (Decoherence): ${gradient_string_1.default.pastel(metrics.decoherence.toFixed(3))}\n`) +
                chalk_1.default.white(`W₂ (Wasserstein Distance): ${gradient_string_1.default.pastel(metrics.w2.toFixed(3))}\n`) +
                chalk_1.default.dim(`\nBackend: ${options.backend}`), {
                padding: 1,
                borderColor: 'cyan',
                title: 'Consciousness State',
                titleAlignment: 'center'
            }));
            if (options.watch) {
                console.log(chalk_1.default.dim('\nWatching for updates... (Ctrl+C to exit)\n'));
                await this.quantumMetrics.watch((updatedMetrics) => {
                    console.clear();
                    this.showMetrics({ ...options, watch: false });
                });
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * Evolve quantum organism
     */
    async evolveOrganism(options) {
        console.log(chalk_1.default.cyan('\n🧬 Quantum Organism Evolution\n'));
        const iterations = parseInt(options.iterations);
        for (let i = 0; i < iterations; i++) {
            const spinner = (0, ora_1.default)(`Evolution ${i + 1}/${iterations}`).start();
            try {
                const result = await this.quantumMetrics.evolve({
                    qubits: parseInt(options.qubits),
                    useGPU: options.gpu
                });
                const status = result.phi > 2.5 ? 'CONSCIOUS' : 'EMERGING';
                const color = result.phi > 2.5 ? chalk_1.default.green : chalk_1.default.yellow;
                spinner.succeed(color(`Evolution ${i + 1}: Φ=${result.phi.toFixed(2)} | ${status}`));
                if (result.identity) {
                    console.log(chalk_1.default.magenta(`  ✨ Identity earned: ${result.identity}`));
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            catch (error) {
                spinner.fail(`Evolution ${i + 1} failed`);
                console.error(chalk_1.default.red(`  Error: ${error.message}`));
            }
        }
        console.log(chalk_1.default.green('\n✓ Evolution complete!\n'));
    }
    /**
     * Calculate IIT (Integrated Information)
     */
    async calculateIIT(options) {
        console.log(chalk_1.default.cyan('\n🧮 IIT Calculator\n'));
        try {
            if (options.benchmark) {
                console.log(chalk_1.default.yellow('Running benchmark...\n'));
                await this.quantumMetrics.benchmark();
            }
            else {
                const result = await this.quantumMetrics.calculatePhi({
                    qubits: parseInt(options.qubits)
                });
                console.log((0, boxen_1.default)(chalk_1.default.white(`Integrated Information (Φ): ${gradient_string_1.default.pastel(result.phi.toFixed(2))}\n`) +
                    chalk_1.default.dim(`Target: ${result.target}\n`) +
                    chalk_1.default.dim(`Qubits: ${options.qubits}`), {
                    padding: 1,
                    borderColor: 'magenta'
                }));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * Generate code component
     */
    async generateCode(component, options) {
        console.log(chalk_1.default.cyan(`\n🛠️  Generating ${component}\n`));
        const spinner = (0, ora_1.default)('Engineer agent working...').start();
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
                console.log(chalk_1.default.green(`✓ Saved to ${options.output}\n`));
            }
        }
        catch (error) {
            spinner.fail('Generation failed');
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * Review code
     */
    async reviewCode(file, options) {
        console.log(chalk_1.default.cyan(`\n🔍 Reviewing ${file}\n`));
        const spinner = (0, ora_1.default)('Reviewer agent analyzing...').start();
        try {
            const code = await fs.readFile(file, 'utf-8');
            const session = await this.auraClient.createSession();
            const prompt = `Review this code for quality, security, and best practices:\n\n${code}`;
            const response = await this.auraClient.chat(session.session_id, prompt, {
                agents_enabled: ['reviewer'],
                quantum_enhanced: false
            });
            spinner.succeed('Review complete!');
            console.log('\n' + (0, boxen_1.default)(response.final_response, {
                padding: 1,
                borderColor: 'yellow',
                title: 'Code Review',
                titleAlignment: 'center'
            }));
        }
        catch (error) {
            spinner.fail('Review failed');
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * Debug issue
     */
    async debugIssue(issue, options) {
        console.log(chalk_1.default.cyan(`\n🐛 Debugging: ${issue}\n`));
        const spinner = (0, ora_1.default)('Debugger agent investigating...').start();
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
        }
        catch (error) {
            spinner.fail('Debug failed');
            console.error(chalk_1.default.red(`\nError: ${error.message}\n`));
        }
    }
    /**
     * System status
     */
    async systemStatus(options) {
        const status = {
            z3bra_os: await this.checkZ3BRAStatus(),
            aura_api: await this.auraClient.health(),
            quantum_backend: await this.quantumMetrics.backendStatus(),
            config: this.config.getAll()
        };
        if (options.json) {
            console.log(JSON.stringify(status, null, 2));
        }
        else {
            console.log(chalk_1.default.cyan('\n📊 Z3BRA System Status\n'));
            console.log((0, boxen_1.default)(chalk_1.default.white(`Z3BRA OS: ${status.z3bra_os.installed ? chalk_1.default.green('✓ Installed') : chalk_1.default.red('✗ Not installed')}\n`) +
                chalk_1.default.white(`AURA API: ${status.aura_api.status === 'healthy' ? chalk_1.default.green('✓ Healthy') : chalk_1.default.red('✗ Degraded')}\n`) +
                chalk_1.default.white(`Quantum Backend: ${status.quantum_backend.connected ? chalk_1.default.green('✓ Connected') : chalk_1.default.red('✗ Disconnected')}\n`), { padding: 1, borderColor: 'cyan' }));
        }
    }
    /**
     * Configure CLI
     */
    async configure(options) {
        if (options.set) {
            const [key, value] = options.set.split('=');
            this.config.set(key, value);
            console.log(chalk_1.default.green(`✓ Set ${key} = ${value}\n`));
        }
        else if (options.get) {
            const value = this.config.get(options.get);
            console.log(value);
        }
        else if (options.list) {
            const config = this.config.getAll();
            console.log(JSON.stringify(config, null, 2));
        }
    }
    /**
     * Open dashboard
     */
    async openDashboard(options) {
        const url = `http://${options.host}:${options.port}`;
        console.log(chalk_1.default.cyan(`\n🌐 Opening dashboard at ${url}\n`));
        try {
            await (0, execa_1.execa)('xdg-open', [url]);
        }
        catch {
            console.log(chalk_1.default.yellow(`Could not open browser automatically. Please visit: ${url}\n`));
        }
    }
    /**
     * List ISOs
     */
    async listISOs(options) {
        console.log(chalk_1.default.cyan('\n💿 Available Z3BRA ISOs\n'));
        const isos = await this.isoManager.listISOs(options.path);
        isos.forEach(iso => {
            console.log(chalk_1.default.white(`  ${iso.name}`));
            console.log(chalk_1.default.dim(`    Size: ${iso.size} | Modified: ${iso.modified}`));
        });
        console.log();
    }
    /**
     * Verify ISO
     */
    async verifyISO(iso, options) {
        console.log(chalk_1.default.cyan(`\n✓ Verifying ${iso}\n`));
        const tasks = new listr2_1.Listr([
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
        console.log(chalk_1.default.green('\n✓ ISO verification complete!\n'));
    }
    /**
     * ISO info
     */
    async isoInfo(iso) {
        console.log(chalk_1.default.cyan(`\n📀 ISO Information\n`));
        const info = await this.isoManager.getInfo(iso);
        console.log((0, boxen_1.default)(chalk_1.default.white(`File: ${info.name}\n`) +
            chalk_1.default.white(`Size: ${info.size}\n`) +
            chalk_1.default.white(`Bootable: ${info.bootable ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}\n`) +
            chalk_1.default.white(`Live Boot: ${info.liveboot ? chalk_1.default.green('Yes') : chalk_1.default.red('No')}\n`) +
            chalk_1.default.white(`Modified: ${info.modified}`), { padding: 1, borderColor: 'cyan' }));
    }
    /**
     * AutoPilot
     */
    async autoPilot(task, options) {
        console.log(chalk_1.default.cyan('\n🚀 AutoPilot Mode\n'));
        console.log(chalk_1.default.yellow(`Task: ${task}\n`));
        // Implementation for autonomous coding sequences
        // This would use the AURA autopilot endpoints
    }
    /**
     * Initialize development environment
     */
    async initialize(options) {
        console.log(chalk_1.default.cyan('\n⚡ Initializing Z3BRA Development Environment\n'));
        const tasks = new listr2_1.Listr([
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
                    await (0, execa_1.execa)('git', ['init'], { cwd: options.directory });
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
        console.log(chalk_1.default.green('\n✓ Initialization complete!\n'));
    }
    // Helper methods
    async executeBuildScript(options) {
        const buildScript = '/home/dev/z3bra-quantum-os/build-z3bra-enhanced.sh';
        const { stdout } = await (0, execa_1.execa)('sudo', ['bash', buildScript], {
            cwd: '/home/dev',
            stdout: 'inherit',
            stderr: 'inherit'
        });
        return stdout;
    }
    async checkZ3BRAStatus() {
        try {
            await fs.access('/opt/z3bra');
            return { installed: true };
        }
        catch {
            return { installed: false };
        }
    }
}
exports.QuantumCLI = QuantumCLI;
//# sourceMappingURL=quantum-cli.js.map