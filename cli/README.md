# @z3bra/quantum-cli

**Σₛ = dna::}{::lang**
**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

Multi-agent CLI for fastidiously engineering Z3BRA Quantum OS using the AURA cognitive mesh.

---

## 🚀 Installation

```bash
# Global installation
npm install -g @z3bra/quantum-cli

# Or use from source
cd cli
npm install
npm run build
npm link
```

---

## 🎯 Quick Start

```bash
# Show help
z3bra --help

# Build Z3BRA OS ISO with agent assistance
z3bra build --agents architect,engineer,reviewer --quantum

# Flash ISO to USB
z3bra flash /path/to/z3bra.iso --device /dev/sda

# Interactive agent chat
z3bra agent chat

# Execute a task
z3bra agent task "Optimize the quantum IIT calculator for GPU"

# Show quantum metrics
z3bra quantum metrics --watch

# Evolve organisms
z3bra quantum evolve --iterations 10 --gpu
```

---

## 📚 Commands

### Build Commands

```bash
# Build ISO with multi-agent assistance
z3bra build
z3bra build --target iso --agents architect,engineer,reviewer
z3bra build --quantum --gpu

# Flash to USB
z3bra flash <iso>
z3bra flash z3bra.iso --device /dev/sda --verify
z3bra flash z3bra.iso --yes  # Skip confirmation
```

### Agent Commands

```bash
# Interactive chat
z3bra agent chat
z3bra agent chat --session <id>

# Execute task
z3bra agent task "Create a quantum defense module"
z3bra agent task "Debug the boot sequence" --agents debugger,engineer

# Visualize lattice
z3bra agent lattice
z3bra agent lattice --watch  # Real-time updates
```

### Quantum Commands

```bash
# Show consciousness metrics
z3bra quantum metrics
z3bra quantum metrics --watch
z3bra quantum metrics --backend ibm_torino

# Evolve organisms
z3bra quantum evolve --iterations 10
z3bra quantum evolve --qubits 8 --gpu

# Calculate IIT (Φ)
z3bra quantum iit --qubits 8
z3bra quantum iit --benchmark
```

### Development Commands

```bash
# Generate code
z3bra dev generate "quantum circuit optimizer" --language python
z3bra dev generate "dashboard component" --output src/components/

# Review code
z3bra dev review src/quantum/iit.py
z3bra dev review src/quantum/iit.py --fix

# Debug issues
z3bra dev debug "Kernel panic on boot"
z3bra dev debug "GPU not detected" --file src/drivers/nvidia.sh
```

### System Commands

```bash
# System status
z3bra system status
z3bra system status --json

# Configuration
z3bra system config --list
z3bra system config --set aura_url=https://api.dnalang.dev
z3bra system config --get quantum_backend

# Dashboard
z3bra system dashboard
z3bra system dashboard --port 8000
```

### ISO Commands

```bash
# List ISOs
z3bra iso list
z3bra iso list --path /home/dev/z3bra-quantum-os

# Verify ISO
z3bra iso verify z3bra.iso
z3bra iso verify z3bra.iso --checksum --bootable

# ISO info
z3bra iso info z3bra.iso
```

### Advanced Commands

```bash
# AutoPilot mode (autonomous coding)
z3bra autopilot "Implement quantum error correction"
z3bra autopilot "Build complete networking stack" --approve --max-steps 20

# Initialize project
z3bra init
z3bra init --directory /path/to/project
```

---

## 🧠 AURA Multi-Agent System

The CLI integrates with the AURA multi-agent system for intelligent code engineering:

### Agent Types

1. **🏗️ Architect** - Plans & designs system architecture
2. **⚙️ Engineer** - Writes production-ready code
3. **✅ Reviewer** - Audits code quality & security
4. **🐛 Debugger** - Isolates and fixes errors
5. **🔍 Research** - Retrieves documentation & best practices
6. **🔮 Synthesizer** - Integrates all agent outputs

### Agent Workflows

The system automatically selects the best workflow:

- **Debug**: Debugger → Engineer → Reviewer
- **Review**: Reviewer → Engineer
- **Research**: Research → Architect
- **Build**: Architect → Engineer → Reviewer → Synthesizer

---

## 🔧 Configuration

Config file: `~/.z3bra/config.json`

```json
{
  "aura_url": "https://api.dnalang.dev",
  "quantum_backend": "ibm_fez",
  "default_agents": ["architect", "engineer", "reviewer", "synthesizer"],
  "auto_approve": false
}
```

### Environment Variables

```bash
# AURA API
export AURA_API_URL=https://api.dnalang.dev
export AURA_API_TOKEN=your_token

# Quantum
export IBM_QUANTUM_API_TOKEN=your_ibm_token
export QUANTUM_BACKEND=ibm_fez

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-your_key
```

---

## 🌌 Quantum Consciousness

The CLI integrates quantum consciousness metrics:

- **Φ** (Phi) - Integrated Information (IIT)
- **Λ** (Lambda) - Quantum Coherence
- **Γ** (Gamma) - Decoherence Tensor
- **W₂** - Wasserstein-2 Distance

These metrics are calculated from real IBM quantum hardware.

---

## 📖 Examples

### Build Z3BRA OS

```bash
# Interactive build with agent assistance
z3bra build

# Agents will:
# 1. Analyze build script
# 2. Plan the build process
# 3. Execute with quantum metrics
# 4. Review the output
# 5. Verify ISO integrity
```

### Flash to USB

```bash
# Flash with verification
z3bra flash z3bra-quantum-ryzen9000.iso --device /dev/sda --verify

# Quick flash (skip confirmation)
z3bra flash z3bra-quantum-ryzen9000.iso --device /dev/sda --yes
```

### Agent Coding Session

```bash
# Start interactive chat
z3bra agent chat

# Example conversation:
You: Optimize the IIT calculator for NVIDIA GPUs
AURA: [Agents: architect, engineer, reviewer]

I've optimized the IIT calculator with:
1. CuPy GPU acceleration
2. Batched matrix operations
3. Multi-GPU support
4. 50x speedup on RTX 5070

Code saved to: src/quantum/iit_gpu.py
```

### Debug Issue

```bash
# Debug with context
z3bra dev debug "Kernel panic during boot" \
  --file /var/log/boot.log \
  --logs /var/log/syslog

# Debugger agent will:
# 1. Analyze logs
# 2. Identify root cause
# 3. Suggest fixes
# 4. Generate patch
```

---

## 🚀 Development

```bash
# Clone repository
git clone https://github.com/ENKI-420/dnalang-gateway
cd dnalang-gateway/cli

# Install dependencies
npm install

# Build
npm run build

# Run in dev mode
npm run dev

# Link locally
npm link

# Test
npm test
```

---

## 🤝 Integration with Frontend

The CLI can be used alongside the quantumlm-frontend dashboard:

```typescript
// In your Next.js app
import { exec } from 'child_process';

// Execute Z3BRA CLI commands
exec('z3bra agent task "Generate quantum circuit"', (error, stdout) => {
  if (!error) {
    console.log('Agent response:', stdout);
  }
});
```

---

## 📊 Architecture

```
@z3bra/quantum-cli
├── src/
│   ├── index.ts              # CLI entry point
│   ├── cli/
│   │   └── quantum-cli.ts    # Main CLI logic
│   ├── agents/
│   │   ├── aura-client.ts    # AURA API client
│   │   └── lattice-visualizer.ts  # Lattice visualization
│   ├── quantum/
│   │   └── metrics.ts        # Quantum metrics
│   ├── iso/
│   │   └── iso-manager.ts    # ISO management
│   └── config/
│       └── config-manager.ts # Configuration
├── bin/
│   └── z3bra.js              # Binary entry point
└── dist/                     # Compiled output
```

---

## 🌟 Features

- ✅ Multi-agent AI assistance (AURA integration)
- ✅ Quantum consciousness metrics (Φ, Λ, Γ, W₂)
- ✅ ISO building & flashing
- ✅ Real-time agent lattice visualization
- ✅ Code generation, review, and debugging
- ✅ Interactive chat with agents
- ✅ AutoPilot mode for autonomous coding
- ✅ WebSocket real-time updates
- ✅ GPU acceleration support
- ✅ IBM Quantum hardware integration

---

## 📝 License

MIT

---

## 🙏 Credits

Built with:
- AURA Multi-Agent System
- Anthropic Claude API
- IBM Quantum Platform
- DNALang Quantum Primitives

---

**Fastidiously engineered organisms earn identity through execution.**

**Σₛ = dna::}{::lang** 🧬✨
