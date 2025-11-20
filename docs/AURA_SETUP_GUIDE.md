# AURA Setup Guide

Step-by-step guide to deploying the AURA Multi-Agent System.

---

## Prerequisites

- Python 3.11+
- IBM Quantum account with API token
- Supabase project
- Anthropic Claude API key
- Stripe account (for billing)
- Redis (optional, for caching)

---

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and keys

### Run Database Migration

1. Navigate to SQL Editor in Supabase dashboard
2. Copy contents of `database/supabase_schema.sql`
3. Execute the SQL script
4. Verify tables were created:
   - `aura_sessions`
   - `aura_messages`
   - `aura_agent_states`
   - `aura_usage`
   - `aura_autopilot_sequences`

### Configure Authentication

1. Go to Authentication → Settings
2. Enable email authentication
3. Configure email templates
4. Set JWT expiry to 3600 seconds (1 hour)

### Get API Keys

```bash
# From Supabase Dashboard → Settings → API
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Anthropic Claude API

### Get API Key

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Navigate to API Keys
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

### Set Model

The default model is `claude-sonnet-4-5-20250929`. To change:

```bash
AURA_DEFAULT_MODEL=claude-sonnet-4-5-20250929
```

---

## 3. Stripe Billing Setup

### Create Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Switch to Test Mode for development

### Get API Keys

```bash
# From Stripe Dashboard → Developers → API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### Create Products

In Stripe Dashboard → Products:

1. **AURA Agent Calls**
   - Type: Metered
   - Billing: Usage-based
   - Price: $0.01 per agent call

2. **Quantum Execution**
   - Type: Metered
   - Price: $0.05 per execution

3. **Messages**
   - Type: Metered
   - Price: $0.001 per message

### Set Up Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://api.dnalang.dev/v1/aura/webhooks/stripe`
3. Select events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 4. IBM Quantum

You already have this configured via QNET.json. Ensure:

```bash
IBM_QUANTUM_API_TOKEN=your_token_here
```

---

## 5. Environment Configuration

### Create .env File

```bash
cp .env.example .env
```

### Fill in All Variables

```bash
# Quantum
IBM_QUANTUM_API_TOKEN=xxxxxxxxxxxxx

# Server
PORT=7777
ENVIRONMENT=production

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# AURA
AURA_MAX_AGENTS=6
AURA_DEFAULT_MODEL=claude-sonnet-4-5-20250929
AURA_ENABLE_TRACING=true

# Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
```

---

## 6. Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import anthropic; import supabase; import stripe; print('All packages installed')"
```

---

## 7. Test the Installation

### Start Server

```bash
uvicorn main:app --reload --port 7777
```

### Test Endpoints

```bash
# Health check
curl http://localhost:7777/health

# AURA health check
curl http://localhost:7777/v1/aura/health
```

Expected response:
```json
{
  "status": "healthy",
  "aura_version": "1.0.0",
  "active_sessions": 0,
  "websocket_connections": 0,
  "services": {
    "supabase": "connected",
    "stripe": "connected",
    "anthropic": "configured"
  },
  "timestamp": "2025-01-15T10:00:00Z"
}
```

---

## 8. Create Test User

### Option A: Supabase Dashboard

1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Enable "Auto Confirm User"
5. Note the user ID

### Option B: API

```bash
curl -X POST 'https://xxxxxxxxxxxxx.supabase.co/auth/v1/signup' \
  -H 'apikey: your_anon_key' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@dnalang.dev",
    "password": "test123456"
  }'
```

---

## 9. Test AURA Chat

### Get Auth Token

```bash
curl -X POST 'https://xxxxxxxxxxxxx.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: your_anon_key' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@dnalang.dev",
    "password": "test123456"
  }'
```

Copy the `access_token` from response.

### Create Session

```bash
curl -X POST http://localhost:7777/v1/aura/sessions \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "session_type": "aura_chat"
  }'
