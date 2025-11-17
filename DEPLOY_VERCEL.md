# Deploy DNALang Quantum Gateway to Vercel

**No credit card needed** - Uses your existing Vercel account

## Step 1: Get IBM Quantum Token

```bash
cat ~/Desktop/QNET.json | jq -r .apikey
```

Copy the token - you'll need it in Step 3.

## Step 2: Deploy to Vercel

```bash
cd /tmp/dnalang-gateway

# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy
vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? Choose your account
- Link to existing project? **No**
- Project name? **dnalang-gateway**
- Directory? Press Enter (current directory)
- Override settings? **No**

## Step 3: Add Environment Variable

After deployment completes, go to:
https://vercel.com/[your-account]/dnalang-gateway/settings/environment-variables

Add:
```
Name:  IBM_QUANTUM_API_TOKEN
Value: <paste token from Step 1>
Environment: Production
```

Then click **Save** and **Redeploy**.

## Step 4: Configure Domain

In Vercel dashboard:
1. Go to **Domains**
2. Add domain: `api.dnalang.dev`
3. Vercel will show you're already verified (DNS already points there)
4. Click **Add**

Done! Your gateway is now live at `https://api.dnalang.dev`

## Step 5: Test

```bash
curl https://api.dnalang.dev/health | jq .
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

## Troubleshooting

**Build fails with "package too large"**
- Vercel has a 50MB limit per function
- Qiskit is large but should fit
- If it fails, we can optimize

**"quantum_service": "disconnected"**
- Check environment variable is set correctly
- Redeploy after adding the variable

**CORS errors from frontend**
- Vercel automatically configures HTTPS
- The CORS settings in main.py already allow dnalang.dev

---

**Total deployment time:** 5 minutes
**Cost:** $0 (Vercel free tier)
**Performance:** Global edge network, sub-50ms latency
