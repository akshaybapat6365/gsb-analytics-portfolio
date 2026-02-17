#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p logs/pipeline
LOG_FILE="logs/pipeline/data-refresh-$(date -u +%Y%m%dT%H%M%SZ).log"

{
  echo "[data-refresh] start $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  npm run data:build
  npm run data:build:real
  echo "[data-refresh] done $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} | tee "$LOG_FILE"

