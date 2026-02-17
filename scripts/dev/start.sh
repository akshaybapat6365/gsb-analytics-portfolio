#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FALLBACK_PORTS=(3401 3402 3403)
PORT_REQUIRED="${PORT_REQUIRED:-0}"
PREFERRED_PORT="${PORT:-}"

if [[ -z "${NODE_BIN:-}" ]]; then
  if [[ -x "/opt/homebrew/opt/node@20/bin/node" ]]; then
    export NODE_BIN="/opt/homebrew/opt/node@20/bin/node"
    export PATH="$(dirname "$NODE_BIN"):$PATH"
  elif [[ -x "/usr/local/opt/node@20/bin/node" ]]; then
    export NODE_BIN="/usr/local/opt/node@20/bin/node"
    export PATH="$(dirname "$NODE_BIN"):$PATH"
  fi
fi

export NODE_BIN

is_port_free() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    ! lsof -nP -iTCP:${port} -sTCP:LISTEN >/dev/null 2>&1
  else
    ! nc -z 127.0.0.1 "${port}" >/dev/null 2>&1
  fi
}

find_existing_next_server() {
  local port pids pid cwd comm
  if ! command -v lsof >/dev/null 2>&1; then
    return 1
  fi

  for port in "${CANDIDATES[@]}"; do
    pids="$(lsof -nP -iTCP:${port} -sTCP:LISTEN -t || true)"
    for pid in $pids; do
      comm="$(ps -p "$pid" -o comm= 2>/dev/null || true)"
      cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n 1 || true)"
      if [[ "$cwd" == "$ROOT_DIR" && "$comm" == *"next"* ]]; then
        echo "${port}:${pid}"
        return 0
      fi
    done
  done

  return 1
}

print_port_status() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -nP -iTCP:${port} -sTCP:LISTEN -t || true)"
    if [[ -z "$pids" ]]; then
      echo "PORT_STATUS=${port}:free"
    else
      echo "PORT_STATUS=${port}:busy:$pids"
    fi
  else
    echo "PORT_STATUS=${port}:unknown"
  fi
}

echo "Checking environment..."
"$ROOT_DIR/scripts/dev/doctor.sh" >/tmp/dev-doctor.log 2>&1 || {
  cat /tmp/dev-doctor.log
  echo "Cannot start dev server while environment checks fail."
  exit 1
}

# Build candidates for port scanning without readarray/mapfile (for macOS Bash 3.2 compatibility).
CANDIDATES=()
if [[ -n "${PREFERRED_PORT}" ]]; then
  CANDIDATES+=("${PREFERRED_PORT}")
fi
for p in "${FALLBACK_PORTS[@]}"; do
  CANDIDATES+=("${p}")
done

if existing="$(find_existing_next_server)"; then
  existing_port="${existing%%:*}"
  existing_pid="${existing##*:}"
  START_URL="http://localhost:${existing_port}"
  echo "Reusing existing Next dev server (PID ${existing_pid}) from ${ROOT_DIR}."
  echo "OPEN_THIS_URL=${START_URL}"
  if "$ROOT_DIR/scripts/dev/check-url.sh" "$START_URL"; then
    exit 0
  fi
  echo "Existing server was detected but is not reachable. Attempting fresh start..."
fi

SELECTED_PORT=""
for port in "${CANDIDATES[@]}"; do
  if is_port_free "$port"; then
    SELECTED_PORT="$port"
    break
  fi

  if [[ "${PORT_REQUIRED}" == "1" ]]; then
    echo "Requested port ${PREFERRED_PORT} is unavailable; set PORT_REQUIRED=0 to allow fallback."
    echo "FAIL: could not bind to requested port."
    exit 1
  fi

  print_port_status "$port"
done

if [[ -z "$SELECTED_PORT" ]]; then
  echo "FAIL: no free port found in [${FALLBACK_PORTS[*]}]."
  exit 1
fi

if [[ -n "${PREFERRED_PORT}" && "$SELECTED_PORT" != "$PREFERRED_PORT" ]]; then
  echo "NOTICE: ${PREFERRED_PORT} unavailable. Falling back to ${SELECTED_PORT}."
  print_port_status "$PREFERRED_PORT"
fi

if [[ ! -x "$ROOT_DIR/node_modules/.bin/next" ]]; then
  echo "FAIL: next binary not found. Run npm install"
  exit 1
fi

START_URL="http://localhost:${SELECTED_PORT}"
echo "OPEN_THIS_URL=${START_URL}"

(
  cd "$ROOT_DIR"
  "$ROOT_DIR/node_modules/.bin/next" dev --port "$SELECTED_PORT"
) &

SERVER_PID=$!
trap 'if kill -0 "$SERVER_PID" 2>/dev/null; then kill "$SERVER_PID" 2>/dev/null; fi' EXIT

if ! "$ROOT_DIR/scripts/dev/check-url.sh" "$START_URL"; then
  echo "Next server failed to become reachable."
  exit 1
fi

wait "$SERVER_PID"
