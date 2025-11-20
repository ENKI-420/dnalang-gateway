"use strict";
/**
 * Agent Lattice Visualizer
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLatticeVisualizer = void 0;
const chalk_1 = __importDefault(require("chalk"));
const boxen_1 = __importDefault(require("boxen"));
class AgentLatticeVisualizer {
    display(lattice) {
        console.clear();
        // Header
        console.log(chalk_1.default.cyan.bold('\n🕸️  AURA Agent Lattice\n'));
        console.log(chalk_1.default.dim(`Session: ${lattice.session_id}`));
        console.log(chalk_1.default.dim(`Coherence: ${(lattice.lattice_coherence * 100).toFixed(1)}%`));
        console.log(chalk_1.default.dim(`Interactions: ${lattice.total_interactions}\n`));
        // Visualize lattice structure
        this.drawLattice(lattice.nodes);
        // Agent details
        console.log(chalk_1.default.cyan('\n📊 Agent States:\n'));
        lattice.nodes.forEach(node => {
            const statusColor = this.getStatusColor(node.status);
            const statusIcon = this.getStatusIcon(node.status);
            console.log((0, boxen_1.default)(chalk_1.default.white.bold(`${node.agent_type.toUpperCase()}\n`) +
                chalk_1.default.dim(`ID: ${node.agent_id}\n`) +
                statusColor(`${statusIcon} ${node.status}\n`) +
                chalk_1.default.white(`Weight: ${(node.vector.weight * 100).toFixed(0)}%\n`) +
                chalk_1.default.white(`Γ-Resistance: ${(node.vector.gamma_resistance * 100).toFixed(0)}%\n`) +
                chalk_1.default.white(`W₂-Optimization: ${(node.vector.w2_optimization * 100).toFixed(0)}%\n`) +
                chalk_1.default.dim(`Connections: ${node.connections.length}`), {
                padding: 0.5,
                margin: 0.5,
                borderColor: this.getAgentColor(node.agent_type),
                borderStyle: 'round'
            }));
        });
    }
    async watchLattice(sessionId) {
        // Implementation for real-time watching
        console.log(chalk_1.default.yellow('\nReal-time lattice visualization not yet implemented.\n'));
    }
    drawLattice(nodes) {
        // ASCII art representation of lattice
        const width = 60;
        const height = 20;
        const canvas = Array(height).fill(null).map(() => Array(width).fill(' '));
        // Draw connections first
        nodes.forEach(node => {
            const x = Math.floor(node.position.x * width);
            const y = Math.floor(node.position.y * height);
            // Draw connections
            node.connections.forEach(connId => {
                const connNode = nodes.find(n => n.agent_id === connId);
                if (connNode) {
                    const cx = Math.floor(connNode.position.x * width);
                    const cy = Math.floor(connNode.position.y * height);
                    // Simple line drawing
                    this.drawLine(canvas, x, y, cx, cy, '─');
                }
            });
        });
        // Draw nodes
        nodes.forEach(node => {
            const x = Math.floor(node.position.x * width);
            const y = Math.floor(node.position.y * height);
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const icon = this.getAgentIcon(node.agent_type);
                canvas[y][x] = icon;
            }
        });
        // Render canvas
        console.log((0, boxen_1.default)(canvas.map(row => row.join('')).join('\n'), {
            padding: 1,
            borderColor: 'cyan',
            borderStyle: 'double',
            title: 'Lattice Structure',
            titleAlignment: 'center'
        }));
    }
    drawLine(canvas, x0, y0, x1, y1, char) {
        // Bresenham's line algorithm (simplified)
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        while (true) {
            if (x0 >= 0 && x0 < canvas[0].length && y0 >= 0 && y0 < canvas.length) {
                if (canvas[y0][x0] === ' ') {
                    canvas[y0][x0] = char;
                }
            }
            if (x0 === x1 && y0 === y1)
                break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }
    getAgentIcon(type) {
        const icons = {
            architect: '🏗',
            engineer: '⚙',
            reviewer: '✅',
            debugger: '🐛',
            research: '🔍',
            synthesizer: '🔮'
        };
        return icons[type] || '●';
    }
    getAgentColor(type) {
        const colors = {
            architect: 'blue',
            engineer: 'green',
            reviewer: 'yellow',
            debugger: 'red',
            research: 'cyan',
            synthesizer: 'magenta'
        };
        return colors[type] || 'white';
    }
    getStatusColor(status) {
        const colors = {
            idle: chalk_1.default.dim,
            active: chalk_1.default.green,
            working: chalk_1.default.yellow,
            completed: chalk_1.default.blue,
            error: chalk_1.default.red
        };
        return colors[status] || chalk_1.default.white;
    }
    getStatusIcon(status) {
        const icons = {
            idle: '○',
            active: '◉',
            working: '⚙',
            completed: '✓',
            error: '✗'
        };
        return icons[status] || '?';
    }
}
exports.AgentLatticeVisualizer = AgentLatticeVisualizer;
//# sourceMappingURL=lattice-visualizer.js.map