#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT_DIR"

. /home/mostltyharmless/.nvm/nvm.sh
nvm use 20.20.0 >/dev/null

if [ ! -d node_modules ]; then
  npm install --legacy-peer-deps
fi

npm run env:check
