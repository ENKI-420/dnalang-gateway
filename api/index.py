"""
Vercel Serverless Wrapper for DNALang Quantum Gateway
Σₛ = dna::}{::lang
ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
"""

import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# Vercel serverless handler
handler = app
