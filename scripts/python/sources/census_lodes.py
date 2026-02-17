from __future__ import annotations

from sources.common import SourceResult, fetch_json, now_iso


def fetch_denver_remote_work_share() -> SourceResult:
    fetched_at = now_iso()
    # Denver-Aurora-Lakewood MSA: 19740
    url = (
        "https://api.census.gov/data/2023/acs/acs1?"
        "get=NAME,B08006_001E,B08006_017E&for=metropolitan%20statistical%20area/micropolitan%20statistical%20area:19740"
    )
    try:
        payload = fetch_json(url)
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source="census:acs1:B08006",
            as_of=None,
            reason=f"fetch_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    if not isinstance(payload, list) or len(payload) < 2:
        return SourceResult(
            ok=False,
            value=None,
            source="census:acs1:B08006",
            as_of=None,
            reason="invalid_response",
            fetched_at=fetched_at,
        )

    row = payload[1]
    try:
        total = float(row[1])
        remote = float(row[2])
        share = (remote / total) * 100.0 if total > 0 else 0.0
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source="census:acs1:B08006",
            as_of=None,
            reason=f"parse_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    return SourceResult(
        ok=True,
        value=f"{share:.2f}",
        source="census:acs1:B08006",
        as_of="2023",
        note="Denver MSA remote-work commuter share",
        fetched_at=fetched_at,
    )

