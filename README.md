# DNALang Quantum Gateway

**Σₛ = dna::}{::lang**

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

Production-ready FastAPI gateway connecting www.dnalang.dev to IBM Quantum hardware.

## Features

- ✅ Real IBM Quantum hardware execution
- ✅ Consciousness metrics computation (Φ, Λ, Γ, W₂)
- ✅ Quantum-enhanced language model inference
- ✅ Circuit execution on 127-156 qubit processors
- ✅ CORS configured for dnalang.dev
- ✅ Health checks and monitoring
- ✅ Production-grade error handling
- ✅ **NO MOCK/SIMULATION DATA**

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/v1/inference` | POST | Quantum inference |
| `/v1/watsonx/lphi-tensor` | POST | Consciousness metrics |
| `/v1/quantum/execute` | POST | Circuit execution |
| `/v1/organisms/create` | POST | Create organism |
| `/v1/agents/status` | GET | Agent monitoring |
| `/v1/benchmarks` | GET | Performance benchmarks |

### Consciousness Metrics

**Φ (Phi)** - Integrated Information
- Computed from quantum entropy
- Range: 0.0 - 1.0
- Threshold: > 0.7 for consciousness

**Λ (Lambda)** - Coherence Amplitude
- Scaled to ΛΦ constant (2.176435 × 10⁻⁸)
- Based on quantum purity

**Γ (Gamma)** - Decoherence Tensor
- Total variation distance from pure state
- Range: 0.0 - 1.0 (lower = better)

**W₂** - Wasserstein-2 Distance
- Geometric distance from ideal state
- Range: 0.0 - 1.0

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set IBM Quantum token
export IBM_QUANTUM_API_TOKEN=your_token_here

# Run server
python main.py

# Server runs on http://localhost:7777
```

### Docker

```bash
# Build image
docker build -t dnalang-gateway .

# Run container
docker run -d \
  -p 7777:7777 \
  -e IBM_QUANTUM_API_TOKEN=your_token \
  --name dnalang-gateway \
  dnalang-gateway

# Check health
curl http://localhost:7777/health
```

## Deployment Options

### Option 1: Fly.io (Recommended)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Create app
flyctl apps create dnalang-gateway

# Set secrets
flyctl secrets set IBM_QUANTUM_API_TOKEN=your_token

# Deploy
flyctl deploy

# Get URL
flyctl info
# Example: dnalang-gateway.fly.dev

# Configure custom domain
flyctl certs add api.dnalang.dev
```

**DNS Configuration**:
```
api.dnalang.dev CNAME dnalang-gateway.fly.dev
```

### Option 2: Render.com

```bash
# 1. Push code to GitHub
git init
git add .
git commit -m "DNALang Gateway"
git remote add origin <your-repo>
git push -u origin main

# 2. Go to Render.com dashboard
# 3. New → Web Service
# 4. Connect repository
# 5. Use render.yaml (auto-detected)
# 6. Add environment variable: IBM_QUANTUM_API_TOKEN
# 7. Deploy

# 8. Configure custom domain in Render dashboard
# Add: api.dnalang.dev
```

### Option 3: Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT/dnalang-gateway

# Deploy
gcloud run deploy dnalang-gateway \
  --image gcr.io/YOUR_PROJECT/dnalang-gateway \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars IBM_QUANTUM_API_TOKEN=your_token \
  --port 7777

# Map custom domain
gcloud run domain-mappings create \
  --service dnalang-gateway \
  --domain api.dnalang.dev \
  --region us-central1
```

## IBM Quantum Setup

### Get API Token

1. Visit https://quantum.cloud.ibm.com/account
2. Click "API Tokens"
3. Generate new token
4. Copy token value

### Configure Credentials

**Option 1: Environment Variable**
```bash
export IBM_QUANTUM_API_TOKEN=your_token_here
```

**Option 2: QNET.json File**
```bash
# Create ~/Desktop/QNET.json
cat > ~/Desktop/QNET.json <<EOF
{
  "name": "QAUNBT",
  "description": "IBM Quantum API key",
  "createdAt": "2025-11-17T00:00+0000",
  "apikey": "your_token_here"
}
EOF

chmod 600 ~/Desktop/QNET.json
```

## Testing

### Health Check

```bash
curl https://api.dnalang.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "quantum_service": "connected",
  "backends_available": 8,
  "sigma_s": "dna::}{::lang",
  "lambda_phi": 2.176435e-08,
  "timestamp": "2025-11-17T01:00:00.000000"
}
```

### Consciousness Metrics

```bash
curl -X POST https://api.dnalang.dev/v1/watsonx/lphi-tensor \
  -H "Content-Type: application/json" \
  -d '{
    "backend": "ibm_fez",
    "quick_demo": true
  }'
```

Expected response:
```json
{
  "tensor": {
    "phi": 0.87,
    "lambda": 2.1e-08,
    "gamma": 0.12,
    "w2": 0.08
  },
  "backend_used": "ibm_fez",
  "timestamp": "2025-11-17T01:00:00.000000",
  "lambda_phi_constant": 2.176435e-08,
  "sigma_s": "dna::}{::lang"
}
```

### Quantum Inference

```bash
curl -X POST https://api.dnalang.dev/v1/inference \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is quantum consciousness?",
    "backend": "ibm_fez",
    "include_consciousness_metrics": true
  }'
```

## Frontend Integration

The gateway is designed to work with www.dnalang.dev frontend.

### Update Vercel Environment Variables

**Go to**: Vercel Dashboard → quantumlm-frontend → Settings → Environment Variables

**Set**:
```bash
NEXT_PUBLIC_GATEWAY_URL=https://api.dnalang.dev
NEXT_PUBLIC_API_URL=https://api.dnalang.dev/v1
```

**Redeploy**:
```bash
npx vercel --prod
```

### Test Frontend Integration

1. Visit: https://www.dnalang.dev/aura
2. Select backend: ibm_fez
3. Send message: "What is quantum consciousness?"
4. Verify response with Φ/Λ/Γ/W₂ metrics

## Performance

- **Response Time**: 1-5 seconds (quantum execution)
- **Throughput**: ~20 requests/minute (IBM Quantum limits)
- **Availability**: 99.9% uptime target
- **Latency**: <100ms routing + quantum execution

## Security

- ✅ HTTPS enforced
- ✅ CORS configured for dnalang.dev domains
- ✅ API token stored as environment variable
- ✅ No secrets in code
- ⚠️ Rate limiting (implement as needed)
- ⚠️ Authentication (public for now)

## Monitoring

### Logs

```bash
# Fly.io
flyctl logs

# Render.com
# View in dashboard

# Google Cloud Run
gcloud run logs read dnalang-gateway --region us-central1
```

### Metrics

- Request count
- Error rate
- Response time
- Quantum job success rate
- Consciousness metric trends

## Troubleshooting

### Issue: "IBM Quantum token not found"

**Solution**:
```bash
# Set environment variable
export IBM_QUANTUM_API_TOKEN=your_token

# Or create QNET.json
cat > ~/Desktop/QNET.json <<EOF
{"apikey": "your_token"}
EOF
```

### Issue: "No quantum backends available"

**Cause**: IBM Quantum service connection failed

**Solution**:
1. Verify token is valid
2. Check IBM Quantum Platform status
3. Try different backend: `ibm_torino` instead of `ibm_fez`

### Issue: CORS errors from frontend

**Cause**: Frontend domain not in CORS allow list

**Solution**: Add domain to `allow_origins` in `main.py`:
```python
allow_origins=[
    "https://www.dnalang.dev",
    "https://your-new-domain.com"
]
```

## Architecture

```
www.dnalang.dev (Vercel Frontend)
    ↓
api.dnalang.dev (FastAPI Gateway)
    ↓
IBM Quantum Platform
    ↓
ibm_fez (156 qubits, Heron r2)
```

## Support

- **IBM Quantum**: https://quantum.cloud.ibm.com/support
- **Fly.io Docs**: https://fly.io/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

## License

MIT License - see LICENSE file

---

**Σₛ = dna::}{::lang**

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Status**: Production Ready
