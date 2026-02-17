from __future__ import annotations

import random
from typing import Any, Dict, List


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def generate_payload(seed: int = 424242) -> Dict[str, Any]:
    rng = random.Random(seed)

    center_lon, center_lat = (-104.9903, 39.7392)  # Denver

    stores: List[Dict[str, Any]] = []
    for i in range(60):
        # Rough metro spread
        lon = center_lon + rng.gauss(0, 0.17)
        lat = center_lat + rng.gauss(0, 0.12)

        segment = rng.choices(["office", "residential", "mixed"], weights=[0.28, 0.46, 0.26])[0]
        if segment == "office":
            wfh_exp = _clamp(0.70 + rng.gauss(0, 0.12), 0.25, 0.95)
        elif segment == "residential":
            wfh_exp = _clamp(0.28 + rng.gauss(0, 0.12), 0.05, 0.70)
        else:
            wfh_exp = _clamp(0.48 + rng.gauss(0, 0.12), 0.10, 0.85)

        baseline_traffic = _clamp(880 + rng.gauss(0, 220) - 220 * wfh_exp, 260, 1650)
        baseline_profit_k = _clamp(84 + rng.gauss(0, 22) - 26 * wfh_exp, 12, 190)

        # Surgery rule of thumb (synthetic)
        if wfh_exp > 0.68 and baseline_profit_k < 70:
            rec = "Convert" if segment != "residential" else "Lockers"
        elif wfh_exp > 0.55:
            rec = "Lockers" if baseline_profit_k >= 55 else "Convert"
        else:
            rec = "Close" if baseline_profit_k < 45 and segment == "office" else "Lockers"

        # Delta profit (in $K) from action under high WFH. Positive for convert/lockers, negative for close.
        if rec == "Convert":
            delta = _clamp(32 + rng.gauss(0, 10) + 18 * wfh_exp, 6, 85)
        elif rec == "Lockers":
            delta = _clamp(18 + rng.gauss(0, 8) + 10 * wfh_exp, -6, 55)
        else:
            delta = _clamp(-28 + rng.gauss(0, 8) + 4 * (0.4 - wfh_exp), -55, 5)

        stores.append(
            {
                "id": f"den-{i+1:02d}",
                "name": f"Denver Store {i+1:02d}",
                "lon": round(lon, 5),
                "lat": round(lat, 5),
                "segment": segment,
                "baselineTraffic": round(baseline_traffic, 0),
                "baselineProfitK": round(baseline_profit_k, 1),
                "wfhExposure": round(wfh_exp, 2),
                "recommendation": rec,
                "deltaProfitK": round(delta, 1),
            }
        )

    payload: Dict[str, Any] = {
        "city": {"name": "Denver Metro", "center": [center_lon, center_lat], "zoom": 9.8},
        "did": {"ate": -0.18, "ci": [-0.26, -0.10], "pretrendP": 0.42},
        "scenarios": [
            {"wfhIndex": 0.0, "trafficMultiplier": 1.00},
            {"wfhIndex": 0.4, "trafficMultiplier": 0.92},
            {"wfhIndex": 0.7, "trafficMultiplier": 0.84},
            {"wfhIndex": 0.9, "trafficMultiplier": 0.79},
        ],
        "stores": stores,
    }

    return payload

