from __future__ import annotations

from datetime import datetime, timedelta

from sources.common import SourceResult, fetch_json, now_iso


def _sec_headers() -> dict[str, str]:
    return {
        "User-Agent": "gsb-analytics-portfolio/1.0 (contact: local)",
    }


def fetch_recent_10k_10q_count(cik: str, days: int = 365) -> SourceResult:
    fetched_at = now_iso()
    padded = cik.zfill(10)
    url = f"https://data.sec.gov/submissions/CIK{padded}.json"
    try:
        payload = fetch_json(url, headers=_sec_headers())
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source=f"sec:{padded}",
            as_of=None,
            reason=f"fetch_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    filings = payload.get("filings", {}).get("recent", {})
    forms = filings.get("form", [])
    dates = filings.get("filingDate", [])
    if not forms or not dates:
        return SourceResult(
            ok=False,
            value=None,
            source=f"sec:{padded}",
            as_of=None,
            reason="no_recent_filings",
            fetched_at=fetched_at,
        )

    cutoff = datetime.utcnow().date() - timedelta(days=days)
    count = 0
    latest_date: str | None = None
    for form, date_str in zip(forms, dates):
        if form not in {"10-K", "10-Q"}:
            continue
        try:
            dt = datetime.fromisoformat(date_str).date()
        except ValueError:
            continue
        if dt >= cutoff:
            count += 1
        if latest_date is None:
            latest_date = date_str

    return SourceResult(
        ok=True,
        value=str(count),
        source=f"sec:{padded}",
        as_of=latest_date,
        note=f"10-K/10-Q count in last {days}d",
        fetched_at=fetched_at,
    )
