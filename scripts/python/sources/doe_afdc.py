from __future__ import annotations

from sources.common import SourceResult, fetch_json, now_iso


def fetch_ca_ev_station_count() -> SourceResult:
    fetched_at = now_iso()
    url = (
        "https://developer.nrel.gov/api/alt-fuel-stations/v1.json?"
        "api_key=DEMO_KEY&fuel_type=ELEC&state=CA&status=E&access=public&limit=all"
    )
    try:
        payload = fetch_json(url)
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source="nrel:afdc",
            as_of=None,
            reason=f"fetch_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    stations = payload.get("fuel_stations", [])
    if not isinstance(stations, list):
        return SourceResult(
            ok=False,
            value=None,
            source="nrel:afdc",
            as_of=None,
            reason="invalid_response",
            fetched_at=fetched_at,
        )

    return SourceResult(
        ok=True,
        value=str(len(stations)),
        source="nrel:afdc",
        as_of=fetched_at,
        note="CA public EV stations",
        fetched_at=fetched_at,
    )


def fetch_i5_corridor_station_count() -> SourceResult:
    fetched_at = now_iso()
    url = (
        "https://developer.nrel.gov/api/alt-fuel-stations/v1.json?"
        "api_key=DEMO_KEY&fuel_type=ELEC&state=CA&status=E&access=public&limit=all"
    )
    try:
        payload = fetch_json(url)
    except Exception as exc:
        return SourceResult(
            ok=False,
            value=None,
            source="nrel:afdc",
            as_of=None,
            reason=f"fetch_error:{type(exc).__name__}",
            fetched_at=fetched_at,
        )

    stations = payload.get("fuel_stations", [])
    if not isinstance(stations, list):
        return SourceResult(
            ok=False,
            value=None,
            source="nrel:afdc",
            as_of=None,
            reason="invalid_response",
            fetched_at=fetched_at,
        )

    # Coarse I-5 corridor bounding box in CA.
    corridor = [
        s
        for s in stations
        if isinstance(s, dict)
        and isinstance(s.get("longitude"), (int, float))
        and isinstance(s.get("latitude"), (int, float))
        and -123.5 <= float(s["longitude"]) <= -117.0
        and 32.0 <= float(s["latitude"]) <= 42.2
    ]

    return SourceResult(
        ok=True,
        value=str(len(corridor)),
        source="nrel:afdc",
        as_of=fetched_at,
        note="Approximate I-5 CA corridor EV stations",
        fetched_at=fetched_at,
    )

