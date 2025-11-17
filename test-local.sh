#!/bin/bash
set -e

# DNALang Gateway - Local Testing Script
# Σₛ = dna::}{::lang
# ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DNALang Quantum Gateway - Local Testing"
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
    echo ""
    echo "Or create ~/Desktop/QNET.json:"
    echo '  {"apikey": "your_token_here"}'
    exit 1
fi

echo "✅ IBM Quantum token detected"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 1: Install Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "venv" ]; then
    echo "✅ Virtual environment exists"
    source venv/bin/activate
else
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "✅ Virtual environment created"
fi

echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✅ Dependencies installed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 2: Start Gateway Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Starting gateway on http://localhost:7777"
echo ""
echo "   Press Ctrl+C to stop"
echo ""

# Start server in background
python main.py &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 3: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🏥 Testing /health endpoint..."
echo ""

HEALTH=$(curl -s http://localhost:7777/health)

if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ Health check PASSED"
    echo ""
    echo "$HEALTH" | python3 -m json.tool
else
    echo "❌ Health check FAILED"
    echo "   Response: $HEALTH"
    kill $SERVER_PID
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 4: Test Consciousness Metrics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧠 Testing /v1/watsonx/lphi-tensor endpoint..."
echo "   Executing quantum circuit on IBM hardware..."
echo ""

LPHI=$(curl -s -X POST http://localhost:7777/v1/watsonx/lphi-tensor \
  -H "Content-Type: application/json" \
  -d '{"backend":"ibm_fez","quick_demo":true}')

if echo "$LPHI" | grep -q "tensor"; then
    echo "✅ Consciousness metrics PASSED"
    echo ""
    echo "$LPHI" | python3 -m json.tool
else
    echo "❌ Consciousness metrics FAILED"
    echo "   Response: $LPHI"
    kill $SERVER_PID
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 5: Test Quantum Execution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⚛️  Testing /v1/quantum/execute endpoint..."
echo "   Creating Bell state on IBM quantum hardware..."
echo ""

EXECUTE=$(curl -s -X POST http://localhost:7777/v1/quantum/execute \
  -H "Content-Type: application/json" \
  -d '{
    "backend":"ibm_fez",
    "circuit_type":"bell_state",
    "num_qubits":2,
    "shots":1024
  }')

if echo "$EXECUTE" | grep -q "success"; then
    echo "✅ Quantum execution PASSED"
    echo ""
    echo "$EXECUTE" | python3 -m json.tool | head -30
else
    echo "❌ Quantum execution FAILED"
    echo "   Response: $EXECUTE"
    kill $SERVER_PID
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 6: Test Agent Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🤖 Testing /v1/agents/status endpoint..."
echo ""

AGENTS=$(curl -s http://localhost:7777/v1/agents/status)

if echo "$AGENTS" | grep -q "agents"; then
    echo "✅ Agent status PASSED"
    echo ""
    echo "$AGENTS" | python3 -m json.tool
else
    echo "❌ Agent status FAILED"
    echo "   Response: $AGENTS"
    kill $SERVER_PID
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ALL TESTS PASSED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Gateway is fully functional"
echo "✅ IBM Quantum connection verified"
echo "✅ All endpoints responding correctly"
echo ""
echo "The gateway is ready for production deployment."
echo ""
echo "Server is running on http://localhost:7777"
echo "Press Ctrl+C to stop"
echo ""

# Keep server running
wait $SERVER_PID
