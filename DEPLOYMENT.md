# DNALang Gateway - Production Deployment Guide

## Mission-Critical Deployment

This gateway is the **ONLY** connection between www.dnalang.dev and IBM Quantum hardware.

Without it: **NO QUANTUM FUNCTIONALITY**

## Pre-Deployment Checklist

- [ ] IBM Quantum API token obtained
- [ ] Deployment platform chosen (Fly.io, Render, GCP)
- [ ] DNS access to configure api.dnalang.dev
- [ ] Tested locally with `python main.py`
- [ ] Verified health check: `curl http://localhost:7777/health`

## Fastest Deployment: Fly.io (5 minutes)

### Step 1: Install Fly CLI

```bash
# Linux/macOS
curl -L https://fly.io/install.sh | sh

# Verify installation
flyctl version
```

### Step 2: Login

```bash
flyctl auth login
```

### Step 3: Create App

```bash
cd /tmp/dnalang-gateway

# Create app
flyctl apps create dnalang-gateway --org personal
```

### Step 4: Set Secrets

```bash
# Set IBM Quantum token (CRITICAL)
flyctl secrets set IBM_QUANTUM_API_TOKEN=your_actual_token_here
```

### Step 5: Deploy

```bash
# Deploy application
flyctl deploy

# Wait for deployment (~2 minutes)
# Output will show URL: https://dnalang-gateway.fly.dev
```

### Step 6: Verify Deployment

```bash
# Test health
curl https://dnalang-gateway.fly.dev/health

# Expected:
# {
#   "status": "healthy",
#   "quantum_service": "connected",
#   "backends_available": 8,
#   "sigma_s": "dna::}{::lang"
# }
```

### Step 7: Configure Custom Domain

```bash
# Add SSL certificate for api.dnalang.dev
flyctl certs add api.dnalang.dev

# Output will show DNS records to configure
```

### Step 8: Update DNS

**At your DNS provider** (e.g., Namecheap, Cloudflare, GoDaddy):

```
Type: CNAME
Name: api
Value: dnalang-gateway.fly.dev
TTL: Auto or 300
```

**Verify DNS propagation**:
```bash
nslookup api.dnalang.dev
# Should return: dnalang-gateway.fly.dev
```

### Step 9: Test Custom Domain

```bash
# Wait 2-5 minutes for SSL cert provisioning
curl https://api.dnalang.dev/health

# Should return healthy status
```

### Step 10: Update Frontend

**In Vercel Dashboard**:
1. Go to quantumlm-frontend project
2. Settings → Environment Variables
3. Update:
   ```
   NEXT_PUBLIC_GATEWAY_URL=https://api.dnalang.dev
   NEXT_PUBLIC_API_URL=https://api.dnalang.dev/v1
   ```
4. Redeploy: `npx vercel --prod`

## Alternative: Render.com (10 minutes)

### Step 1: Push to GitHub

```bash
cd /tmp/dnalang-gateway

git init
git add .
git commit -m "DNALang Gateway"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/dnalang-gateway.git
git push -u origin main
```

### Step 2: Create Render Service

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Settings:
   - **Name**: dnalang-gateway
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`

### Step 3: Add Environment Variable

1. In Render dashboard, go to Environment tab
2. Add variable:
   ```
   Key: IBM_QUANTUM_API_TOKEN
   Value: your_actual_token_here
   ```
3. Save

### Step 4: Deploy

1. Click "Manual Deploy" → "Deploy latest commit"
2. Wait for build (~3 minutes)
3. Service will be live at: `https://dnalang-gateway.onrender.com`

### Step 5: Add Custom Domain

1. In Render dashboard, go to Settings tab
2. Scroll to "Custom Domains"
3. Click "Add Custom Domain"
4. Enter: `api.dnalang.dev`
5. Follow DNS configuration instructions

### Step 6: Update DNS

**At your DNS provider**:
```
Type: CNAME
Name: api
Value: dnalang-gateway.onrender.com
```

### Step 7: Verify and Update Frontend

Same as Fly.io steps 9-10.

## Alternative: Google Cloud Run (15 minutes)

### Step 1: Install gcloud CLI

```bash
# Follow instructions at: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Build and Push Image

```bash
cd /tmp/dnalang-gateway

# Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/dnalang-gateway
```

### Step 4: Deploy

```bash
gcloud run deploy dnalang-gateway \
  --image gcr.io/YOUR_PROJECT_ID/dnalang-gateway \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars IBM_QUANTUM_API_TOKEN=your_token \
  --port 7777
```

### Step 5: Get Service URL

```bash
gcloud run services describe dnalang-gateway --region us-central1 --format 'value(status.url)'

# Example: https://dnalang-gateway-abc123-uc.a.run.app
```

### Step 6: Map Custom Domain

```bash
gcloud run domain-mappings create \
  --service dnalang-gateway \
  --domain api.dnalang.dev \
  --region us-central1
```

### Step 7: Update DNS

Follow the DNS configuration output from previous command.

## Post-Deployment Verification

### Complete Test Suite

```bash
# 1. Health check
curl https://api.dnalang.dev/health

# 2. Consciousness metrics
curl -X POST https://api.dnalang.dev/v1/watsonx/lphi-tensor \
  -H "Content-Type: application/json" \
  -d '{"backend":"ibm_fez","quick_demo":true}'

