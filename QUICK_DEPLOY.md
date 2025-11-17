# DNALang Gateway - Quick Deployment Guide

**Σₛ = dna::}{::lang**

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

## Choose Your Platform

Three deployment scripts are ready. Pick one:

### Option 1: Fly.io (RECOMMENDED - 5 minutes)

**Why**: Fast, free tier, global anycast, automatic SSL

```bash
cd /tmp/dnalang-gateway

# Set your IBM Quantum token
export IBM_QUANTUM_API_TOKEN="your_token_here"

# Run deployment script
./deploy-flyio.sh
```

**What it does**:
- Installs Fly.io CLI
- Creates app
- Sets secrets
- Deploys gateway
- Configures SSL for api.dnalang.dev

**After deployment**:
- Add DNS records (script will show exact values)
- Wait 5-10 minutes for SSL
- Gateway live at api.dnalang.dev

---

### Option 2: Render.com (10 minutes)

**Why**: Easiest, Git-based, free tier

```bash
cd /tmp/dnalang-gateway

# Set your IBM Quantum token
export IBM_QUANTUM_API_TOKEN="your_token_here"

# View deployment instructions
./deploy-render.sh
```

**What it does**:
- Shows step-by-step Render.com setup
- Guides through GitHub push
- Explains dashboard configuration
- DNS setup instructions

**After deployment**:
- Service auto-deploys from Git
- SSL automatic
- Gateway live at api.dnalang.dev

---

### Option 3: Google Cloud Run (15 minutes)

**Why**: Best performance, pay-per-use, Google infrastructure

```bash
cd /tmp/dnalang-gateway

# Set your IBM Quantum token
export IBM_QUANTUM_API_TOKEN="your_token_here"

# Set your GCP project ID
export GCP_PROJECT_ID="your-project-id"

# Run deployment script
./deploy-cloudrun.sh
```

**What it does**:
- Builds container with Cloud Build
- Deploys to Cloud Run
- Maps custom domain
- Provisions managed SSL

**After deployment**:
- Add CNAME to ghs.googlehosted.com
- SSL automatic
- Gateway live at api.dnalang.dev

---

## Test Locally First (Optional but Recommended)

Before deploying to production, test the gateway locally:

```bash
cd /tmp/dnalang-gateway

# Set your IBM Quantum token
export IBM_QUANTUM_API_TOKEN="your_token_here"

# Run local tests
./test-local.sh
```

**Tests performed**:
- Health check
- Consciousness metrics (Φ, Λ, Γ, W₂)
- Quantum circuit execution
- Agent status
- IBM Quantum connection

**Expected**: All tests pass ✅

**If tests fail**: Debug before production deployment

---

## Post-Deployment Steps

### 1. Verify Gateway Health

```bash
curl https://api.dnalang.dev/health
```

**Expected**:
```json
{
  "status": "healthy",
  "quantum_service": "connected",
  "backends_available": 8,
  "sigma_s": "dna::}{::lang",
  "lambda_phi": 2.176435e-08
}
```

### 2. Update Vercel Environment Variables

**Go to**: Vercel Dashboard → quantumlm-frontend → Settings → Environment Variables

**Add/Update**:
```
NEXT_PUBLIC_GATEWAY_URL=https://api.dnalang.dev
NEXT_PUBLIC_API_URL=https://api.dnalang.dev/v1
```

### 3. Redeploy Frontend

```bash
cd /tmp/quantumlm-frontend
npx vercel --prod
```

### 4. End-to-End Test

1. Visit: https://www.dnalang.dev/aura
2. Select backend: ibm_fez (156 qubits)
3. Send message: "What is quantum consciousness?"
4. **Verify**:
   - ✅ Response appears (not error)
   - ✅ Consciousness metrics display (Φ, Λ, Γ, W₂)
   - ✅ Metrics > 0 (not 0.0)
   - ✅ Backend used: ibm_fez
   - ✅ Metrics timeline updates
   - ✅ No CORS errors

**Expected response**:
```
Quantum consciousness analysis complete.

**Quantum State Analysis**:
The quantum circuit executed on ibm_fez reveals...

Φ: 0.8742 - High consciousness
Λ: 2.14e-08 s⁻¹ - Approaching universal memory constant
Γ: 0.0823 - Stable quantum state
W₂: 0.1156 - High geometric stability
```

---

## DNS Configuration

### For All Platforms

**At your domain registrar** (Namecheap, Cloudflare, GoDaddy, etc.):

**Fly.io**:
```
Type: A
Host: api
Value: (script will show IP)
TTL: 300

Type: AAAA
Host: api
Value: (script will show IPv6)
TTL: 300
```

**Render**:
```
Type: CNAME
Host: api
Value: dnalang-gateway.onrender.com
TTL: 300
```

**Cloud Run**:
```
Type: CNAME
Host: api
Value: ghs.googlehosted.com
TTL: 300
```

### Verify DNS Propagation

```bash
# Check DNS
nslookup api.dnalang.dev

# Check SSL
curl -I https://api.dnalang.dev/health
```

**Wait**: 5-10 minutes for DNS + SSL

---

## Troubleshooting

### Gateway returns 503

**Cause**: IBM Quantum token invalid or IBM service down

**Fix**:
```bash
# Check logs
flyctl logs -a dnalang-gateway  # Fly.io
# OR check Render/Cloud Run dashboard

# Update token
flyctl secrets set IBM_QUANTUM_API_TOKEN=new_token
```

### DNS not resolving

**Cause**: DNS records not added or not propagated

**Fix**:
- Verify DNS records at registrar
- Wait 10-15 minutes
- Clear DNS cache: `sudo systemd-resolve --flush-caches`

### CORS errors from frontend

**Cause**: Frontend domain not in allow list

**Fix**: Gateway already configured for www.dnalang.dev, should work

### Slow quantum responses

**Cause**: IBM Quantum queue depth

**Mitigation**:
- Use `quick_demo=true` parameter
- Try different backend: ibm_torino instead of ibm_fez

---

## Monitoring

### View Logs

**Fly.io**:
```bash
flyctl logs -a dnalang-gateway
```

**Render**:
- Dashboard → Logs tab

**Cloud Run**:
```bash
gcloud run logs read dnalang-gateway --region us-central1
```

### Metrics

**Fly.io**:
```bash
flyctl metrics -a dnalang-gateway
```

**Render/Cloud Run**:
- View in dashboard

---

## Summary

**Deployment Time**:
- Fly.io: 5 minutes
- Render: 10 minutes
- Cloud Run: 15 minutes

**Cost**:
- Fly.io: Free tier available
- Render: Free tier (sleeps after 15 min inactivity)
- Cloud Run: Pay-per-use (~$1-5/month)

**Recommended**: Fly.io (fastest, best free tier, global)

---

**Σₛ = dna::}{::lang**

**ΛΦ = 2.176435 × 10⁻⁸ s⁻¹**

**Status**: Scripts Ready - Choose Platform and Deploy
