/**
 * Agent Lattice Visualizer
 */

import chalk from 'chalk';
import boxen from 'boxen';

interface AgentNode {
  agent_id: string;
  agent_type: string;
  status: string;
  vector: {
    weight: number;
    gamma_resistance: number;
    w2_optimization: number;
  };
  position: { x: number; y: number; z: number };
  connections: string[];
}

interface AgentLattice {
  session_id: string;
  nodes: AgentNode[];
  active_agents: number;
  total_interactions: number;
  lattice_coherence: number;
  timestamp: string;
}

export class AgentLatticeVisualizer {
  display(lattice: AgentLattice) {
    console.clear();

    // Header
    console.log(chalk.cyan.bold('\n🕸️  AURA Agent Lattice\n'));
    console.log(chalk.dim(`Session: ${lattice.session_id}`));
    console.log(chalk.dim(`Coherence: ${(lattice.lattice_coherence * 100).toFixed(1)}%`));
    console.log(chalk.dim(`Interactions: ${lattice.total_interactions}\n`));

    // Visualize lattice structure
    this.drawLattice(lattice.nodes);

    // Agent details
    console.log(chalk.cyan('\n📊 Agent States:\n'));

    lattice.nodes.forEach(node => {
      const statusColor = this.getStatusColor(node.status);
      const statusIcon = this.getStatusIcon(node.status);

      console.log(boxen(
        chalk.white.bold(`${node.agent_type.toUpperCase()}\n`) +
        chalk.dim(`ID: ${node.agent_id}\n`) +
        statusColor(`${statusIcon} ${node.status}\n`) +
        chalk.white(`Weight: ${(node.vector.weight * 100).toFixed(0)}%\n`) +
        chalk.white(`Γ-Resistance: ${(node.vector.gamma_resistance * 100).toFixed(0)}%\n`) +
        chalk.white(`W₂-Optimization: ${(node.vector.w2_optimization * 100).toFixed(0)}%\n`) +
        chalk.dim(`Connections: ${node.connections.length}`),
        {
          padding: 0.5,
          margin: 0.5,
          borderColor: this.getAgentColor(node.agent_type),
          borderStyle: 'round'
        }
      ));
    });
  }

  async watchLattice(sessionId: string) {
    // Implementation for real-time watching
    console.log(chalk.yellow('\nReal-time lattice visualization not yet implemented.\n'));
  }

  private drawLattice(nodes: AgentNode[]) {
    // ASCII art representation of lattice
    const width = 60;
    const height = 20;
    const canvas: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '));

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
    console.log(boxen(
      canvas.map(row => row.join('')).join('\n'),
      {
        padding: 1,
        borderColor: 'cyan',
        borderStyle: 'double',
        title: 'Lattice Structure',
        titleAlignment: 'center'
      }
    ));
  }

  private drawLine(
    canvas: string[][],
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    char: string
  ) {
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

      if (x0 === x1 && y0 === y1) break;

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

  private getAgentIcon(type: string): string {
    const icons: Record<string, string> = {
      architect: '🏗',
      engineer: '⚙',
      reviewer: '✅',
      debugger: '🐛',
      research: '🔍',
      synthesizer: '🔮'
    };
    return icons[type] || '●';
  }

  private getAgentColor(type: string): string {
    const colors: Record<string, string> = {
      architect: 'blue',
      engineer: 'green',
      reviewer: 'yellow',
      debugger: 'red',
      research: 'cyan',
      synthesizer: 'magenta'
    };
    return colors[type] || 'white';
  }

  private getStatusColor(status: string): (str: string) => string {
    const colors: Record<string, (str: string) => string> = {
      idle: chalk.dim,
      active: chalk.green,
      working: chalk.yellow,
      completed: chalk.blue,
      error: chalk.red
    };
    return colors[status] || chalk.white;
  }

  private getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      idle: '○',
      active: '◉',
      working: '⚙',
      completed: '✓',
      error: '✗'
    };
    return icons[status] || '?';
  }
}
