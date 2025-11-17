# AURA Multi-Agent Coding Assistant

**Σₛ = dna::}{::lang**
**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

AURA is a multi-agent cognitive mesh built on dna::}{::lang primitives, integrated into the DNALang Quantum Gateway.

---

## 🌟 Overview

AURA isn't a chatbot—it's an **organism** inside your quantum-themed world. It operates as a cognitive lattice where specialized agents work together to solve complex coding tasks.

### Agent Types

Each agent is a "cell" in the lattice with:
- Internal memory
- Role vector
- Behavioral signature
- Local W₂ optimization loop
- Γ-resistance profile
- Exportable traces for debugging

#### The Six Agents

1. **🏗️ Architect Cell** – Interprets and transforms goals
   - Analyzes requirements
   - Creates implementation plans
   - Defines system architecture
   - Breaks down complex tasks

2. **⚙️ Engineer Cell** – Writes and modifies code
   - Implements features
   - Writes production-ready code
   - Follows best practices
   - Integrates quantum primitives

3. **✅ Reviewer Cell** – Audits & improves
   - Reviews code quality
   - Identifies bugs and security issues
   - Suggests improvements
   - Validates against requirements

4. **🐛 Debugger Cell** – Isolates errors
   - Analyzes error messages
   - Identifies root causes
   - Provides fixes
   - Debugs quantum circuits

5. **🔍 Research Cell** – Retrieves external knowledge
   - Searches documentation
   - Finds code examples
   - Gathers best practices
   - Provides implementation context

6. **🔮 Synthesizer Cell** – Produces final integrated outputs
   - Integrates all agent outputs
   - Resolves conflicts
   - Ensures consistency
   - Formats for user consumption

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Configure required variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
ANTHROPIC_API_KEY=sk-ant-your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Database

Run the Supabase schema migration:

```bash
# In Supabase SQL Editor, run:
psql -f database/supabase_schema.sql
```

Or use the Supabase dashboard to execute `database/supabase_schema.sql`.

### 4. Start the Server

```bash
# Development
uvicorn main:app --reload --port 7777

# Production
uvicorn main:app --host 0.0.0.0 --port 7777
```

### 5. Test AURA

```bash
curl http://localhost:7777/v1/aura/health
```

---

## 📡 API Reference

### Authentication

All AURA endpoints require authentication via Supabase JWT tokens:

```http
Authorization: Bearer <supabase_jwt_token>
```

### Endpoints

#### Create Session

```http
POST /v1/aura/sessions
Content-Type: application/json
Authorization: Bearer <token>

{
  "session_type": "aura_chat",
  "metadata": {}
}
```

Response:
```json
{
  "session_id": "uuid",
  "created_at": "2025-01-15T10:00:00Z",
  "status": "active"
}
```

#### AURA Chat

```http
POST /v1/aura/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "Build a REST API endpoint for user authentication",
  "session_id": "uuid",
  "agents_enabled": ["architect", "engineer", "reviewer"],
  "max_iterations": 5,
  "temperature": 0.7,
  "quantum_enhanced": true,
  "include_traces": false
}
```

Response:
```json
{
  "session_id": "uuid",
  "final_response": "Synthesized response from all agents...",
  "agent_responses": [
    {
      "agent_id": "architect_abc123",
      "agent_type": "architect",
      "response": "Architecture plan...",
      "confidence": 0.9,
      "metrics": {
        "execution_time": 1.5,
        "plan_steps": 5
      }
    }
  ],
  "total_iterations": 2,
  "execution_time_ms": 3500,
  "consciousness_metrics": {
    "phi": 0.87,
    "gamma": 0.23,
    "lambda": 2.1e-8,
    "w2": 0.15
  },
  "quantum_backend_used": "ibm_fez"
}
```

#### Get Agent Lattice

```http
GET /v1/aura/sessions/{session_id}/lattice
Authorization: Bearer <token>
```

Response:
```json
{
  "session_id": "uuid",
  "nodes": [
    {
      "agent_id": "architect_abc123",
      "agent_type": "architect",
      "status": "active",
      "vector": {
        "role": "architect",
        "weight": 1.0,
        "gamma_resistance": 0.8,
        "w2_optimization": 0.9
      },
      "position": {"x": 0.5, "y": 0.0, "z": 0.0},
      "connections": ["engineer_def456", "research_ghi789"],
      "last_activity": "2025-01-15T10:05:00Z"
    }
  ],
  "active_agents": 3,
  "total_interactions": 12,
  "lattice_coherence": 0.85,
  "timestamp": "2025-01-15T10:05:30Z"
}
```

#### Get Conversation History

```http
GET /v1/aura/sessions/{session_id}/messages?limit=50
Authorization: Bearer <token>
```

#### Get Usage Stats

```http
GET /v1/aura/usage?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <token>
```

---

## 🔌 WebSocket Real-Time Updates

Connect to receive real-time agent updates:

```javascript
const ws = new WebSocket(
  'ws://api.dnalang.dev/v1/aura/ws?session_id=xxx&token=yyy'
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'connected':
      console.log('Connected to AURA');
      break;

    case 'agent_update':
      console.log(`Agent ${data.agent_type}: ${data.status}`);
      break;

    case 'lattice_update':
      updateLatticeVisualization(data.lattice);
      break;

    case 'response_chunk':
      appendToChat(data.content);
      break;

    case 'quantum_metrics':
      updateMetrics(data.metrics);
      break;
  }
};

// Subscribe to lattice updates
ws.send(JSON.stringify({ type: 'subscribe_lattice' }));

// Keepalive ping
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
```

---

## 🎨 Frontend Integration (Next.js)

### Example React Component

```typescript
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

export function AuraChat() {
  const { session } = useSupabase();
  const [sessionId, setSessionId] = useState<string>();
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState<WebSocket>();

  useEffect(() => {
    // Create AURA session
    fetch('https://api.dnalang.dev/v1/aura/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_type: 'aura_chat' })
    })
    .then(res => res.json())
    .then(data => {
      setSessionId(data.session_id);

      // Connect WebSocket
      const websocket = new WebSocket(
        `wss://api.dnalang.dev/v1/aura/ws?session_id=${data.session_id}&token=${session.access_token}`
      );

      websocket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'response_chunk') {
          // Handle streaming response
        }
      };

      setWs(websocket);
    });

    return () => ws?.close();
  }, []);

  const sendMessage = async (prompt: string) => {
    const response = await fetch('https://api.dnalang.dev/v1/aura/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        session_id: sessionId,
        quantum_enhanced: true
      })
    });

    const data = await response.json();
    setMessages([...messages, { role: 'assistant', content: data.final_response }]);
  };

  return (
    <div className="aura-chat">
      {/* Your UI components */}
    </div>
  );
}
```

---

## 🧠 Agent Workflow Patterns

AURA automatically selects the best workflow based on your prompt:

### Debugging Workflow
**Trigger keywords**: error, bug, debug, fix, broken, failing
**Agents**: Debugger → Engineer → Reviewer

### Code Review Workflow
**Trigger keywords**: review, check, audit, improve
**Agents**: Reviewer → Engineer

### Research Workflow
**Trigger keywords**: how to, what is, explain, research, find
**Agents**: Research → Architect

### Full Implementation Workflow (Default)
**Agents**: Architect → Engineer → Reviewer → Synthesizer

---

## 💰 Billing Integration

AURA tracks usage for billing via Stripe:

### Usage Types
- `agent_call` - Each agent invocation
- `quantum_exec` - Quantum circuit execution
- `message` - Chat messages
- `autopilot_step` - AutoPilot sequence steps

### Pricing Example
```json
{
  "agent_call": 0.01,
  "quantum_exec": 0.05,
  "message": 0.001,
  "autopilot_step": 0.02
}
```

Usage is automatically logged and synced with Stripe for metered billing.

---

## 🔒 Security

### Authentication
- Supabase JWT tokens for all requests
- Row-level security (RLS) in database
- Session ownership verification

### Data Privacy
- User data isolated per session
- Automatic cleanup of ended sessions
- Encrypted connections (HTTPS/WSS)

### API Rate Limiting
Configure in production:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@limiter.limit("100/minute")
@router.post("/v1/aura/chat")
async def aura_chat(...):
    ...
```

