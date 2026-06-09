#!/bin/bash
set -e

echo "=== Short Drama — Deploy ==="

# Run quality checks first
bash scripts/check.sh

echo ""
echo "→ Deploying to Vercel..."
echo "  Note: Vercel auto-deploys on git push to main."
echo "  To manually trigger:"
echo "    git push origin main"
echo ""
echo "  Or use Vercel CLI:"
echo "    vercel --prod"