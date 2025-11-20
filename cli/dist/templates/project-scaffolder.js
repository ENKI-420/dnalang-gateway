"use strict";
/**
 * Project Scaffolder
 * Generate project templates for common use cases
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectScaffolder = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ProjectScaffolder {
    /**
     * Get available templates
     */
    getTemplates() {
        return [
            this.getNextJsTemplate(),
            this.getExpressAPITemplate(),
            this.getReactLibraryTemplate(),
            this.getPythonMLTemplate(),
            this.getQuantumProjectTemplate(),
            this.getDockerizedFullStackTemplate(),
            this.getMicroserviceTemplate()
        ];
    }
    /**
     * Scaffold a project from template
     */
    async scaffold(template, targetDir) {
        // Create directory structure
        await fs.mkdir(targetDir, { recursive: true });
        // Write files
        for (const file of template.files) {
            const filePath = path.join(targetDir, file.path);
            const fileDir = path.dirname(filePath);
            await fs.mkdir(fileDir, { recursive: true });
            await fs.writeFile(filePath, file.content, 'utf-8');
        }
        // Create package.json
        const packageJson = {
            name: path.basename(targetDir),
            version: '1.0.0',
            description: template.description,
            scripts: template.scripts,
            dependencies: this.arrayToObject(template.dependencies),
            devDependencies: this.arrayToObject(template.devDependencies)
        };
        await fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf-8');
        // Run post-install commands
        if (template.postInstall) {
            for (const cmd of template.postInstall) {
                await execAsync(cmd, { cwd: targetDir });
            }
        }
    }
    /**
     * Next.js Full-Stack Template
     */
    getNextJsTemplate() {
        return {
            name: 'nextjs-fullstack',
            description: 'Production-ready Next.js app with TypeScript, Tailwind, Prisma',
            dependencies: [
                'next@latest',
                'react@latest',
                'react-dom@latest',
                '@prisma/client@latest',
                'axios@latest',
                'zod@latest',
                'zustand@latest'
            ],
            devDependencies: [
                'typescript@latest',
                '@types/node@latest',
                '@types/react@latest',
                'tailwindcss@latest',
                'postcss@latest',
                'autoprefixer@latest',
                'prisma@latest',
                'eslint@latest',
                'eslint-config-next@latest'
            ],
            scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start',
                lint: 'next lint',
                'type-check': 'tsc --noEmit',
                'db:push': 'prisma db push',
                'db:studio': 'prisma studio'
            },
            files: [
                {
                    path: 'app/page.tsx',
                    content: `export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <h1 className="text-4xl font-bold">
        Welcome to Next.js + TypeScript
      </h1>
    </main>
  );
}
`
                },
                {
                    path: 'app/layout.tsx',
                    content: `import './globals.css';

export const metadata = {
  title: 'My App',
  description: 'Built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
                },
                {
                    path: 'app/globals.css',
                    content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`
                },
                {
                    path: 'tsconfig.json',
                    content: JSON.stringify({
                        compilerOptions: {
                            target: 'ES2020',
                            lib: ['dom', 'dom.iterable', 'esnext'],
                            allowJs: true,
                            skipLibCheck: true,
                            strict: true,
                            forceConsistentCasingInFileNames: true,
                            noEmit: true,
                            esModuleInterop: true,
                            module: 'esnext',
                            moduleResolution: 'bundler',
                            resolveJsonModule: true,
                            isolatedModules: true,
                            jsx: 'preserve',
                            incremental: true,
                            plugins: [{ name: 'next' }],
                            paths: { '@/*': ['./*'] }
                        },
                        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
                        exclude: ['node_modules']
                    }, null, 2)
                },
                {
                    path: 'tailwind.config.js',
                    content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
                },
                {
                    path: '.gitignore',
                    content: `node_modules
.next
.env
.env.local
dist
build
*.log
`
                }
            ],
            postInstall: ['npm install']
        };
    }
    /**
     * Express API Template
     */
    getExpressAPITemplate() {
        return {
            name: 'express-api',
            description: 'RESTful API with Express, TypeScript, Prisma',
            dependencies: [
                'express@latest',
                '@prisma/client@latest',
                'cors@latest',
                'helmet@latest',
                'express-rate-limit@latest',
                'dotenv@latest',
                'zod@latest'
            ],
            devDependencies: [
                'typescript@latest',
                '@types/node@latest',
                '@types/express@latest',
                '@types/cors@latest',
                'ts-node@latest',
                'nodemon@latest',
                'prisma@latest'
            ],
            scripts: {
                dev: 'nodemon src/index.ts',
                build: 'tsc',
                start: 'node dist/index.js',
                'db:push': 'prisma db push',
                'db:studio': 'prisma studio'
            },
            files: [
                {
                    path: 'src/index.ts',
                    content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
`
                },
                {
                    path: 'tsconfig.json',
                    content: JSON.stringify({
                        compilerOptions: {
                            target: 'ES2020',
                            module: 'commonjs',
                            lib: ['ES2020'],
                            outDir: './dist',
                            rootDir: './src',
                            strict: true,
                            esModuleInterop: true,
                            skipLibCheck: true,
                            forceConsistentCasingInFileNames: true
                        },
                        include: ['src/**/*'],
                        exclude: ['node_modules']
                    }, null, 2)
                },
                {
                    path: '.env.example',
                    content: `PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
`
                }
            ],
            postInstall: ['npm install']
        };
    }
    /**
     * React Component Library Template
     */
    getReactLibraryTemplate() {
        return {
            name: 'react-library',
            description: 'React component library with Vite, TypeScript, Storybook',
            dependencies: [
                'react@latest',
                'react-dom@latest'
            ],
            devDependencies: [
                'typescript@latest',
                'vite@latest',
                '@vitejs/plugin-react@latest',
                '@types/react@latest',
                '@types/react-dom@latest',
                'storybook@latest',
                '@storybook/react@latest',
                '@storybook/addon-essentials@latest'
            ],
            scripts: {
                dev: 'vite',
                build: 'tsc && vite build',
                preview: 'vite preview',
                storybook: 'storybook dev -p 6006',
                'build-storybook': 'storybook build'
            },
            files: [
                {
                    path: 'src/components/Button.tsx',
                    content: `import React from 'react';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {label}
    </button>
  );
};
`
                },
                {
                    path: 'src/index.ts',
                    content: `export { Button } from './components/Button';
`
                }
            ],
            postInstall: ['npm install']
        };
    }
    /**
     * Python ML Project Template
     */
    getPythonMLTemplate() {
        return {
            name: 'python-ml',
            description: 'Python machine learning project with Jupyter, PyTorch',
            dependencies: [],
            devDependencies: [],
            scripts: {
                'jupyter': 'jupyter notebook',
                'train': 'python train.py',
                'test': 'pytest'
            },
            files: [
                {
                    path: 'requirements.txt',
                    content: `torch>=2.0.0
torchvision>=0.15.0
numpy>=1.24.0
pandas>=2.0.0
matplotlib>=3.7.0
jupyter>=1.0.0
scikit-learn>=1.3.0
pytest>=7.4.0
`
                },
                {
                    path: 'train.py',
                    content: `import torch
import torch.nn as nn
import torch.optim as optim

# Define model
class SimpleModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(10, 1)

    def forward(self, x):
        return self.fc(x)

if __name__ == '__main__':
    model = SimpleModel()
    print('Model initialized')
`
                },
                {
                    path: '.gitignore',
                    content: `__pycache__
*.pyc
.ipynb_checkpoints
venv
.env
models/*.pth
data/raw
`
                }
            ],
            postInstall: ['pip install -r requirements.txt']
        };
    }
    /**
     * Quantum Computing Project Template
     */
    getQuantumProjectTemplate() {
        return {
            name: 'quantum-project',
            description: 'Quantum computing project with Qiskit and IIT calculations',
            dependencies: [],
            devDependencies: [],
            scripts: {
                'quantum': 'python quantum_circuit.py',
                'iit': 'python iit_calculator.py',
                'metrics': 'z3bra quantum metrics'
            },
            files: [
                {
                    path: 'requirements.txt',
                    content: `qiskit>=1.0.0
qiskit-ibm-runtime>=0.17.0
numpy>=1.24.0
matplotlib>=3.7.0
networkx>=3.1
`
                },
                {
                    path: 'quantum_circuit.py',
                    content: `from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, Sampler

# Create Bell State circuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

print("Quantum circuit created:")
print(qc)

# Execute on IBM Quantum
# service = QiskitRuntimeService()
# backend = service.backend('ibm_brisbane')
# sampler = Sampler(backend)
# job = sampler.run(qc)
# result = job.result()
# print(result)
`
                },
                {
                    path: 'iit_calculator.py',
                    content: `"""
Integrated Information Theory (IIT) Calculator
Calculates Φ (Phi) for quantum systems
"""

import numpy as np

def calculate_phi(state_vector, partitions):
    """Calculate integrated information"""
    # Simplified IIT calculation
    phi = 0.0

    # TODO: Implement full IIT calculation
    # See: Tononi et al., 2016

    return phi

if __name__ == '__main__':
    # Example 2-qubit system
    state = np.array([1, 0, 0, 0])  # |00⟩
    phi = calculate_phi(state, [[[0], [1]]])
    print(f"Φ = {phi}")
`
                }
            ],
            postInstall: ['pip install -r requirements.txt']
        };
    }
    /**
     * Dockerized Full-Stack Template
     */
    getDockerizedFullStackTemplate() {
        return {
            name: 'docker-fullstack',
            description: 'Full-stack app with Docker, Next.js, Express, PostgreSQL',
            dependencies: ['next@latest', 'express@latest'],
            devDependencies: ['typescript@latest'],
            scripts: {
                dev: 'docker-compose up',
                build: 'docker-compose build',
                down: 'docker-compose down'
            },
            files: [
                {
                    path: 'docker-compose.yml',
                    content: `version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
`
                },
                {
                    path: 'frontend/Dockerfile',
                    content: `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
`
                },
                {
                    path: 'backend/Dockerfile',
                    content: `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
`
                }
            ],
            postInstall: []
        };
    }
    /**
     * Microservice Template
     */
    getMicroserviceTemplate() {
        return {
            name: 'microservice',
            description: 'Microservice with Express, Redis, RabbitMQ',
            dependencies: [
                'express@latest',
                'redis@latest',
                'amqplib@latest',
                'dotenv@latest',
                'pino@latest'
            ],
            devDependencies: [
                'typescript@latest',
                '@types/node@latest',
                '@types/express@latest',
                'ts-node@latest'
            ],
            scripts: {
                dev: 'ts-node src/index.ts',
                build: 'tsc',
                start: 'node dist/index.js'
            },
            files: [
                {
                    path: 'src/index.ts',
                    content: `import express from 'express';
import { createClient } from 'redis';
import amqp from 'amqplib';
import pino from 'pino';

const logger = pino();
const app = express();

// Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// RabbitMQ connection
let rabbitChannel: amqp.Channel;

async function init() {
  await redis.connect();

  const rabbitConn = await amqp.connect(
    process.env.RABBITMQ_URL || 'amqp://localhost'
  );
  rabbitChannel = await rabbitConn.createChannel();

  logger.info('Microservice initialized');
}

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

init().then(() => {
  app.listen(3000, () => {
    logger.info('Microservice running on port 3000');
  });
});
`
                }
            ],
            postInstall: ['npm install']
        };
    }
    arrayToObject(arr) {
        const obj = {};
        arr.forEach(dep => {
            const [name, version] = dep.split('@');
            obj[name || dep] = version || 'latest';
        });
        return obj;
    }
}
exports.ProjectScaffolder = ProjectScaffolder;
//# sourceMappingURL=project-scaffolder.js.map