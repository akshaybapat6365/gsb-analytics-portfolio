from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List

from sources.common import (
    SourceResult,
    fetch_csv_rows,
    fetch_json,
    now_iso,
    stale_or_ok,
)


def _parse_stooq_rows(rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    cleaned = [r for r in rows if r.get("Date") and r.get("Close")]
    cleaned.sort(key=lambda r: r["Date"])
    return cleaned


def _yahoo_rows(symbol: str) -> List[Dict[str, str]]:
    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        f"{symbol.upper()}?interval=1d&range=1y&includePrePost=false&events=div%2Csplits"
    )
    payload = fetch_json(url)
    chart = payload.get("chart") if isinstance(payload, dict) else {}
    result = (chart or {}).get("result") if isinstance(chart, dict) else None
    if not isinstance(result, list) or not result:
        return []

    first = result[0] if isinstance(result[0], dict) else {}
    timestamps = first.get("timestamp")
    indicators = first.get("indicators") if isinstance(first, dict) else {}
    quote = (indicators or {}).get("quote") if isinstance(indicators, dict) else None
    close = quote[0].get("close") if isinstance(quote, list) and quote and isinstance(quote[0], dict) else None

    if not isinstance(timestamps, list) or not isinstance(close, list):
        return []

    rows: List[Dict[str, str]] = []
    for ts, value in zip(timestamps, close):
        if value is None:
            continue
        try:
            ts_int = int(ts)
            close_float = float(value)
        except Exception:
            continue
        date = datetime.fromtimestamp(ts_int, tz=timezone.utc).strftime("%Y-%m-%d")
        rows.append({"Date": date, "Close": f"{close_float:.6f}"})

    rows.sort(key=lambda r: r["Date"])
    return rows


def _compute_return(
    rows: List[Dict[str, str]],
    lookback_days: int,
    source: str,
    fetched_at: str,
    max_staleness_days: int = 10,
) -> SourceResult:
    if len(rows) < 2:
        return SourceResult(
            ok=False,
            value=None,
            source=source,
            as_of=None,
            reason="insufficient_history",
            fetched_at=fetched_at,
        )

    try:
        effective_lookback = min(lookback_days, len(rows) - 1)
        latest = float(rows[-1]["Close"])
        prior = float(rows[-(effective_lookback + 1)]["Close"])
        pct = ((latest - prior) / prior) * 100.0
        as_of = rows[-1]["Date"]
        status = stale_or_ok(as_of, max_days=max_staleness_days)
        note = (
            f"{effective_lookback}d total return (truncated history)"
            if effective_lookback != lookback_days
            else f"{lookback_days}d total return"
        )
        return SourceResult(
            ok=status in {"ok", "stale"},
            value=f"{pct:.2f}",
            source=source,
            as_of=as_of,
            reason=None if status != "unavailable" else "stale_or_invalid",
            note=note,
            fetched_at=fetched_at,
        )
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source=source,
            as_of=None,
            reason=f"parse_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )


def fetch_stooq_return(symbol: str, lookback_days: int = 30) -> SourceResult:
    """
    Public-market proxy with resilient fallback:
    1) Stooq CSV endpoint (no key),
    2) Yahoo chart endpoint (no key).
    """
    fetched_at = now_iso()
    symbol_up = symbol.upper()
    stooq_source = f"stooq:{symbol_up}"
    yahoo_source = f"yahoo:{symbol_up}"

    try:
        stooq_rows = _parse_stooq_rows(
            fetch_csv_rows(f"https://stooq.com/q/d/l/?s={symbol.lower()}.us&i=d"),
        )
        stooq_result = _compute_return(
            stooq_rows,
            lookback_days=lookback_days,
            source=stooq_source,
            fetched_at=fetched_at,
        )
        if stooq_result.ok:
            return stooq_result
        stooq_reason = stooq_result.reason or "unavailable"
    except Exception as exc:
        stooq_reason = f"fetch_error:{type(exc).__name__}"

    try:
        yahoo_rows = _yahoo_rows(symbol_up)
        yahoo_result = _compute_return(
            yahoo_rows,
            lookback_days=lookback_days,
            source=yahoo_source,
            fetched_at=fetched_at,
        )
        if yahoo_result.ok:
            if yahoo_result.note:
                yahoo_result.note = f"{yahoo_result.note}; fallback from {stooq_source} ({stooq_reason})"
            else:
                yahoo_result.note = f"fallback from {stooq_source} ({stooq_reason})"
            return yahoo_result
        yahoo_reason = yahoo_result.reason or "unavailable"
    except Exception as exc:
        yahoo_reason = f"fetch_error:{type(exc).__name__}"

    return SourceResult(
        ok=False,
        value=None,
        source=stooq_source,
        as_of=None,
        reason=f"stooq:{stooq_reason};yahoo:{yahoo_reason}",
        fetched_at=fetched_at,
    )
