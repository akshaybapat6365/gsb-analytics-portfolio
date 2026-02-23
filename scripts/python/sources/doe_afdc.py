from __future__ import annotations

from urllib.parse import quote

from sources.common import SourceResult, fetch_json, now_iso

NREL_SOURCE = "nrel:afdc"
OVERPASS_SOURCE = "osm:overpass"


def _extract_stations(payload: dict) -> list[dict]:
    stations = payload.get("fuel_stations", [])
    if not isinstance(stations, list):
        return []
    return [s for s in stations if isinstance(s, dict)]


def _fetch_nrel_ca_stations() -> tuple[list[dict] | None, str | None]:
    url = (
        "https://developer.nrel.gov/api/alt-fuel-stations/v1.json?"
        "api_key=DEMO_KEY&fuel_type=ELEC&state=CA&status=E&access=public&limit=all"
    )
    try:
        payload = fetch_json(url)
    except Exception as exc:
        return None, f"fetch_error:{type(exc).__name__}"

    stations = _extract_stations(payload if isinstance(payload, dict) else {})
    if not stations:
        return None, "invalid_response"
    return stations, None


def _fetch_overpass_count(
    query: str,
    fetched_at: str,
    note: str,
    fallback_reason: str | None,
) -> SourceResult:
    url = "https://overpass-api.de/api/interpreter?data=" + quote(query, safe="")
    try:
        payload = fetch_json(url)
        elements = payload.get("elements") if isinstance(payload, dict) else None
        first = elements[0] if isinstance(elements, list) and elements else {}
        tags = first.get("tags") if isinstance(first, dict) else {}
        total = tags.get("total") if isinstance(tags, dict) else None
        count = int(total) if total is not None else None
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source=OVERPASS_SOURCE,
            as_of=None,
            reason=f"fetch_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    if count is None:
        return SourceResult(
            ok=False,
            value=None,
            source=OVERPASS_SOURCE,
            as_of=None,
            reason="invalid_response",
            fetched_at=fetched_at,
        )

    full_note = note
    if fallback_reason:
        full_note = f"{note}; fallback from {NREL_SOURCE} ({fallback_reason})"

    return SourceResult(
        ok=True,
        value=str(count),
        source=OVERPASS_SOURCE,
        as_of=fetched_at,
        note=full_note,
        fetched_at=fetched_at,
    )


def fetch_ca_ev_station_count() -> SourceResult:
    fetched_at = now_iso()
    stations, reason = _fetch_nrel_ca_stations()
    if stations is not None:
        return SourceResult(
            ok=True,
            value=str(len(stations)),
            source=NREL_SOURCE,
            as_of=fetched_at,
            note="CA public EV stations",
            fetched_at=fetched_at,
        )

    # Overpass fallback (California administrative area).
    query = (
        '[out:json][timeout:70];'
        'area["name"="California"]["boundary"="administrative"]["admin_level"="4"]->.searchArea;'
        'node["amenity"="charging_station"](area.searchArea);'
        "out count;"
    )
    return _fetch_overpass_count(
        query=query,
        fetched_at=fetched_at,
        note="CA charging-station count (OSM Overpass)",
        fallback_reason=reason,
    )


def fetch_i5_corridor_station_count() -> SourceResult:
    fetched_at = now_iso()
    stations, reason = _fetch_nrel_ca_stations()
    if stations is not None:
        corridor = [
            s
            for s in stations
            if isinstance(s.get("longitude"), (int, float))
            and isinstance(s.get("latitude"), (int, float))
            and -123.5 <= float(s["longitude"]) <= -117.0
            and 32.0 <= float(s["latitude"]) <= 42.2
        ]
        return SourceResult(
            ok=True,
            value=str(len(corridor)),
            source=NREL_SOURCE,
            as_of=fetched_at,
            note="Approximate I-5 CA corridor EV stations",
            fetched_at=fetched_at,
        )

    # Overpass fallback (coarse I-5 corridor bbox in CA).
    query = (
        '[out:json][timeout:70];'
        'node["amenity"="charging_station"](32,-123.5,42.2,-117.0);'
        "out count;"
    )
    return _fetch_overpass_count(
        query=query,
        fetched_at=fetched_at,
        note="Approximate I-5 corridor charging-station count (OSM Overpass)",
        fallback_reason=reason,
    )
