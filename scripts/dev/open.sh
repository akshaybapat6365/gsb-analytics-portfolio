#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${PORT:-3401}"
OPEN_URL="http://localhost:${PORT}"

if ! command -v open >/dev/null 2>&1; then
  echo "FAIL: macOS open command not available."
  exit 1
fi

(
  PORT_REQUIRED=1 PORT="$PORT" "$ROOT_DIR/scripts/dev/start.sh"
) &
SERVER_PID=$!
trap 'if kill -0 "$SERVER_PID" 2>/dev/null; then kill "$SERVER_PID" 2>/dev/null; fi' EXIT

"$ROOT_DIR/scripts/dev/check-url.sh" "$OPEN_URL"
open "$OPEN_URL"

echo "Launched browser for ${OPEN_URL}"

wait "$SERVER_PID"
