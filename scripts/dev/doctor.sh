#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGETS=(package.json app next.config.ts scripts)
FALLBACK_PORTS=(3401 3402 3403)
NODE_BIN="${NODE_BIN:-node}"
NPM_BIN="${NPM_BIN:-npm}"

if [[ -z "${NODE_BIN}" ]]; then
  NODE_BIN="node"
fi

if [[ ! -x "$NODE_BIN" ]]; then
  NODE_BIN="$(command -v "$NODE_BIN" || true)"
fi

if [[ -x "/opt/homebrew/opt/node@20/bin/node" ]]; then
  NODE20_BIN="/opt/homebrew/opt/node@20/bin/node"
elif [[ -x "/usr/local/opt/node@20/bin/node" ]]; then
  NODE20_BIN="/usr/local/opt/node@20/bin/node"
else
  NODE20_BIN=""
fi

if [[ -n "$NODE_BIN" ]]; then
  node_version="$("$NODE_BIN" -v)"
  node_major="${node_version#v}"
  node_major="${node_major%%.*}"
  if [[ "$node_major" != "20" && -n "$NODE20_BIN" ]]; then
    NODE_BIN="$NODE20_BIN"
  fi
elif [[ -n "$NODE20_BIN" ]]; then
  NODE_BIN="$NODE20_BIN"
fi

export NODE_BIN

echo "Doctor run path: $ROOT_DIR"
echo "--------------------------------"

status=0

if ! command -v "$NODE_BIN" >/dev/null 2>&1; then
  echo "FAIL: ${NODE_BIN} not found in PATH"
  status=1
else
  node_version="$("$NODE_BIN" -v)"
  node_major="${node_version#v}"
  node_major="${node_major%%.*}"
  echo "Node: $node_version"
  if [[ "$node_major" != "20" ]]; then
    echo "FAIL: Node 20.x required. Current major is ${node_major}."
    status=1
  fi
fi

node_dir="$(cd "$(dirname "$(command -v "$NODE_BIN")" )" && pwd)"
if [[ -x "$node_dir/npm" ]]; then
  NPM_BIN="$node_dir/npm"
elif ! command -v "$NPM_BIN" >/dev/null 2>&1; then
  echo "FAIL: npm not found in PATH"
  status=1
else
  NPM_BIN="$(command -v "$NPM_BIN")"
fi

if [[ -x "$NPM_BIN" ]]; then
  echo "npm: $("$NPM_BIN" -v)"
else
  echo "FAIL: npm not found"
  status=1
fi

for target in "${TARGETS[@]}"; do
  if [[ -e "$ROOT_DIR/$target" ]]; then
    echo "OK: found $target"
  else
    echo "FAIL: missing $target"
    status=1
  fi
done

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  echo "FAIL: node_modules not found. Run npm install"
  status=1
fi

if command -v lsof >/dev/null 2>&1; then
  for p in "${FALLBACK_PORTS[@]}"; do
    pids="$(lsof -nP -iTCP:${p} -sTCP:LISTEN -t || true)"
    if [[ -z "$pids" ]]; then
      echo "OK: port $p free"
    else
      echo "WARN: port $p occupied by PID(s): $pids"
      for pid in $pids; do
        cmd="$(ps -p "$pid" -o comm= || true)"
        echo "  ↳ $pid -> ${cmd:-unknown}"
      done
    fi
  done
else
  echo "WARN: lsof unavailable; skipping port diagnostics"
fi

if ((status == 0)); then
  echo "DOCTOR_STATUS=pass"
else
  echo "DOCTOR_STATUS=fail"
fi

exit "$status"