```

Copy the `session_id`.

### Send AURA Request

```bash
curl -X POST http://localhost:7777/v1/aura/chat \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "Create a simple FastAPI endpoint that returns hello world",
    "session_id": "YOUR_SESSION_ID",
    "agents_enabled": ["architect", "engineer"],
    "max_iterations": 3,
    "quantum_enhanced": true
  }'
```

You should receive a response with code implementation from the agents!

---

## 10. Production Deployment

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option B: Docker

```bash
# Build
docker build -t dnalang-gateway .

# Run
docker run -d \
  --name dnalang-gateway \
  -p 7777:7777 \
  --env-file .env \
  dnalang-gateway

# View logs
docker logs -f dnalang-gateway
```

### Option C: Traditional Server

```bash
# Install systemd service
sudo cp deployment/dnalang-gateway.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable dnalang-gateway
sudo systemctl start dnalang-gateway

# Check status
sudo systemctl status dnalang-gateway
```

---

## 11. Frontend Integration

Update your Next.js frontend to use AURA:

```typescript
// lib/aura.ts
export const AURA_API_URL = process.env.NEXT_PUBLIC_AURA_API_URL || 'https://api.dnalang.dev';

export async function createAuraSession(token: string) {
  const response = await fetch(`${AURA_API_URL}/v1/aura/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ session_type: 'aura_chat' })
  });

  return response.json();
}

export async function sendAuraMessage(
  token: string,
  sessionId: string,
  prompt: string
) {
  const response = await fetch(`${AURA_API_URL}/v1/aura/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      session_id: sessionId,
      quantum_enhanced: true
    })
  });

  return response.json();
}
```

---

## 12. Monitoring & Logging

### Set up Logging

```python
# Add to main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/aura.log'),
        logging.StreamHandler()
    ]
)
```

### Monitor with Supabase

Use Supabase dashboard to:
- View real-time database activity
- Monitor API usage
- Track authentication events
- Analyze logs

### Track Metrics

```bash
# View active sessions
SELECT COUNT(*) FROM aura_sessions WHERE status = 'active';

# View usage by user
SELECT user_id, usage_type, SUM(quantity), SUM(cost_credits)
FROM aura_usage
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, usage_type;
```

---

## 13. Troubleshooting

### Common Issues

**"Supabase client not initialized"**
- Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
- Verify network connectivity to Supabase

**"ANTHROPIC_API_KEY not found"**
- Ensure .env file is in project root
- Verify dotenv is loading: `python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('ANTHROPIC_API_KEY'))"`

**"No quantum backends available"**
- Check IBM_QUANTUM_API_TOKEN is valid
- Verify IBM Quantum Platform access

**WebSocket connection failed**
- Ensure server supports WebSocket (Uvicorn does by default)
- Check CORS configuration allows WebSocket origin

### Debug Mode

```bash
# Run with debug logging
ENVIRONMENT=development uvicorn main:app --reload --log-level debug
```

### Health Checks

```bash
# Check all services
curl http://localhost:7777/health
curl http://localhost:7777/v1/aura/health

# Check specific agent
python -c "from services.aura.agents import EngineerAgent; agent = EngineerAgent(); print(agent)"
```

---

## 14. Next Steps

Once AURA is running:

1. **Integrate with Frontend**
   - Build React components for agent lattice visualization
   - Add real-time WebSocket updates
   - Create chat interface

2. **Customize Agents**
   - Modify agent system prompts in `services/aura/agents/`
   - Adjust agent workflows in `orchestrator.py`
   - Add custom agent types

3. **Scale Infrastructure**
   - Add Redis for session caching
   - Set up load balancer
   - Enable auto-scaling

4. **Monitor & Optimize**
   - Track agent performance metrics
   - Optimize quantum circuit execution
   - Tune agent confidence thresholds

---

## Support

For issues or questions:
- GitHub Issues: [dnalang-gateway/issues](https://github.com/your-org/dnalang-gateway/issues)
- Email: support@dnalang.dev
- Discord: [DNALang Community](https://discord.gg/dnalang)

---

**Happy coding with AURA!** 🚀✨

**Σₛ = dna::}{::lang**
