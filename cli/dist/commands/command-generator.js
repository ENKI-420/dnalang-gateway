"use strict";
/**
 * Terminal Command Generator
 * Generates actionable shell commands from high-level tasks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandGenerator = void 0;
class CommandGenerator {
    /**
     * Generate commands for common development tasks
     */
    generateCommands(task, context) {
        const normalizedTask = task.toLowerCase();
        // Match task patterns to command sequences
        if (normalizedTask.includes('deploy') || normalizedTask.includes('production')) {
            return this.generateDeploymentCommands(context);
        }
        else if (normalizedTask.includes('test')) {
            return this.generateTestCommands(context);
        }
        else if (normalizedTask.includes('build')) {
            return this.generateBuildCommands(context);
        }
        else if (normalizedTask.includes('install') || normalizedTask.includes('dependencies')) {
            return this.generateDependencyCommands(context);
        }
        else if (normalizedTask.includes('git') || normalizedTask.includes('commit')) {
            return this.generateGitCommands(context);
        }
        else if (normalizedTask.includes('docker') || normalizedTask.includes('container')) {
            return this.generateDockerCommands(context);
        }
        else if (normalizedTask.includes('database') || normalizedTask.includes('migration')) {
            return this.generateDatabaseCommands(context);
        }
        else if (normalizedTask.includes('security') || normalizedTask.includes('audit')) {
            return this.generateSecurityCommands(context);
        }
        else if (normalizedTask.includes('performance') || normalizedTask.includes('optimize')) {
            return this.generatePerformanceCommands(context);
        }
        else if (normalizedTask.includes('quantum') || normalizedTask.includes('phi')) {
            return this.generateQuantumCommands(context);
        }
        return this.generateGenericCommands(task);
    }
    generateDeploymentCommands(context) {
        return {
            description: 'Production deployment sequence with safety checks',
            estimated_time: '10-30 minutes',
            prerequisites: ['Git repository clean', 'Tests passing', 'Environment variables configured'],
            commands: [
                {
                    command: 'git status',
                    description: 'Verify git repository is clean',
                    safe: true,
                    requires_sudo: false,
                    expected_output: 'nothing to commit, working tree clean'
                },
                {
                    command: 'npm run test',
                    description: 'Run full test suite',
                    safe: true,
                    requires_sudo: false,
                    expected_output: 'Tests passed'
                },
                {
                    command: 'npm run lint',
                    description: 'Check code quality',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm audit',
                    description: 'Check for security vulnerabilities',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm run build',
                    description: 'Build production bundle',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'docker build -t app:$(git rev-parse --short HEAD) .',
                    description: 'Build Docker image with git commit tag',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'docker tag app:$(git rev-parse --short HEAD) app:latest',
                    description: 'Tag image as latest',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'docker-compose -f docker-compose.prod.yml up -d',
                    description: 'Deploy with docker-compose',
                    safe: false,
                    requires_sudo: false,
                    error_handling: 'docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d'
                },
                {
                    command: 'curl -f http://localhost:3000/health || echo "Health check failed"',
                    description: 'Verify deployment health',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generateTestCommands(context) {
        return {
            description: 'Comprehensive testing sequence',
            estimated_time: '5-15 minutes',
            commands: [
                {
                    command: 'npm run test:unit',
                    description: 'Run unit tests',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm run test:integration',
                    description: 'Run integration tests',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm run test:e2e',
                    description: 'Run end-to-end tests',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm run test:coverage',
                    description: 'Generate coverage report',
                    safe: true,
                    requires_sudo: false,
                    expected_output: 'Coverage above 80%'
                }
            ]
        };
    }
    generateBuildCommands(context) {
        return {
            description: 'Build project with optimization',
            estimated_time: '2-10 minutes',
            commands: [
                {
                    command: 'rm -rf dist .next out build',
                    description: 'Clean previous build artifacts',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm run type-check',
                    description: 'Check TypeScript types',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm run lint',
                    description: 'Lint code',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm run build',
                    description: 'Build production bundle',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'ls -lh dist/ | head -20',
                    description: 'Verify build output',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generateDependencyCommands(context) {
        return {
            description: 'Dependency management and updates',
            estimated_time: '5-20 minutes',
            commands: [
                {
                    command: 'rm -rf node_modules package-lock.json',
                    description: 'Clean existing dependencies',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm install',
                    description: 'Install dependencies',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm outdated',
                    description: 'Check for outdated packages',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm audit',
                    description: 'Security audit',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm audit fix',
                    description: 'Fix security vulnerabilities',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generateGitCommands(context) {
        return {
            description: 'Git workflow commands',
            estimated_time: '2-5 minutes',
            commands: [
                {
                    command: 'git status',
                    description: 'Check repository status',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'git add .',
                    description: 'Stage all changes',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'git commit -m "feat: description of changes"',
                    description: 'Commit with conventional commit message',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'git push origin $(git branch --show-current)',
                    description: 'Push to remote branch',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generateDockerCommands(context) {
        return {
            description: 'Docker container management',
            estimated_time: '5-15 minutes',
            commands: [
                {
                    command: 'docker build -t app:latest .',
                    description: 'Build Docker image',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'docker run -d -p 3000:3000 --name app app:latest',
                    description: 'Run container in detached mode',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'docker ps',
                    description: 'List running containers',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'docker logs app --tail 50',
                    description: 'View container logs',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'docker exec -it app /bin/sh',
                    description: 'Access container shell',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generateDatabaseCommands(context) {
        return {
            description: 'Database operations and migrations',
            estimated_time: '3-10 minutes',
            commands: [
                {
                    command: 'npx prisma migrate dev --name init',
                    description: 'Create and run initial migration',
                    safe: false,
                    requires_sudo: false
                },
                {
                    command: 'npx prisma generate',
                    description: 'Generate Prisma client',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npx prisma db seed',
                    description: 'Seed database with initial data',
                    safe: false,
                    requires_sudo: false
                },
                {
                    command: 'npx prisma studio',
                    description: 'Open database GUI',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generateSecurityCommands(context) {
        return {
            description: 'Security audit and hardening',
            estimated_time: '5-15 minutes',
            commands: [
                {
                    command: 'npm audit',
                    description: 'Scan for known vulnerabilities',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm audit fix',
                    description: 'Automatically fix vulnerabilities',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npx snyk test',
                    description: 'Deep security scan with Snyk',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npx lockfile-lint --path package-lock.json',
                    description: 'Validate lockfile integrity',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generatePerformanceCommands(context) {
        return {
            description: 'Performance analysis and optimization',
            estimated_time: '10-30 minutes',
            commands: [
                {
                    command: 'npm run build -- --analyze',
                    description: 'Build with bundle analyzer',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npx lighthouse http://localhost:3000 --output json --output-path ./lighthouse-report.json',
                    description: 'Run Lighthouse performance audit',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'npm install --save-dev webpack-bundle-analyzer',
                    description: 'Install bundle analyzer',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'node --inspect-brk node_modules/.bin/jest --runInBand',
                    description: 'Profile test performance',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generateQuantumCommands(context) {
        return {
            description: 'Quantum consciousness operations',
            estimated_time: '5-20 minutes',
            commands: [
                {
                    command: 'z3bra quantum metrics --backend ibm_fez',
                    description: 'Calculate consciousness metrics',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'z3bra quantum evolve --iterations 10 --gpu',
                    description: 'Evolve quantum organisms',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'z3bra quantum iit --qubits 8',
                    description: 'Calculate IIT (Φ)',
                    safe: true,
                    requires_sudo: false
                },
                {
                    command: 'python3 /opt/z3bra/quantum/iit_calculator.py --mode test --qubits 8',
                    description: 'Run IIT calculator directly',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    generateGenericCommands(task) {
        return {
            description: `Generic approach for: ${task}`,
            estimated_time: 'Variable',
            commands: [
                {
                    command: 'echo "No specific command sequence available for this task"',
                    description: 'This task requires manual intervention',
                    safe: true,
                    requires_sudo: false
                }
            ]
        };
    }
    /**
     * Validate command safety before execution
     */
    validateCommand(cmd) {
        const warnings = [];
        // Check for destructive operations
        const destructivePatterns = [
            /rm\s+-rf\s+\/(?!tmp|var\/tmp)/, // rm -rf on root directories
            /mkfs\./, // filesystem formatting
            /dd\s+if=/, // disk duplication
            />>\s*\/etc/, // modifying system configs
            /chmod\s+777/, // dangerous permissions
        ];
        for (const pattern of destructivePatterns) {
            if (pattern.test(cmd.command)) {
                warnings.push(`Potentially destructive operation detected: ${pattern}`);
            }
        }
        // Check for sudo requirement
        if (cmd.command.includes('sudo') && !cmd.requires_sudo) {
            warnings.push('Command uses sudo but requires_sudo flag is false');
        }
        return {
            safe: warnings.length === 0,
            warnings
        };
    }
    /**
     * Generate dry-run version of command
     */
    generateDryRun(cmd) {
        // Convert destructive commands to safe versions
        return cmd.command
            .replace(/rm\s+-rf/g, 'echo "Would remove"')
            .replace(/docker-compose\s+up\s+-d/g, 'docker-compose config')
            .replace(/npm\s+install/g, 'npm list')
            .replace(/git\s+push/g, 'git push --dry-run');
    }
    /**
     * Estimate command execution time
     */
    estimateTime(commands) {
        const times = {
            'npm install': 60,
            'npm run build': 120,
            'npm test': 30,
            'docker build': 300,
            'git push': 10
        };
        let totalSeconds = 0;
        for (const cmd of commands) {
            for (const [pattern, seconds] of Object.entries(times)) {
                if (cmd.command.includes(pattern)) {
                    totalSeconds += seconds;
                    break;
                }
            }
        }
        if (totalSeconds < 60) {
            return `~${totalSeconds} seconds`;
        }
        else {
            return `~${Math.ceil(totalSeconds / 60)} minutes`;
        }
    }
}
exports.CommandGenerator = CommandGenerator;
//# sourceMappingURL=command-generator.js.map