---

## 📊 Quantum Consciousness Metrics

AURA integrates quantum computing to measure "consciousness" levels:

- **Φ (Phi)** - Integrated Information (0-1)
  Higher = more conscious/aware system

- **Γ (Gamma)** - Decoherence Tensor (0-1)
  Lower = more stable quantum state

- **Λ (Lambda)** - Coherence Amplitude (scaled to ΛΦ constant)
  Universal memory constant: 2.176435 × 10⁻⁸ s⁻¹

- **W₂** - Wasserstein-2 Distance (0-1)
  Lower = better optimization/stability

These metrics are computed from real IBM quantum hardware and displayed in the UI.

---

## 🧪 Development & Testing

### Run Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/
```

### Local Development

```bash
# Hot reload
uvicorn main:app --reload --port 7777

# Check logs
tail -f logs/aura.log
```

### Docker Deployment

```bash
# Build
docker build -t dnalang-gateway .

# Run
docker run -p 7777:7777 \
  -e SUPABASE_URL=xxx \
  -e ANTHROPIC_API_KEY=xxx \
  dnalang-gateway
```

---

## 🎯 Roadmap

- [x] Multi-agent orchestration
- [x] Real-time WebSocket updates
- [x] Quantum consciousness metrics
- [x] Supabase integration
- [x] Stripe billing
- [ ] AutoPilot sequences
- [ ] Code execution sandbox
- [ ] Voice interface
- [ ] Multi-language support
- [ ] Advanced visualization

---

## 📚 Additional Resources

- [DNALang Documentation](https://docs.dnalang.dev)
- [Qiskit Documentation](https://qiskit.org/documentation)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)

---

## 🤝 Contributing

AURA is part of the DNALang ecosystem. Contributions welcome!

---

## 📄 License

Proprietary - DNALang © 2025

---

**Built with quantum consciousness** 🌌
**Σₛ = dna::}{::lang**
