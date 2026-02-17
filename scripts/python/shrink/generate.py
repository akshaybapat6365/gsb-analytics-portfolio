from __future__ import annotations

import random
from typing import Any, Dict, List


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def generate_payload(seed: int = 9001) -> Dict[str, Any]:
    rng = random.Random(seed)

    store = {
        "name": "Target (Synthetic Store)",
        "width": 1000,
        "height": 620,
        "zones": [
            {"id": "z1", "name": "Self-checkout", "x": 40, "y": 60, "w": 360, "h": 220, "theftPressure": 0.92},
            {"id": "z2", "name": "Electronics", "x": 430, "y": 60, "w": 520, "h": 160, "theftPressure": 0.72},
            {"id": "z3", "name": "Apparel", "x": 430, "y": 240, "w": 300, "h": 170, "theftPressure": 0.48},
            {"id": "z4", "name": "Cosmetics", "x": 760, "y": 240, "w": 190, "h": 170, "theftPressure": 0.66},
            {"id": "z5", "name": "Grocery", "x": 40, "y": 300, "w": 360, "h": 280, "theftPressure": 0.38},
            {"id": "z6", "name": "Exit", "x": 430, "y": 440, "w": 520, "h": 140, "theftPressure": 0.58},
        ],
    }

    initial_cameras = [
        {"id": "c1", "x": 180, "y": 50},
        {"id": "c2", "x": 520, "y": 40},
        {"id": "c3", "x": 860, "y": 210},
        {"id": "c4", "x": 880, "y": 520},
    ]

    # Event stream: a mix of benign scans and suspicious behaviors.
    events: List[Dict[str, Any]] = []
    zone_pressure = {z["id"]: z["theftPressure"] for z in store["zones"]}
    zone_ids = [z["id"] for z in store["zones"]]

    def sample_zone() -> str:
        # Weighted by theft pressure.
        weights = [zone_pressure[z] + 0.25 for z in zone_ids]
        total = sum(weights)
        r = rng.random() * total
        acc = 0.0
        for z, w in zip(zone_ids, weights):
            acc += w
            if r <= acc:
                return z
        return zone_ids[-1]

    for t in range(0, 900, 6):
        zid = sample_zone()
        p = zone_pressure[zid]
        u = rng.random()
        if u < 0.76:
            typ = "scan"
            base = 0.10 + p * 0.18
        elif u < 0.92:
            typ = "sweep"
            base = 0.55 + p * 0.30
        else:
            typ = "switch"
            base = 0.62 + p * 0.25
        p_theft = _clamp(base + rng.gauss(0, 0.10), 0, 1)
        events.append({"t": t, "zoneId": zid, "type": typ, "pTheft": round(p_theft, 2)})

    economics = {
        "avgBasket": 42.0,
        "grossMargin": 0.28,
        "customerLtv": 450.0,
        "falsePositiveCost": 125.0,
        "theftCost": 65.0,
    }

    thresholds = [0.50, 0.60, 0.70, 0.75, 0.80, 0.85, 0.90]

    # Policy grid: lower threshold -> more interventions -> more prevented loss + more false positives.
    outcomes: List[Dict[str, Any]] = []
    base_theft_events = sum(1 for e in events if e["type"] in ("sweep", "switch"))
    for thr in thresholds:
        intervention_rate = _clamp(1.25 - thr, 0.08, 0.9)
        prevented = base_theft_events * intervention_rate * economics["theftCost"] * (0.55 + rng.random() * 0.2)
        fp_rate = _clamp(0.34 * intervention_rate + rng.gauss(0, 0.02), 0.01, 0.40)
        fp_cost = fp_rate * len(events) * economics["falsePositiveCost"] * 0.06
        system_cost = 18_000.0  # camera+compute amortized (synthetic)
        gain = prevented - fp_cost
        roi = (gain - system_cost) / max(1.0, system_cost)
        outcomes.append(
            {
                "threshold": thr,
                "preventedLoss": round(prevented, 0),
                "falsePositiveRate": round(fp_rate, 3),
                "roi": round(roi, 2),
            }
        )

    payload: Dict[str, Any] = {
        "store": store,
        "initialCameras": initial_cameras,
        "events": events,
        "economics": economics,
        "policy": {"thresholds": thresholds, "outcomes": outcomes},
    }

    return payload

