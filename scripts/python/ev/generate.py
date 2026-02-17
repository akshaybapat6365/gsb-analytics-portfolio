from __future__ import annotations

import random
from typing import Any, Dict, List, Tuple


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def generate_payload(seed: int = 8080) -> Dict[str, Any]:
    rng = random.Random(seed)

    # Simplified I-5 CA corridor (lon/lat bounds)
    bounds = ((-123.0, 32.4), (-117.0, 38.9))

    stations: List[Dict[str, Any]] = []
    for i in range(20):
        t = i / 19
        lon = _lerp(-122.2, -117.15, t) + rng.gauss(0, 0.08)
        lat = _lerp(38.6, 32.8, t) + rng.gauss(0, 0.06)
        brand = rng.choices(["Tesla", "EA", "Other"], weights=[0.55, 0.25, 0.20])[0]
        price = 0.36 if brand == "Tesla" else 0.44 if brand == "EA" else 0.40
        stations.append(
            {
                "id": f"s{i+1:02d}",
                "brand": brand,
                "lon": round(lon, 5),
                "lat": round(lat, 5),
                "pricePerKwh": round(price + rng.gauss(0, 0.03), 2),
            }
        )

    candidate_sites = [
        ("harris", "Harris Ranch, CA", -120.083, 36.244),
        ("kettle", "Kettleman City, CA", -119.960, 36.007),
        ("bakers", "Bakersfield, CA", -119.018, 35.373),
        ("sac", "Sacramento, CA", -121.494, 38.581),
        ("redd", "Redding, CA", -122.391, 40.587),
        ("stock", "Stockton, CA", -121.291, 37.957),
        ("fres", "Fresno, CA", -119.787, 36.737),
        ("la", "Los Angeles, CA", -118.244, 34.052),
    ]

    candidates: List[Dict[str, Any]] = []
    for _id, name, lon, lat in candidate_sites:
        capture = _clamp(18 + rng.gauss(0, 8) + (0.5 if "harris" in _id else 0.0) * 22, 6, 55)
        cann = _clamp(0.9 + rng.gauss(0, 0.7) + (0.5 if "la" in _id else 0.0) * 2.0, 0.1, 4.5)
        capex = _clamp(3.8 + rng.gauss(0, 0.7) + (0.6 if "harris" in _id else 0.0), 2.2, 6.5)
        npv = _clamp(-2.2 + rng.gauss(0, 1.2) + (0.6 if "harris" in _id else 0.0) * 3.0 - cann * 0.35, -4.8, 4.2)
        candidates.append(
            {
                "id": _id,
                "name": name,
                "lon": lon,
                "lat": lat,
                "capturesFordPct": round(capture, 0),
                "cannibalizesTeslaUnitsPerMonth": round(cann, 1),
                "npvM": round(npv, 1),
                "capexM": round(capex, 1),
            }
        )

    # Traffic “flows” rendered as paths.
    flows: List[Dict[str, Any]] = []
    brands = ["Tesla", "Ford", "GM", "Other"]
    for i in range(42):
        brand = rng.choices(brands, weights=[0.36, 0.26, 0.18, 0.20])[0]
        # Random segment along corridor
        t0 = rng.random() * 0.7
        t1 = _clamp(t0 + 0.25 + rng.random() * 0.25, 0, 1)
        steps = 8
        path: List[Tuple[float, float]] = []
        timestamps: List[float] = []
        for k in range(steps):
            tt = t0 + (t1 - t0) * (k / (steps - 1))
            lon = _lerp(-122.3, -117.2, tt) + rng.gauss(0, 0.06)
            lat = _lerp(38.6, 32.8, tt) + rng.gauss(0, 0.05)
            path.append((round(lon, 5), round(lat, 5)))
            timestamps.append(float(k))
        flows.append({"id": f"f{i+1:02d}", "brand": brand, "path": path, "timestamps": timestamps})

    payload: Dict[str, Any] = {
        "corridor": {
            "name": "I-5 Corridor (CA)",
            "focus": "Harris Ranch, CA",
            "bounds": [list(bounds[0]), list(bounds[1])],
        },
        "stations": stations,
        "candidateSites": candidates,
        "flows": flows,
    }

    return payload

