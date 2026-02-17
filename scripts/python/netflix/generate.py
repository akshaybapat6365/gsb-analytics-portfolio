from __future__ import annotations

import random
from typing import Any, Dict, List


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def generate_payload(seed: int = 121212) -> Dict[str, Any]:
    rng = random.Random(seed)

    titles_seed = [
        "Bridgerton",
        "Inventing Anna",
        "Queen Charlotte",
        "The Residence",
        "Grey’s: Rewatch Effect (Synthetic)",
        "Scandal: Legacy Tail (Synthetic)",
        "Drama Anthology (Synthetic)",
        "Courtroom Thriller (Synthetic)",
        "Romance Limited (Synthetic)",
        "YA Spinoff (Synthetic)",
        "Prestige Limited (Synthetic)",
        "Event Series (Synthetic)",
    ]

    titles: List[Dict[str, Any]] = []
    for i, name in enumerate(titles_seed):
        cost = _clamp(20 + rng.gauss(0, 18) + (8 if i < 3 else 0), 8, 140)
        acclaim = _clamp(55 + rng.gauss(0, 18) + (10 if i in (0, 2) else 0), 15, 95)
        # Acquisition and retention LTV in $M
        acq = _clamp(30 + rng.gauss(0, 22) + 0.9 * acclaim - 0.15 * cost, 6, 210)
        ret = _clamp(40 + rng.gauss(0, 26) + 0.6 * acclaim - 0.08 * cost, 8, 230)
        titles.append(
            {
                "id": f"t{i+1:02d}",
                "title": name,
                "costM": round(cost, 0),
                "acquisitionLtvM": round(acq, 0),
                "retentionLtvM": round(ret, 0),
                "acclaim": round(acclaim, 0),
            }
        )

    # Pareto frontier (synthetic): keep a few efficient points
    frontier = sorted(
        titles,
        key=lambda t: (-(t["acquisitionLtvM"] + t["retentionLtvM"]) / max(1.0, t["costM"]), -t["acquisitionLtvM"]),
    )[:6]

    payload: Dict[str, Any] = {
        "headline": {
            "dealCostM": 150.0,
            "estimatedIncrementalAddsM": 1.2,
            "ciAddsM": [0.6, 2.0],
            "retentionLiftPct": 4.6,
        },
        "titles": titles,
        "paretoFrontier": [
            {
                "id": t["id"],
                "acquisition": round(t["acquisitionLtvM"], 2),
                "retention": round(t["retentionLtvM"], 2),
            }
            for t in frontier
        ],
        "model": {
            # Adds model outputs in "millions of subs" for UI friendliness.
            "acquisitionAddsCoeff": {"intercept": 0.12, "budget": 0.0042, "buzz": 0.72, "acclaim": 0.38},
            # Retention value in "months" (proxy).
            "retentionMonthsCoeff": {"intercept": 0.8, "budget": 0.012, "buzz": 3.6, "acclaim": 1.9},
        },
    }

    return payload

