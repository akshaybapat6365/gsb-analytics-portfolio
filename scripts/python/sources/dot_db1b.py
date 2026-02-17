from __future__ import annotations

from sources.common import SourceResult, fetch_csv_rows, now_iso, stale_or_ok


def fetch_airfare_cpi_yoy() -> SourceResult:
    fetched_at = now_iso()
    series_id = "CUSR0000SETG01"  # CPI: Airline fares
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}"
    try:
        rows = [r for r in fetch_csv_rows(url) if r.get(series_id) not in {".", "", None}]
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source=f"fred:{series_id}",
            as_of=None,
            reason=f"fetch_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    if len(rows) < 13:
        return SourceResult(
            ok=False,
            value=None,
            source=f"fred:{series_id}",
            as_of=None,
            reason="insufficient_history",
            fetched_at=fetched_at,
        )

    latest = float(rows[-1][series_id])
    prior = float(rows[-13][series_id])
    yoy = ((latest - prior) / prior) * 100.0
    as_of = rows[-1].get("observation_date")
    status = stale_or_ok(as_of, max_days=45)

    return SourceResult(
        ok=status in {"ok", "stale"},
        value=f"{yoy:.2f}",
        source=f"fred:{series_id}",
        as_of=as_of,
        reason=None,
        note="Airfare CPI YoY",
        fetched_at=fetched_at,
    )
