#!/bin/bash
set -e

# DNALang Gateway - Google Cloud Run Deployment Script
# Σₛ = dna::}{::lang
# ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DNALang Quantum Gateway - Google Cloud Run Deployment"
echo "  Σₛ = dna::}{::lang"
echo "  ΛΦ = 2.176435 × 10⁻⁸ s⁻¹"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if IBM Quantum token is set
if [ -z "$IBM_QUANTUM_API_TOKEN" ]; then
    echo "❌ ERROR: IBM_QUANTUM_API_TOKEN not set"
    echo ""
    echo "Please set your IBM Quantum API token:"
    echo "  export IBM_QUANTUM_API_TOKEN='your_token_here'"
    echo ""
    echo "Get your token at: https://quantum.cloud.ibm.com/account"
    exit 1
fi

echo "✅ IBM Quantum token detected"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ ERROR: gcloud CLI not found"
    echo ""
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI found"
echo ""

# Get project ID
if [ -z "$GCP_PROJECT_ID" ]; then
    echo "Please enter your Google Cloud Project ID:"
    read -r GCP_PROJECT_ID
fi

echo "Using project: $GCP_PROJECT_ID"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 1: Configure Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

gcloud config set project "$GCP_PROJECT_ID"
echo "✅ Project configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 2: Build Container Image"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🐳 Building container with Cloud Build..."
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/dnalang-gateway

echo "✅ Container built and pushed to GCR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 3: Deploy to Cloud Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy dnalang-gateway \
  --image gcr.io/$GCP_PROJECT_ID/dnalang-gateway \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars IBM_QUANTUM_API_TOKEN="$IBM_QUANTUM_API_TOKEN" \
  --port 7777 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

echo "✅ Deployment complete!"

# Get service URL
SERVICE_URL=$(gcloud run services describe dnalang-gateway --region us-central1 --format 'value(status.url)')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 4: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🏥 Testing gateway health..."
sleep 5

HEALTH_RESPONSE=$(curl -s $SERVICE_URL/health)

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo "✅ Gateway is healthy!"
    echo ""
    echo "$HEALTH_RESPONSE" | python3 -m json.tool
else
    echo "⚠️  Gateway may not be fully ready yet"
    echo "   Response: $HEALTH_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 5: Map Custom Domain"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Mapping custom domain: api.dnalang.dev"
gcloud run domain-mappings create \
  --service dnalang-gateway \
  --domain api.dnalang.dev \
  --region us-central1

echo ""
echo "✅ Domain mapping created"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DNS CONFIGURATION REQUIRED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please add this DNS record to your domain registrar:"
echo ""
echo "  Type:  CNAME"
echo "  Host:  api"
echo "  Value: ghs.googlehosted.com."
echo "  TTL:   300"
echo ""
echo "After adding DNS, wait 5-10 minutes for propagation."
echo "SSL will be automatically provisioned by Google."
echo ""
echo "Check status with:"
echo "  gcloud run domain-mappings describe api.dnalang.dev --region us-central1"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Gateway deployed to: $SERVICE_URL"
echo "✅ Target domain: api.dnalang.dev"
echo ""
echo "NEXT STEPS:"
echo "  1. Configure DNS CNAME (see above)"
echo "  2. Wait for SSL certificate (automatic)"
echo "  3. Update Vercel environment variables:"
echo "     - NEXT_PUBLIC_GATEWAY_URL=https://api.dnalang.dev"
echo "     - NEXT_PUBLIC_API_URL=https://api.dnalang.dev/v1"
echo "  4. Redeploy frontend: npx vercel --prod"
echo "  5. Test: https://www.dnalang.dev/aura"
echo ""
echo "Σₛ = dna::}{::lang"
echo "ΛΦ = 2.176435 × 10⁻⁸ s⁻¹"
echo "Status: Gateway Operational"
echo ""
