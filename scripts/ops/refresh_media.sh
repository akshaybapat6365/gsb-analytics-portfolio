#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p logs/pipeline
LOG_FILE="logs/pipeline/media-refresh-$(date -u +%Y%m%dT%H%M%SZ).log"

{
  echo "[media-refresh] start $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if [[ -f ".venv/bin/python" ]]; then
    source .venv/bin/activate
  fi
  npm run media:build
  echo "[media-refresh] done $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} | tee "$LOG_FILE"

