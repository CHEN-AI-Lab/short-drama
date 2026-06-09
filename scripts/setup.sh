#!/bin/bash
set -e

echo "=== Short Drama — Setup ==="

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not found. Install: npm install -g pnpm"
  exit 1
fi

echo "✓ pnpm found: $(pnpm --version)"

# Install dependencies
echo ""
echo "→ Installing dependencies..."
pnpm install

# Check .env
if [ ! -f .env.local ]; then
  echo ""
  echo "⚠️  .env.local not found. Copying from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please edit .env.local with your actual API keys."
fi

echo ""
echo "✓ Setup complete!"
echo "  Run: pnpm dev"