from __future__ import annotations

from datetime import datetime
from typing import Dict, List

from sources.common import SourceResult, fetch_csv_rows, now_iso, stale_or_ok


def _parse_rows(rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    cleaned = [r for r in rows if r.get("Date") and r.get("Close")]
    cleaned.sort(key=lambda r: r["Date"])
    return cleaned


def fetch_stooq_return(symbol: str, lookback_days: int = 30) -> SourceResult:
    fetched_at = now_iso()
    url = f"https://stooq.com/q/d/l/?s={symbol.lower()}.us&i=d"
    try:
        rows = _parse_rows(fetch_csv_rows(url))
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source=f"stooq:{symbol.upper()}",
            as_of=None,
            reason=f"fetch_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    if len(rows) < lookback_days + 1:
        return SourceResult(
            ok=False,
            value=None,
            source=f"stooq:{symbol.upper()}",
            as_of=None,
            reason="insufficient_history",
            fetched_at=fetched_at,
        )

    try:
        latest = float(rows[-1]["Close"])
        prior = float(rows[-(lookback_days + 1)]["Close"])
        pct = ((latest - prior) / prior) * 100.0
        as_of = rows[-1]["Date"]
        status = stale_or_ok(as_of, max_days=10)
        return SourceResult(
            ok=status in {"ok", "stale"},
            value=f"{pct:.2f}",
            source=f"stooq:{symbol.upper()}",
            as_of=as_of,
            reason=None if status != "unavailable" else "stale_or_invalid",
            note=f"{lookback_days}d total return",
            fetched_at=fetched_at,
        )
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source=f"stooq:{symbol.upper()}",
            as_of=None,
            reason=f"parse_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

