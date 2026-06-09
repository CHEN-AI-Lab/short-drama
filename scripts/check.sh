#!/bin/bash
set -e

echo "=== Short Drama — Quality Check ==="
errors=0

# TypeScript check
echo ""
echo "→ TypeScript check..."
if pnpm typecheck 2>/dev/null; then
  echo "✓ TypeScript OK"
else
  echo "✗ TypeScript errors"
  errors=$((errors + 1))
fi

# Lint
echo ""
echo "→ Lint check..."
if pnpm lint 2>/dev/null; then
  echo "✓ Lint OK"
else
  echo "✗ Lint errors (omitted if eslint not configured)"
fi

# Unit tests
echo ""
echo "→ Unit tests..."
if pnpm test 2>/dev/null; then
  echo "✓ Tests OK"
else
  echo "✗ Tests failed or no tests configured"
  errors=$((errors + 1))
fi

# Build
echo ""
echo "→ Build..."
if pnpm build 2>/dev/null; then
  echo "✓ Build OK"
else
  echo "✗ Build failed"
  errors=$((errors + 1))
fi

echo ""
if [ $errors -eq 0 ]; then
  echo "✓ All checks passed!"
else
  echo "✗ $errors check(s) failed"
fi
exit $errors