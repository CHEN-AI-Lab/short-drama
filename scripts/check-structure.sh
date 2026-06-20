#!/bin/bash
# scripts/check-structure.sh — 多端结构合规检查
# Phase 3 交付前必须跑，0 errors 才算通过

set -e
ERRORS=0
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 多端结构合规检查 ==="

# ── 1. apps/*/src/ 下违禁目录 ──────────────────────────────────
echo ""
echo "[1/6] apps/*/src/ 违禁目录检查"
BANNED=$(find apps -path '*/node_modules' -prune -o -type d -print 2>/dev/null \
  | grep -E '/(hooks|lib|utils|constants|validators)$' || true)
if [ -n "$BANNED" ]; then
  echo "  ❌ 以下目录不应出现在 apps/ 下（应移至 shared/）："
  echo "$BANNED" | sed 's/^/    /'
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ 无违禁目录"
fi

# ── 2. apps/*/src/ 下纯工具文件（无 next/* import） ─────────────
echo ""
echo "[2/6] 检查移位的纯工具文件"
MOVED=""
while IFS= read -r f; do
  if ! grep -q "from 'next/" "$f" 2>/dev/null && ! grep -q 'from "next/' "$f" 2>/dev/null; then
    if ! grep -q "'use client'" "$f" 2>/dev/null; then
      MOVED="$MOVED$f"$'\n'
    fi
  fi
done < <(find apps -path '*/node_modules' -prune -o -name '*.ts' -print 2>/dev/null \
  | grep -E '/(utils|hooks|lib|constants|validators)/' || true)
if [ -n "$MOVED" ]; then
  echo "  ❌ 以下文件无 next/* 依赖，应移至 shared/:"
  echo "$MOVED" | sed '/^$/d' | sed 's/^/    /'
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ 无移位文件"
fi

# ── 3. app 目录命名规范 ─────────────────────────────────────────
echo ""
echo "[3/6] App 目录命名规范"
for d in apps/*/; do
  name=$(basename "$d")
  case "$name" in
    web|weapp|app|desktop|server|quickapp)
      echo "  ✅ apps/$name"
      ;;
    *)
      echo "  ⚠️  命名不规范: apps/$name（规范: web/weapp/app/desktop/server/quickapp）"
      ;;
  esac
done

# ── 4. scripts/ 三件套 ───────────────────────────────────────────
echo ""
echo "[4/6] Scripts 完整性检查"
for s in setup.sh check.sh deploy.sh; do
  if [ -f "scripts/$s" ]; then
    echo "  ✅ scripts/$s"
  else
    echo "  ❌ 缺少 scripts/$s"
    ERRORS=$((ERRORS+1))
  fi
done

# ── 5. 每个 app 的 package.json 引用 shared workspace ────────────
echo ""
echo "[5/6] Workspace 依赖检查"
for d in apps/*/; do
  name=$(basename "$d")
  if [ -f "$d/package.json" ]; then
    if grep -q '"shared"' "$d/package.json" 2>/dev/null; then
      echo "  ✅ apps/$name 引用了 shared"
    else
      echo "  ⚠️  apps/$name 未引用 shared（如果不需要可以忽略）"
    fi
  fi
done

# ── 6. shared/ package.json exports 通配符 ─────────────────────
echo ""
echo "[6/6] shared/ 导出完整性检查"
HAS_WILDCARD=$(python3 -c "
import json
with open('shared/package.json') as f:
    pkg = json.load(f)
exports = pkg.get('exports', {})
for k in exports:
    if k == './*' or k == '/*':
        print('YES')
        break
" 2>/dev/null)
if [ "$HAS_WILDCARD" = "YES" ]; then
  echo "  ✅ shared/ 有通配符导出，覆盖所有子目录"
else
  echo "  ⚠️  shared/ 无通配符导出"
fi

echo ""
echo "=== 结果 ==="
if [ $ERRORS -eq 0 ]; then
  echo "✅ 全部通过"
  exit 0
else
  echo "❌ $ERRORS 个问题需要修复"
  exit 1
fi