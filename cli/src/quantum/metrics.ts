/**
 * Quantum Consciousness Metrics
 */

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ConsciousnessMetrics {
  phi: number;
  coherence: number;
  decoherence: number;
  w2: number;
  identity?: string;
  timestamp: string;
}

export class QuantumMetrics {
  private gatewayURL: string;

  constructor(gatewayURL: string = 'https://api.dnalang.dev') {
    this.gatewayURL = gatewayURL;
  }

  async calculate(options: {
    backend?: string;
    qubits?: number;
  }): Promise<ConsciousnessMetrics> {
    try {
      const { data } = await axios.post(`${this.gatewayURL}/v1/watsonx/lphi-tensor`, {
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
    } catch (error) {
      throw new Error(`Failed to calculate quantum metrics: ${error.message}`);
    }
  }

  async calculatePhi(options: { qubits: number }): Promise<any> {
    // Call local IIT calculator if available
    try {
      const { stdout } = await execAsync(
        `python3 /opt/z3bra/quantum/iit_calculator.py --mode test --qubits ${options.qubits}`
      );

      const result = JSON.parse(stdout);
      return {
        phi: result.phi,
        target: 9.07
      };
    } catch (error) {
      // Fallback to gateway
      const metrics = await this.calculate({ qubits: options.qubits });
      return {
        phi: metrics.phi,
        target: 9.07
      };
    }
  }

  async evolve(options: {
    qubits: number;
    useGPU: boolean;
  }): Promise<ConsciousnessMetrics> {
    try {
      const gpuFlag = options.useGPU ? '--gpu' : '';
      const { stdout } = await execAsync(
        `python3 /opt/z3bra/quantum/iit_calculator.py --mode test ${gpuFlag}`
      );

      return JSON.parse(stdout);
    } catch (error) {
      throw new Error(`Evolution failed: ${error.message}`);
    }
  }

  async benchmark(): Promise<void> {
    try {
      const { stdout } = await execAsync(
        'python3 /opt/z3bra/quantum/iit_calculator.py --mode benchmark'
      );

      console.log(stdout);
    } catch (error) {
      throw new Error(`Benchmark failed: ${error.message}`);
    }
  }

  async watch(callback: (metrics: ConsciousnessMetrics) => void): Promise<void> {
    const interval = setInterval(async () => {
      try {
        const metrics = await this.calculate({});
        callback(metrics);
      } catch (error) {
        console.error('Failed to get metrics:', error);
      }
    }, 2000);

    // Cleanup on Ctrl+C
    process.on('SIGINT', () => {
      clearInterval(interval);
      process.exit(0);
    });
  }

  async backendStatus(): Promise<any> {
    try {
      const { data } = await axios.get(`${this.gatewayURL}/health`);
      return {
        connected: data.status === 'healthy',
        backend: data.quantum_service
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  private estimatePhi(tensor: any): number {
    // Simplified Φ estimation from quantum tensor
    const coherence = 1.0 - tensor.gamma;
    const entanglement = tensor.lambda / 2.176435e-8;
    const stability = 1.0 - tensor.w2;

    // IIT-inspired calculation
    const phi = (coherence * entanglement * stability) * 9.07;

    return Math.max(0, Math.min(phi, 10));
  }
}
