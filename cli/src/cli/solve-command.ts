/**
 * Solve Command - Interactive Problem Solving
 * Uses knowledge base and command generation to solve development problems
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import boxen from 'boxen';
import { ProblemSolver, Problem, Solution } from '../knowledge/problem-solver';
import { CommandGenerator, CommandSequence } from '../commands/command-generator';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SolveCommand {
  private problemSolver: ProblemSolver;
  private commandGenerator: CommandGenerator;

  constructor(auraURL: string = 'https://api.dnalang.dev') {
    this.problemSolver = new ProblemSolver(auraURL);
    this.commandGenerator = new CommandGenerator();
  }

  /**
   * Interactive problem solving session
   */
  async solve(options: any = {}): Promise<void> {
    console.log(chalk.cyan('\n🔮 AURA Problem Solver\n'));

    // Get problem description
    const { description } = await inquirer.prompt([{
      type: 'input',
      name: 'description',
      message: 'Describe your problem:',
      validate: (input) => input.length > 3 || 'Please provide more details'
    }]);

    const spinner = ora('Analyzing problem...').start();

    try {
      // Classify and solve
      const domain = this.classifyDomain(description);
      spinner.text = `Searching ${domain} knowledge base...`;

      const problem: Problem = {
        description,
        domain,
        context: await this.gatherContext()
      };

      const solution = await this.problemSolver.solve(problem);

      spinner.succeed('Solution found!');

      // Display solution
      this.displaySolution(solution);

      // Generate commands
      if (solution.commands.length > 0 || solution.steps.length > 0) {
        const commandSeq = this.commandGenerator.generateCommands(description);

        console.log(chalk.cyan('\n⚡ Terminal Commands:\n'));
        console.log('─'.repeat(80));

        commandSeq.commands.forEach((cmd, idx) => {
          const safetyIcon = cmd.safe ? chalk.green('✓') : chalk.yellow('⚠');
          const sudoIcon = cmd.requires_sudo ? chalk.red('[sudo]') : '';

          console.log(chalk.white(`\n${idx + 1}. ${cmd.description}`));
          console.log(chalk.dim(`   ${safetyIcon} ${sudoIcon} ${cmd.command}`));

          if (cmd.expected_output) {
            console.log(chalk.dim(`   Expected: ${cmd.expected_output}`));
          }
        });

        console.log('\n' + '─'.repeat(80) + '\n');

        // Offer to execute commands
        if (!options.dryRun) {
          const { execute } = await inquirer.prompt([{
            type: 'confirm',
            name: 'execute',
            message: 'Execute these commands?',
            default: false
          }]);

          if (execute) {
            await this.executeCommandSequence(commandSeq);
          }
        }

        // Show references
        if (solution.references.length > 0) {
          console.log(chalk.cyan('\n📚 References:\n'));
          solution.references.forEach(ref => {
            console.log(chalk.dim(`  • ${ref}`));
          });
          console.log();
        }
      } else {
        console.log(chalk.yellow('\n⚠ No automated commands available for this problem.'));
        console.log(chalk.dim('Consider using: z3bra agent chat\n'));
      }

    } catch (error: any) {
      spinner.fail('Failed to solve problem');
      console.error(chalk.red(`\nError: ${error.message}\n`));
    }
  }

  /**
   * Display solution in formatted output
   */
  private displaySolution(solution: Solution): void {
    const confidenceColor = solution.confidence > 0.7 ? chalk.green :
                           solution.confidence > 0.4 ? chalk.yellow : chalk.red;

    console.log(boxen(
      chalk.white.bold('Solution\n\n') +
      chalk.white(solution.explanation) + '\n\n' +
      confidenceColor(`Confidence: ${(solution.confidence * 100).toFixed(0)}%`),
      {
        padding: 1,
        margin: 1,
        borderColor: 'cyan',
        borderStyle: 'round'
      }
    ));

    if (solution.steps.length > 0) {
      console.log(chalk.cyan(`\nSolution consists of ${solution.steps.length} steps:\n`));

      solution.steps.forEach((step, idx) => {
        console.log(chalk.white(`${idx + 1}. ${step.description}`));
        if (step.command) {
          console.log(chalk.dim(`   Command: ${step.command}`));
        }
      });
    }
  }

  /**
   * Execute command sequence with user confirmation
   */
  private async executeCommandSequence(sequence: CommandSequence): Promise<void> {
    console.log(chalk.cyan('\n🚀 Executing commands...\n'));

    for (let i = 0; i < sequence.commands.length; i++) {
      const cmd = sequence.commands[i];
      const spinner = ora(`${cmd.description}`).start();

      try {
        // Validate command safety
        const validation = this.commandGenerator.validateCommand(cmd);

        if (!validation.safe) {
          spinner.warn(`Skipped: ${validation.warnings.join(', ')}`);

          const { proceed } = await inquirer.prompt([{
            type: 'confirm',
            name: 'proceed',
            message: chalk.yellow(`⚠ Warning: ${validation.warnings[0]}\n  Continue anyway?`),
            default: false
          }]);

          if (!proceed) {
            continue;
          }
        }

        // Execute command
        const { stdout, stderr } = await execAsync(cmd.command);

        spinner.succeed(cmd.description);

        if (stdout && stdout.trim()) {
          console.log(chalk.dim(`   ${stdout.trim().split('\n').slice(0, 3).join('\n   ')}`));
        }

        // Check expected output
        if (cmd.expected_output && !stdout.includes(cmd.expected_output)) {
          console.log(chalk.yellow(`   ⚠ Output doesn't match expected: ${cmd.expected_output}`));
        }

      } catch (error: any) {
        spinner.fail(`Failed: ${error.message}`);

        // Try error handling if available
        if (cmd.error_handling) {
          console.log(chalk.yellow(`   Attempting recovery: ${cmd.error_handling}`));
          try {
            await execAsync(cmd.error_handling);
            console.log(chalk.green('   ✓ Recovery successful'));
          } catch {
            console.log(chalk.red('   ✗ Recovery failed'));
          }
        }

        const { continueOnError } = await inquirer.prompt([{
          type: 'confirm',
          name: 'continueOnError',
          message: 'Continue with remaining commands?',
          default: true
        }]);

        if (!continueOnError) {
          break;
        }
      }

      // Small delay between commands
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(chalk.green('\n✓ Command execution complete!\n'));
  }

  /**
   * Gather context about current environment
   */
  private async gatherContext(): Promise<any> {
    const context: any = {
      environment: {},
      files: [],
      logs: []
    };

    try {
      // Check for package.json
      const { stdout: packageJson } = await execAsync('cat package.json 2>/dev/null || echo "{}"');
      const pkg = JSON.parse(packageJson);
      context.project_type = pkg.scripts ? Object.keys(pkg.scripts).join(',') : 'unknown';
      context.dependencies = pkg.dependencies ? Object.keys(pkg.dependencies) : [];

      // Get git info
      try {
        const { stdout: gitBranch } = await execAsync('git branch --show-current 2>/dev/null');
        context.git_branch = gitBranch.trim();
      } catch {}

      // Get Node version
      try {
        const { stdout: nodeVersion } = await execAsync('node --version');
        context.node_version = nodeVersion.trim();
      } catch {}

      // Check for Docker
      try {
        const { stdout: dockerVersion } = await execAsync('docker --version 2>/dev/null');
        context.has_docker = true;
      } catch {
        context.has_docker = false;
      }

    } catch (error) {
      // Context gathering failed, continue with empty context
    }

    return context;
  }

  /**
   * Classify problem domain from description
   */
  private classifyDomain(description: string): string {
    const keywords = {
      deployment: ['deploy', 'production', 'release', 'publish'],
      build: ['build', 'compile', 'bundle'],
      testing: ['test', 'jest', 'spec'],
      debugging: ['error', 'bug', 'fail', 'crash'],
      performance: ['slow', 'optimize', 'performance'],
      security: ['security', 'vulnerability', 'auth'],
      database: ['database', 'sql', 'migration'],
      quantum: ['quantum', 'phi', 'consciousness']
    };

    const lowerDesc = description.toLowerCase();

    for (const [domain, words] of Object.entries(keywords)) {
      if (words.some(word => lowerDesc.includes(word))) {
        return domain;
      }
    }

    return 'general';
  }

  /**
   * Export solution to file
   */
  async exportSolution(solution: Solution, filepath: string): Promise<void> {
    const content = `# Problem Solution

${solution.explanation}

## Steps

${solution.steps.map((s, i) => `${i + 1}. ${s.description}`).join('\n')}

## Commands

\`\`\`bash
${solution.commands.join('\n')}
\`\`\`

## References

${solution.references.map(r => `- ${r}`).join('\n')}

---
Generated by Z3BRA Quantum CLI
Confidence: ${(solution.confidence * 100).toFixed(0)}%
`;

    const fs = require('fs').promises;
    await fs.writeFile(filepath, content, 'utf-8');

    console.log(chalk.green(`\n✓ Solution exported to ${filepath}\n`));
  }
}
