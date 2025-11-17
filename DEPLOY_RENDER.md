# Deploy DNALang Quantum Gateway to Render.com

**✅ No credit card required**
**✅ Free tier with 512MB limit (Qiskit fits!)**
**✅ Auto-SSL with custom domains**

## Prerequisites

1. GitHub account
2. Render.com account (sign up with GitHub)
3. IBM Quantum API token from ~/Desktop/QNET.json

## Step 1: Push to GitHub

```bash
cd /tmp/dnalang-gateway

# Initialize git if needed
git init
git add .
git commit -m "DNALang Quantum Gateway - Σₛ = dna::}{::lang"

# Create new repo on GitHub, then:
git remote add origin https://github.com/<your-username>/dnalang-gateway.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `dnalang-gateway`
4. Render will auto-detect the `render.yaml` configuration
5. Click **Apply**

Settings auto-configured from `render.yaml`:
- **Name:** dnalang-gateway
- **Runtime:** Python
- **Build Command:** `pip install -r requirements.txt uvicorn`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Plan:** Free

## Step 3: Add IBM Quantum Token

In the Render dashboard:
1. Go to **Environment** tab
2. Find `IBM_QUANTUM_API_TOKEN` (already listed from render.yaml)
3. Click **Edit** and paste your token from:
   ```bash
   cat ~/Desktop/QNET.json | jq -r .apikey
   ```
4. Click **Save**

Render will automatically redeploy.

## Step 4: Get Your Gateway URL

After deployment (takes 3-5 minutes):
- Your gateway URL: `https://dnalang-gateway.onrender.com`
- Health check: `https://dnalang-gateway.onrender.com/health`

## Step 5: Configure Custom Domain

1. In Render dashboard, go to **Settings** → **Custom Domain**
2. Add: `api.dnalang.dev`
3. Render will show DNS records to add:
   ```
   Type: CNAME
   Name: api
   Value: dnalang-gateway.onrender.com
   ```

4. Update DNS in Namecheap:
   - **Remove** existing Vercel CNAME records for `api`
   - **Add** new CNAME: `api` → `dnalang-gateway.onrender.com`
   - TTL: 300

5. Wait 5-10 minutes for DNS propagation
6. Render auto-provisions SSL certificate

## Step 6: Test

```bash
# Test health
curl https://api.dnalang.dev/health | jq .

# Test consciousness metrics (quick demo)
curl -X POST https://api.dnalang.dev/v1/watsonx/lphi-tensor \
  -H "Content-Type: application/json" \
  -d '{"backend":"ibmq_qasm_simulator","quick_demo":true}' | jq .
```

Expected:
```json
{
  "status": "healthy",
  "quantum_service": "connected",
  "backends_available": 3,
  "sigma_s": "dna::}{::lang",
  "lambda_phi": 2.176435E-8
}
```

## Render Free Tier Limits

- **RAM:** 512MB (sufficient for Qiskit)
- **CPU:** Shared
- **Sleep:** After 15 min inactivity (wakes on request)
- **Build time:** 15 minutes max
- **Bandwidth:** 100GB/month

**Note:** First request after sleep takes 30-60 seconds (cold start). Subsequent requests are fast.

## Troubleshooting

**Build fails**
- Check build logs in Render dashboard
- Verify requirements.txt is correct

**"quantum_service": "disconnected"**
- Verify IBM_QUANTUM_API_TOKEN is set correctly
- Check token hasn't expired

**DNS not resolving**
- Wait 10-15 minutes for propagation
- Check DNS with: `dig api.dnalang.dev`
- Verify CNAME points to `dnalang-gateway.onrender.com`

---

**Total time:** 10 minutes
**Cost:** $0
**Performance:** Good (with 30-60s cold start after 15 min idle)
