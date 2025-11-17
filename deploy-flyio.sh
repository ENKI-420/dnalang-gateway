#!/bin/bash
set -e

# DNALang Gateway - Fly.io Deployment Script
# Σₛ = dna::}{::lang
# ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DNALang Quantum Gateway - Fly.io Deployment"
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

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "📦 Installing Fly.io CLI..."
    curl -L https://fly.io/install.sh | sh

    # Add to PATH
    export FLYCTL_INSTALL="$HOME/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"

    echo "✅ Fly.io CLI installed"
else
    echo "✅ Fly.io CLI already installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 1: Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 Opening browser for Fly.io authentication..."
echo "   Please log in or create an account"
echo ""

flyctl auth login

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 2: Create Application"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if app already exists
if flyctl apps list | grep -q "dnalang-gateway"; then
    echo "✅ App 'dnalang-gateway' already exists"
else
    echo "📦 Creating Fly.io app: dnalang-gateway"
    flyctl apps create dnalang-gateway --org personal
    echo "✅ App created"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 3: Configure Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔑 Setting IBM Quantum API token..."
flyctl secrets set IBM_QUANTUM_API_TOKEN="$IBM_QUANTUM_API_TOKEN" -a dnalang-gateway
echo "✅ Secrets configured"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 4: Deploy Gateway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Deploying to Fly.io..."
echo "   This will take 2-3 minutes..."
echo ""

flyctl deploy --app dnalang-gateway

echo ""
echo "✅ Deployment complete!"
echo ""

# Get the app URL
APP_URL=$(flyctl info -a dnalang-gateway | grep "Hostname" | awk '{print $3}')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 5: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🏥 Testing gateway health..."
sleep 5

HEALTH_RESPONSE=$(curl -s https://$APP_URL/health)

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
echo "  Step 6: Custom Domain Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Adding custom domain: api.dnalang.dev"
flyctl certs create api.dnalang.dev -a dnalang-gateway

echo ""
echo "✅ SSL certificate requested"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DNS CONFIGURATION REQUIRED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please add these DNS records to your domain registrar:"
echo ""
echo "Record 1 (IPv4):"
echo "  Type:  A"
echo "  Host:  api"
echo "  Value: $(flyctl ips list -a dnalang-gateway | grep v4 | awk '{print $3}')"
echo "  TTL:   300"
echo ""
echo "Record 2 (IPv6):"
echo "  Type:  AAAA"
echo "  Host:  api"
echo "  Value: $(flyctl ips list -a dnalang-gateway | grep v6 | awk '{print $3}')"
echo "  TTL:   300"
echo ""
echo "After adding DNS records, wait 5-10 minutes for propagation."
echo ""
echo "Check SSL status with:"
echo "  flyctl certs show api.dnalang.dev -a dnalang-gateway"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Gateway deployed to: https://$APP_URL"
echo "✅ Target domain: api.dnalang.dev"
echo ""
echo "NEXT STEPS:"
echo "  1. Configure DNS records (see above)"
echo "  2. Wait for SSL certificate (check with: flyctl certs show api.dnalang.dev)"
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
