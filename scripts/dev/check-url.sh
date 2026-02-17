#!/usr/bin/env bash
set -euo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "Usage: scripts/dev/check-url.sh <url>"
  exit 1
fi

TIMEOUT_SECONDS="${CHECK_URL_TIMEOUT_SECONDS:-20}"
INTERVAL_SECONDS="${CHECK_URL_INTERVAL_SECONDS:-1}"
ATTEMPT=0

deadline=$((SECONDS + TIMEOUT_SECONDS))
while ((SECONDS < deadline)); do
  ATTEMPT=$((ATTEMPT + 1))
  status="$(curl -fsS --max-time 2 -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || true)"

  if [[ "$status" =~ ^[0-9]{3}$ ]] && ((status >= 200 && status < 400)); then
    echo "CHECK_URL_OK=$URL"
    exit 0
  fi

  sleep "$INTERVAL_SECONDS"
done

echo "CHECK_URL_FAIL=$URL"
echo "Health check timed out after ${TIMEOUT_SECONDS}s"
echo "Attempts: $ATTEMPT, timeout per request: ${INTERVAL_SECONDS}s"
exit 1