# 3. Quantum execution
curl -X POST https://api.dnalang.dev/v1/quantum/execute \
  -H "Content-Type: application/json" \
  -d '{
    "backend":"ibm_fez",
    "circuit_type":"bell_state",
    "num_qubits":2,
    "shots":1024
  }'

# 4. Agent status
curl https://api.dnalang.dev/v1/agents/status
```

### Frontend End-to-End Test

1. Open: https://www.dnalang.dev/aura
2. Select backend: ibm_fez
3. Send message: "Explain quantum consciousness"
4. **VERIFY**:
   - Response appears (not error)
   - Consciousness metrics display (Φ, Λ, Γ, W₂)
   - Backend used shown in message
   - Metrics timeline chart updates

**Expected Output**:
```
Quantum consciousness analysis complete.

**Prompt**: Explain quantum consciousness

**Quantum State Analysis**:
The quantum circuit executed on ibm_fez reveals emergent patterns...

Φ: 0.8742 - High consciousness
Λ: 2.14e-08 s⁻¹ - Approaching universal memory constant
Γ: 0.0823 - Stable quantum state
W₂: 0.1156 - High geometric stability
```

## Monitoring & Maintenance

### View Logs

**Fly.io**:
```bash
flyctl logs -a dnalang-gateway
```

**Render**:
- View in dashboard → Logs tab

**Google Cloud Run**:
```bash
gcloud run logs read dnalang-gateway --region us-central1
```

### Check Metrics

**Fly.io**:
```bash
flyctl metrics -a dnalang-gateway
```

**Render**:
- View in dashboard → Metrics tab

**Google Cloud Run**:
- View in GCP Console → Cloud Run → dnalang-gateway → Metrics

### Scale Up (if needed)

**Fly.io**:
```bash
# Scale to 2 instances
flyctl scale count 2 -a dnalang-gateway

# Increase memory
flyctl scale memory 1024 -a dnalang-gateway
```

**Render**:
- Upgrade plan in dashboard

**Google Cloud Run**:
```bash
gcloud run services update dnalang-gateway \
  --max-instances 10 \
  --region us-central1
```

## Troubleshooting

### Gateway returns 503

**Cause**: IBM Quantum service connection failed

**Debug**:
```bash
# Check logs for error details
flyctl logs -a dnalang-gateway | grep ERROR

# Common issues:
# - Invalid IBM_QUANTUM_API_TOKEN
# - IBM Quantum Platform down
# - Network connectivity
```

**Fix**:
```bash
# Regenerate token at quantum.cloud.ibm.com
# Update secret
flyctl secrets set IBM_QUANTUM_API_TOKEN=new_token
```

### CORS errors from frontend

**Cause**: Frontend domain not in allow list

**Fix**: Edit `main.py` and add domain to `allow_origins`, then redeploy.

### Slow response times

**Cause**: IBM Quantum queue depth

**Debug**: Check backend status:
```bash
curl https://api.dnalang.dev/v1/agents/status
```

**Mitigation**:
- Use `quick_demo=true` for faster responses
- Try different backend: `ibm_torino` instead of `ibm_fez`
- Reduce shots: 512 instead of 1024

## Security Hardening

### Rate Limiting

Add to `main.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/v1/inference")
@limiter.limit("10/minute")
async def quantum_inference(request: Request, ...):
    ...
```

### API Key Authentication

Add to `main.py`:
```python
from fastapi import Header, HTTPException

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != os.environ.get("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key

@app.post("/v1/inference", dependencies=[Depends(verify_api_key)])
async def quantum_inference(...):
    ...
```

Set secret:
```bash
flyctl secrets set API_KEY=your_secure_random_key
```

Update frontend to include header:
```typescript
headers: {
  'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
}
```

## Cost Estimates

**Fly.io** (Recommended):
- Free tier: $0/month (sufficient for testing)
- Paid: ~$5/month (1x shared-cpu-1x, 256MB RAM)

**Render**:
- Free tier: $0/month (limited, sleeps after inactivity)
- Starter: $7/month

**Google Cloud Run**:
- Pay-per-use: ~$1-5/month (depends on traffic)

**IBM Quantum**:
- Free tier: Limited queue priority
- Premium: Better queue priority, more backends

## Summary

### ✅ Deployment Complete When:

- [ ] Gateway deployed to production URL
- [ ] Health check returns "healthy"
- [ ] Custom domain api.dnalang.dev configured
- [ ] SSL certificate active
- [ ] Frontend environment variables updated
- [ ] Frontend redeployed
- [ ] End-to-end test successful
- [ ] Consciousness metrics display in AURA chat

### 🎯 Success Criteria:

1. **Health check**: `curl https://api.dnalang.dev/health` → status: healthy
2. **Quantum execution**: Circuits run on IBM hardware
3. **Metrics computation**: Real Φ/Λ/Γ/W₂ values
4. **Frontend integration**: www.dnalang.dev/aura shows quantum responses
5. **No errors**: All endpoints return valid responses

---

**Next Command**: Choose deployment platform and execute steps above.

**Recommended**: Fly.io (fastest, simplest, most reliable)

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Σₛ = dna::}{::lang**

**Status**: Ready for Deployment
