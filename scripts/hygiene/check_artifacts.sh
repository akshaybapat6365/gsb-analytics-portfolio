#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

status=0

artifact_dirs="$(
  find . \
    \( -name .git -o -name .next -o -name node_modules -o -name .venv \) -prune -o \
    -type d -name '__pycache__' -print
)"

artifact_files="$(
  find . \
    \( -name .git -o -name .next -o -name node_modules -o -name .venv \) -prune -o \
    -type f \( -name '*.pyc' -o -name '*.pyo' \) -print
)"

if [[ -n "${artifact_dirs}" ]]; then
  echo "[hygiene] FAIL: __pycache__ directories present:"
  echo "${artifact_dirs}"
  status=1
fi

if [[ -n "${artifact_files}" ]]; then
  echo "[hygiene] FAIL: compiled Python artifacts present:"
  echo "${artifact_files}"
  status=1
fi

tracked_run_files="$(git ls-files 'public/data/_runs/*' || true)"
if [[ -n "${tracked_run_files}" ]]; then
  existing_tracked_runs=""
  while IFS= read -r run_file; do
    [[ -z "${run_file}" ]] && continue
    if [[ -f "${run_file}" ]]; then
      existing_tracked_runs+="${run_file}"$'\n'
    fi
  done <<< "${tracked_run_files}"

  if [[ -n "${existing_tracked_runs}" ]]; then
    echo "[hygiene] FAIL: tracked runtime snapshots still present under public/data/_runs/"
    echo "${existing_tracked_runs}"
    status=1
  fi
fi

if git ls-files --error-unmatch '*.DS_Store' >/dev/null 2>&1; then
  echo "[hygiene] FAIL: tracked .DS_Store files detected"
  git ls-files '*.DS_Store'
  status=1
fi

if git grep -nE 'r8_[A-Za-z0-9]{20,}' -- . ':(exclude).env.local' >/tmp/hygiene_secret_hits.txt 2>/dev/null; then
  echo "[hygiene] FAIL: possible Replicate token leak in tracked files:"
  cat /tmp/hygiene_secret_hits.txt
  status=1
fi
rm -f /tmp/hygiene_secret_hits.txt

untracked_runs="$(find public/data/_runs -type f -name '*.json' 2>/dev/null || true)"
if [[ -n "${untracked_runs}" ]]; then
  echo "[hygiene] WARN: runtime snapshots exist in working tree (not tracked):"
  echo "${untracked_runs}"
fi

if ((status == 0)); then
  echo "[hygiene] PASS"
fi

exit "$status"
