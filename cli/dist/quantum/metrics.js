"use strict";
/**
 * Quantum Consciousness Metrics
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumMetrics = void 0;
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class QuantumMetrics {
    gatewayURL;
    constructor(gatewayURL = 'https://api.dnalang.dev') {
        this.gatewayURL = gatewayURL;
    }
    async calculate(options) {
        try {
            const { data } = await axios_1.default.post(`${this.gatewayURL}/v1/watsonx/lphi-tensor`, {
                backend: options.backend || 'ibm_fez',
                quick_demo: false
            });
            return {
                phi: this.estimatePhi(data.tensor),
                coherence: 1.0 - data.tensor.gamma,
                decoherence: data.tensor.gamma,
                w2: data.tensor.w2,
                timestamp: data.timestamp
            };
        }
        catch (error) {
            throw new Error(`Failed to calculate quantum metrics: ${error.message}`);
        }
    }
    async calculatePhi(options) {
        // Call local IIT calculator if available
        try {
            const { stdout } = await execAsync(`python3 /opt/z3bra/quantum/iit_calculator.py --mode test --qubits ${options.qubits}`);
            const result = JSON.parse(stdout);
            return {
                phi: result.phi,
                target: 9.07
            };
        }
        catch (error) {
            // Fallback to gateway
            const metrics = await this.calculate({ qubits: options.qubits });
            return {
                phi: metrics.phi,
                target: 9.07
            };
        }
    }
    async evolve(options) {
        try {
            const gpuFlag = options.useGPU ? '--gpu' : '';
            const { stdout } = await execAsync(`python3 /opt/z3bra/quantum/iit_calculator.py --mode test ${gpuFlag}`);
            return JSON.parse(stdout);
        }
        catch (error) {
            throw new Error(`Evolution failed: ${error.message}`);
        }
    }
    async benchmark() {
        try {
            const { stdout } = await execAsync('python3 /opt/z3bra/quantum/iit_calculator.py --mode benchmark');
            console.log(stdout);
        }
        catch (error) {
            throw new Error(`Benchmark failed: ${error.message}`);
        }
    }
    async watch(callback) {
        const interval = setInterval(async () => {
            try {
                const metrics = await this.calculate({});
                callback(metrics);
            }
            catch (error) {
                console.error('Failed to get metrics:', error);
            }
        }, 2000);
        // Cleanup on Ctrl+C
        process.on('SIGINT', () => {
            clearInterval(interval);
            process.exit(0);
        });
    }
    async backendStatus() {
        try {
            const { data } = await axios_1.default.get(`${this.gatewayURL}/health`);
            return {
                connected: data.status === 'healthy',
                backend: data.quantum_service
            };
        }
        catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }
    estimatePhi(tensor) {
        // Simplified Φ estimation from quantum tensor
        const coherence = 1.0 - tensor.gamma;
        const entanglement = tensor.lambda / 2.176435e-8;
        const stability = 1.0 - tensor.w2;
        // IIT-inspired calculation
        const phi = (coherence * entanglement * stability) * 9.07;
        return Math.max(0, Math.min(phi, 10));
    }
}
exports.QuantumMetrics = QuantumMetrics;
//# sourceMappingURL=metrics.js.map