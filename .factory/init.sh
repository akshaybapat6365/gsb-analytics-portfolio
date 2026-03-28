#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

source /home/mostltyharmless/.nvm/nvm.sh
nvm use 20.20.0 >/dev/null

if [[ ! -d node_modules ]]; then
  npm install --legacy-peer-deps
fi

npm run env:check
