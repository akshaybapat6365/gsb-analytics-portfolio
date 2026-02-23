#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[hygiene] Removing Python cache artifacts..."
find . \
  \( -name .git -o -name .next -o -name node_modules -o -name .venv \) -prune -o \
  -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true

find . \
  \( -name .git -o -name .next -o -name node_modules -o -name .venv \) -prune -o \
  -type f \( -name '*.pyc' -o -name '*.pyo' \) -delete 2>/dev/null || true

echo "[hygiene] Removing test artifacts..."
rm -rf test-results playwright-report

if [[ "${KEEP_RUNS:-0}" != "1" ]]; then
  echo "[hygiene] Removing runtime data snapshots under public/data/_runs/ (set KEEP_RUNS=1 to retain)..."
  rm -rf public/data/_runs
fi

echo "[hygiene] Done."
