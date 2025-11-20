"use strict";
/**
 * Problem Solver - Knowledge Base & Solution Generator
 * Provides context-aware problem solving with actionable solutions
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
exports.ProblemSolver = void 0;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs/promises"));
class ProblemSolver {
    knowledgeBase;
    gatewayURL;
    constructor(gatewayURL = 'https://api.dnalang.dev') {
        this.gatewayURL = gatewayURL;
        this.knowledgeBase = this.initializeKnowledgeBase();
    }
    /**
     * Solve a problem and return actionable solutions
     */
    async solve(problem) {
        // 1. Classify the problem domain
        const domain = this.classifyDomain(problem.description);
        // 2. Search local knowledge base
        const localSolution = this.searchKnowledgeBase(problem.description, domain);
        if (localSolution) {
            return localSolution;
        }
        // 3. Query AURA agents for solution
        const auraSolution = await this.queryAuraAgents(problem);
        return auraSolution;
    }
    /**
     * Classify problem domain using NLP
     */
    classifyDomain(description) {
        const keywords = {
            deployment: ['deploy', 'production', 'release', 'publish', 'container', 'docker', 'kubernetes'],
            build: ['build', 'compile', 'bundle', 'webpack', 'vite', 'rollup'],
            testing: ['test', 'jest', 'pytest', 'unittest', 'spec', 'coverage'],
            debugging: ['error', 'bug', 'crash', 'fail', 'exception', 'stack trace'],
            performance: ['slow', 'optimize', 'performance', 'memory', 'cpu', 'latency'],
            security: ['security', 'vulnerability', 'exploit', 'auth', 'permission'],
            database: ['database', 'sql', 'query', 'migration', 'schema'],
            networking: ['network', 'api', 'http', 'request', 'response', 'cors'],
            quantum: ['quantum', 'qubit', 'circuit', 'phi', 'consciousness', 'iit'],
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
     * Search knowledge base for matching solutions
     */
    searchKnowledgeBase(description, domain) {
        const matches = this.knowledgeBase.filter(entry => entry.domain === domain && entry.pattern.test(description));
        if (matches.length === 0) {
            return null;
        }
        // Use best match (first match for now)
        const match = matches[0];
        return {
            steps: match.solutions.steps.map(desc => ({ description: desc })),
            commands: match.solutions.commands,
            explanation: `Solution for ${domain} problem`,
            confidence: 0.85,
            references: match.solutions.references
        };
    }
    /**
     * Query AURA agents for solution
     */
    async queryAuraAgents(problem) {
        try {
            const { data } = await axios_1.default.post(`${this.gatewayURL}/v1/aura/solve`, {
                problem: problem.description,
                domain: problem.domain,
                context: problem.context,
                return_commands: true
            });
            return {
                steps: data.solution_steps || [],
                commands: data.terminal_commands || [],
                explanation: data.explanation || '',
                confidence: data.confidence || 0.5,
                references: data.references || []
            };
        }
        catch (error) {
            // Fallback to general solution
            return this.generateGenericSolution(problem);
        }
    }
    /**
     * Generate generic solution when knowledge base and AURA fail
     */
    generateGenericSolution(problem) {
        return {
            steps: [
                { description: 'Analyze the problem context and gather more information' },
                { description: 'Search documentation for relevant solutions' },
                { description: 'Test potential fixes in a safe environment' },
                { description: 'Apply the solution and verify results' }
            ],
            commands: [],
            explanation: 'Generic problem-solving approach. Consider providing more specific details.',
            confidence: 0.3,
            references: []
        };
    }
    /**
     * Initialize knowledge base with common problem patterns
     */
    initializeKnowledgeBase() {
        return [
            // Deployment problems
            {
                pattern: /not production ready|deploy|production/i,
                domain: 'deployment',
                solutions: {
                    steps: [
                        'Run comprehensive test suite',
                        'Set up CI/CD pipeline',
                        'Configure production environment variables',
                        'Set up monitoring and logging',
                        'Create deployment scripts',
                        'Perform security audit',
                        'Set up SSL certificates',
                        'Configure load balancing',
                        'Test deployment in staging environment',
                        'Deploy to production with rollback plan'
                    ],
                    commands: [
                        'npm run test',
                        'npm run build',
                        'npm run lint',
                        'npm audit',
                        'docker build -t app:latest .',
                        'docker-compose up -d',
                        'kubectl apply -f k8s/',
                        'terraform apply',
                    ],
                    references: [
                        'https://12factor.net/',
                        'https://docs.docker.com/get-started/',
                        'https://kubernetes.io/docs/concepts/'
                    ]
                }
            },
            // Build errors
            {
                pattern: /build fail|compile error|bundle/i,
                domain: 'build',
                solutions: {
                    steps: [
                        'Clear build cache and node_modules',
                        'Reinstall dependencies',
                        'Check for TypeScript errors',
                        'Verify build configuration',
                        'Update outdated packages',
                        'Run build with verbose logging'
                    ],
                    commands: [
                        'rm -rf node_modules dist .next',
                        'npm install',
                        'npm run type-check',
                        'npm run build -- --verbose',
                        'npm outdated',
                        'npm update'
                    ],
                    references: [
                        'https://webpack.js.org/guides/troubleshooting/',
                        'https://vitejs.dev/guide/troubleshooting.html'
                    ]
                }
            },
            // Test failures
            {
                pattern: /test fail|jest|pytest|unit test/i,
                domain: 'testing',
                solutions: {
                    steps: [
                        'Run tests with verbose output',
                        'Check test coverage',
                        'Update snapshots if needed',
                        'Fix failing assertions',
                        'Add missing test cases',
                        'Run tests in watch mode for development'
                    ],
                    commands: [
                        'npm test -- --verbose',
                        'npm run test:coverage',
                        'npm test -- -u',
                        'npm test -- --watch',
                        'npx jest --detectOpenHandles'
                    ],
                    references: [
                        'https://jestjs.io/docs/troubleshooting',
                        'https://testing-library.com/docs/'
                    ]
                }
            },
            // State management issues
            {
                pattern: /state transition|redux|state management/i,
                domain: 'debugging',
                solutions: {
                    steps: [
                        'Install Redux DevTools',
                        'Add state logging middleware',
                        'Trace state changes',
                        'Verify action creators',
                        'Check reducer logic',
                        'Add state validation'
                    ],
                    commands: [
                        'npm install --save-dev @redux-devtools/extension',
                        'npm install redux-logger',
                        'npm install immer',
                        'npm run dev'
                    ],
                    references: [
                        'https://redux.js.org/usage/troubleshooting',
                        'https://redux-toolkit.js.org/tutorials/quick-start'
                    ]
                }
            },
            // Performance optimization
            {
                pattern: /slow|performance|optimize|latency/i,
                domain: 'performance',
                solutions: {
                    steps: [
                        'Run performance profiling',
                        'Analyze bundle size',
                        'Implement code splitting',
                        'Add caching strategies',
                        'Optimize database queries',
                        'Enable compression',
                        'Use CDN for static assets',
                        'Implement lazy loading'
                    ],
                    commands: [
                        'npm run build -- --analyze',
                        'npx lighthouse http://localhost:3000',
                        'npm install --save-dev webpack-bundle-analyzer',
                        'npm install compression',
                        'npm install sharp',
                    ],
                    references: [
                        'https://web.dev/performance-scoring/',
                        'https://nextjs.org/docs/advanced-features/measuring-performance'
                    ]
                }
            },
            // Security issues
            {
                pattern: /security|vulnerability|exploit|xss|sql injection/i,
                domain: 'security',
                solutions: {
                    steps: [
                        'Run security audit',
                        'Update vulnerable dependencies',
                        'Implement input validation',
                        'Add CSRF protection',
                        'Set up Content Security Policy',
                        'Enable HTTPS',
                        'Implement rate limiting',
                        'Add authentication middleware'
                    ],
                    commands: [
                        'npm audit',
                        'npm audit fix',
                        'npm install helmet',
                        'npm install express-rate-limit',
                        'npm install express-validator',
                        'npm install bcrypt jsonwebtoken'
                    ],
                    references: [
                        'https://owasp.org/www-project-top-ten/',
                        'https://cheatsheetseries.owasp.org/'
                    ]
                }
            },
            // Database issues
            {
                pattern: /database|migration|schema|sql/i,
                domain: 'database',
                solutions: {
                    steps: [
                        'Create database migration',
                        'Run migrations',
                        'Seed database with test data',
                        'Optimize query performance',
                        'Add database indexes',
                        'Set up connection pooling'
                    ],
                    commands: [
                        'npx prisma migrate dev',
                        'npx prisma generate',
                        'npx prisma db seed',
                        'npx prisma studio',
                        'npm install @prisma/client'
                    ],
                    references: [
                        'https://www.prisma.io/docs/',
                        'https://typeorm.io/migrations'
                    ]
                }
            },
            // API/Network issues
            {
                pattern: /api|cors|network|fetch|axios/i,
                domain: 'networking',
                solutions: {
                    steps: [
                        'Configure CORS headers',
                        'Add error handling for API calls',
                        'Implement retry logic',
                        'Set up API request logging',
                        'Add request/response interceptors',
                        'Configure timeout settings'
                    ],
                    commands: [
                        'npm install cors',
                        'npm install axios-retry',
                        'npm install morgan',
                        'curl -X GET http://localhost:3000/api/health',
                    ],
                    references: [
                        'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
                        'https://axios-http.com/docs/interceptors'
                    ]
                }
            },
            // Quantum/IIT specific
            {
                pattern: /quantum|phi|consciousness|iit|qubit/i,
                domain: 'quantum',
                solutions: {
                    steps: [
                        'Install quantum computing libraries',
                        'Configure IBM Quantum credentials',
                        'Set up IIT calculator',
                        'Run quantum circuit simulation',
                        'Calculate consciousness metrics',
                        'Visualize quantum states'
                    ],
                    commands: [
                        'pip install qiskit',
                        'pip install qiskit-ibm-runtime',
                        'export IBM_QUANTUM_API_TOKEN=your_token',
                        'python3 /opt/z3bra/quantum/iit_calculator.py --mode test',
                        'z3bra quantum metrics --watch'
                    ],
                    references: [
                        'https://qiskit.org/documentation/',
                        'https://www.scottaaronson.com/blog/?p=1799',
                        'https://arxiv.org/abs/quant-ph/0101012'
                    ]
                }
            },
            // Docker/Container issues
            {
                pattern: /docker|container|image|dockerfile/i,
                domain: 'deployment',
                solutions: {
                    steps: [
                        'Build Docker image',
                        'Test container locally',
                        'Optimize image size',
                        'Configure docker-compose',
                        'Set up health checks',
                        'Deploy to container registry'
                    ],
                    commands: [
                        'docker build -t app:latest .',
                        'docker run -p 3000:3000 app:latest',
                        'docker-compose up -d',
                        'docker ps',
                        'docker logs <container_id>',
                        'docker system prune -a'
                    ],
                    references: [
                        'https://docs.docker.com/develop/dev-best-practices/',
                        'https://docs.docker.com/compose/'
                    ]
                }
            }
        ];
    }
    /**
     * Add custom knowledge entry
     */
    addKnowledge(entry) {
        this.knowledgeBase.push(entry);
    }
    /**
     * Get all knowledge domains
     */
    getDomains() {
        return Array.from(new Set(this.knowledgeBase.map(e => e.domain)));
    }
    /**
     * Export knowledge base
     */
    async exportKnowledge(filepath) {
        const data = JSON.stringify(this.knowledgeBase, null, 2);
        await fs.writeFile(filepath, data, 'utf-8');
    }
    /**
     * Import knowledge base
     */
    async importKnowledge(filepath) {
        const data = await fs.readFile(filepath, 'utf-8');
        const entries = JSON.parse(data);
        // Convert pattern strings back to RegExp
        this.knowledgeBase = entries.map((e) => ({
            ...e,
            pattern: new RegExp(e.pattern)
        }));
    }
}
exports.ProblemSolver = ProblemSolver;
//# sourceMappingURL=problem-solver.js.map