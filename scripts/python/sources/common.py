from __future__ import annotations

import csv
import io
import json
import shutil
import subprocess
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List
from urllib.request import Request, urlopen

try:
    import requests
except ModuleNotFoundError:  # pragma: no cover
    requests = None  # type: ignore


DEFAULT_TIMEOUT_SECONDS = 20
DEFAULT_MAX_RETRIES = 3
DEFAULT_RETRY_BACKOFF_SECONDS = 0.75
USER_AGENT = "gsb-analytics-portfolio/1.0 (data pipeline; contact: local-dev)"


@dataclass
class SourceResult:
    ok: bool
    value: str | None
    source: str
    as_of: str | None
    reason: str | None = None
    note: str | None = None
    fetched_at: str | None = None


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def fetch_text(url: str, headers: Dict[str, str] | None = None) -> str:
    merged_headers = {"User-Agent": USER_AGENT}
    if headers:
        merged_headers.update(headers)

    # Prefer requests because its CA bundle is more reliable across local macOS Python builds.
    if requests is not None:
        last_error: Exception | None = None
        for attempt in range(DEFAULT_MAX_RETRIES):
            try:
                response = requests.get(
                    url,
                    headers=merged_headers,
                    timeout=DEFAULT_TIMEOUT_SECONDS,
                )
                response.raise_for_status()
                return response.text
            except Exception as exc:  # pragma: no cover - network path
                last_error = exc
                if attempt < DEFAULT_MAX_RETRIES - 1:
                    time.sleep(DEFAULT_RETRY_BACKOFF_SECONDS * (2**attempt))
        if last_error is not None:
            raise last_error

    last_error: Exception | None = None
    for attempt in range(DEFAULT_MAX_RETRIES):
        try:
            req = Request(url, headers=merged_headers)
            with urlopen(req, timeout=DEFAULT_TIMEOUT_SECONDS) as response:
                raw = response.read()
            return raw.decode("utf-8")
        except Exception as exc:  # pragma: no cover - network path
            last_error = exc
            if attempt < DEFAULT_MAX_RETRIES - 1:
                time.sleep(DEFAULT_RETRY_BACKOFF_SECONDS * (2**attempt))

    if last_error is not None:
        # Final fallback via curl. This avoids local TLS/cert issues from Python stdlib.
        curl_bin = shutil.which("curl")
        if curl_bin is not None:
            curl_error: Exception | None = None
            for attempt in range(DEFAULT_MAX_RETRIES):
                try:
                    cmd = [
                        curl_bin,
                        "-fsSL",
                        "--compressed",
                        "--connect-timeout",
                        str(DEFAULT_TIMEOUT_SECONDS),
                        "--max-time",
                        str(DEFAULT_TIMEOUT_SECONDS),
                    ]
                    for key, value in merged_headers.items():
                        cmd.extend(["-H", f"{key}: {value}"])
                    cmd.append(url)

                    completed = subprocess.run(
                        cmd,
                        capture_output=True,
                        text=True,
                        check=False,
                    )
                    if completed.returncode == 0:
                        return completed.stdout
                    curl_error = RuntimeError(
                        f"curl_exit_{completed.returncode}:{(completed.stderr or '').strip()[:160]}",
                    )
                except Exception as exc:  # pragma: no cover - shell/network path
                    curl_error = exc

                if attempt < DEFAULT_MAX_RETRIES - 1:
                    time.sleep(DEFAULT_RETRY_BACKOFF_SECONDS * (2**attempt))

            if curl_error is not None:
                raise curl_error

        raise last_error
    raise RuntimeError("fetch_text failed without a captured exception")


def fetch_json(url: str, headers: Dict[str, str] | None = None) -> Any:
    txt = fetch_text(url, headers=headers)
    return json.loads(txt)


def fetch_csv_rows(url: str, headers: Dict[str, str] | None = None) -> List[Dict[str, str]]:
    txt = fetch_text(url, headers=headers)
    reader = csv.DictReader(io.StringIO(txt))
    return [dict(row) for row in reader]


def stale_or_ok(as_of: str | None, max_days: int = 30) -> str:
    if not as_of:
        return "unavailable"
    try:
        dt = datetime.fromisoformat(as_of.replace("Z", "+00:00"))
    except ValueError:
        try:
            dt = datetime.fromisoformat(as_of)
        except ValueError:
            return "stale"
    age_days = (datetime.now(timezone.utc) - dt.astimezone(timezone.utc)).days
    return "ok" if age_days <= max_days else "stale"
