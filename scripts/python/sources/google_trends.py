from __future__ import annotations

import json

from sources.common import SourceResult, fetch_text, now_iso


def _clean_json_payload(raw: str) -> dict:
    # Google trends endpoint prefixes with )]}'
    cleaned = raw
    if raw.startswith(")]}',"):
        cleaned = raw.split("\n", 1)[1] if "\n" in raw else raw[5:]
    return json.loads(cleaned)


def fetch_daily_trends_presence(term: str) -> SourceResult:
    fetched_at = now_iso()
    url = "https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=0&geo=US&ns=15"
    try:
        raw = fetch_text(url)
        payload = _clean_json_payload(raw)
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source="google-trends:dailytrends",
            as_of=None,
            reason=f"fetch_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    days = payload.get("default", {}).get("trendingSearchesDays", [])
    if not days:
        return SourceResult(
            ok=False,
            value=None,
            source="google-trends:dailytrends",
            as_of=None,
            reason="no_daily_trends",
            fetched_at=fetched_at,
        )

    searches = days[0].get("trendingSearches", [])
    queries = []
    for item in searches:
        title = item.get("title", {})
        query = title.get("query")
        if isinstance(query, str):
            queries.append(query.lower())
    present = term.lower() in queries

    return SourceResult(
        ok=True,
        value="1" if present else "0",
        source="google-trends:dailytrends",
        as_of=days[0].get("date"),
        note=f"Term presence for '{term}' in US daily trends",
        fetched_at=fetched_at,
    )

