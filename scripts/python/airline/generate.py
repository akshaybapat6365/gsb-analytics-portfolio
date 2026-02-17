from __future__ import annotations

import math
import random
from datetime import date, timedelta
from typing import Any, Dict, List


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _dow(dt: date) -> str:
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dt.weekday()]


def _isoelastic_demand(base: float, price: float, anchor: float, elasticity: float, shock: float) -> float:
    # demand = base * (price/anchor)^elasticity + shock_component
    # Keep tails reasonable for a single route.
    shock_component = 34.0 * shock
    d = base * (price / anchor) ** elasticity + shock_component
    return max(55.0, d)


def _optimal_price(base_demand: float, anchor: float, elasticity: float, shock: float) -> float:
    # Brute force a discrete action space (what a DQN would effectively learn).
    best_price = anchor
    best_rev = -1.0
    for p in range(200, 361, 5):
        pax = _isoelastic_demand(base_demand, float(p), anchor, elasticity, shock)
        rev = float(p) * pax
        if rev > best_rev:
            best_rev = rev
            best_price = float(p)
    return best_price


def _shock_meta(level: float) -> tuple[str, str]:
    if level >= 1.0:
        return (
            "high",
            "Major demand shock: schedule disruption and event traffic changed booking mix intraday.",
        )
    if level >= 0.5:
        return (
            "med",
            "Moderate demand shock: weather and event spillovers shifted late-booking behavior.",
        )
    return (
        "low",
        "Baseline demand drift with no major exogenous disruption.",
    )


def generate_payload(seed: int = 20230217) -> Dict[str, Any]:
    rng = random.Random(seed)

    start = date(2023, 4, 1)
    end = date(2023, 6, 30)

    anchor_price = 285.0
    elasticity = -1.30

    days: List[Dict[str, Any]] = []

    prev_actual = 292.0
    dt = start
    while dt <= end:
        dow = _dow(dt)

        # Weekly seasonality + mild Q2 drift + idiosyncratic noise
        dow_boost = {"Mon": 18, "Tue": 8, "Wed": 10, "Thu": 16, "Fri": 26, "Sat": -14, "Sun": -6}[dow]
        seasonal = 7.5 * math.sin((dt.toordinal() - start.toordinal()) / 7.0)
        base_demand = 182.0 + dow_boost + seasonal + rng.gauss(0, 7)

        # Rare demand shocks (weather, events, ops)
        shock = 0.0
        u = rng.random()
        if u < 0.06:
            shock = 1.0
        elif u < 0.10:
            shock = 0.5

        # "Human team" pricing: sticky + slow reaction to shocks
        reactivity = 0.25
        actual_target = anchor_price + dow_boost * 0.55 + seasonal * 0.35 + shock * 4.0
        actual_price = prev_actual * (1 - reactivity) + actual_target * reactivity + rng.gauss(0, 6.5)
        actual_price = _clamp(actual_price, 205.0, 365.0)
        prev_actual = actual_price

        # "Algorithm" pricing: revenue-optimizing under the (synthetic) demand model
        algo_price = _optimal_price(base_demand, anchor_price, elasticity, shock)

        actual_pax = _isoelastic_demand(base_demand, actual_price, anchor_price, elasticity, shock)
        algo_pax = _isoelastic_demand(base_demand, algo_price, anchor_price, elasticity, shock)

        actual_rev = actual_price * actual_pax
        algo_rev = algo_price * algo_pax

        days.append(
            {
                "date": dt.isoformat(),
                "dow": dow,
                "shock": shock,
                "actual": {"price": round(actual_price, 0), "pax": round(actual_pax, 0), "revenue": round(actual_rev, 2)},
                "algo": {"price": round(algo_price, 0), "pax": round(algo_pax, 0), "revenue": round(algo_rev, 2)},
                "regret": round(algo_rev - actual_rev, 2),
            }
        )

        dt += timedelta(days=1)

    booking_windows = [1, 3, 7, 14, 30]
    dows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    def synth_heat(mode: str) -> List[List[float]]:
        mat: List[List[float]] = []
        for dow in dows:
            row: List[float] = []
            base = {"Mon": 275, "Tue": 265, "Wed": 268, "Thu": 278, "Fri": 296, "Sat": 238, "Sun": 248}[dow]
            for w in booking_windows:
                adv = -1.25 * w
                team_gap = 9.0 if mode == "actual" else 0.0
                alg_adj = 0.0 if mode == "actual" else -6.0
                noise = rng.gauss(0, 3.5)
                price = base + adv + team_gap + alg_adj + noise
                row.append(round(_clamp(price, 200, 360), 0))
            mat.append(row)
        return mat

    heat_actual = synth_heat("actual")
    heat_algo = synth_heat("algo")

    # Narrative: top regret days
    top = sorted(days, key=lambda d: d["regret"], reverse=True)[:10]
    narrative: List[Dict[str, Any]] = []
    for d in top[:8]:
        shock = d["shock"]
        dow = d["dow"]
        reason = (
            "Demand shock day: the policy traded yield for share early in the booking window, then recaptured margin as load filled."
            if shock >= 0.5
            else f"{dow} business mix: the pricing team stayed sticky while the policy adjusted into the local elasticity sweet spot."
        )
        narrative.append(
            {
                "date": d["date"],
                "recommendedPrice": d["algo"]["price"],
                "actualPrice": d["actual"]["price"],
                "incrementalRevenue": round(d["regret"], 0),
                "incrementalTravelers": int(round(float(d["algo"]["pax"]) - float(d["actual"]["pax"]))),
                "reason": reason,
            }
        )

    competitor_aggr: List[float] = []
    for i, d in enumerate(days):
        base = 0.44 + 0.08 * math.sin(i / 5.5) + 0.21 * d["shock"] + rng.gauss(0, 0.045)
        competitor_aggr.append(round(_clamp(base, 0.18, 0.95), 3))

    booking_curve: List[Dict[str, Any]] = []
    max_window = float(max(booking_windows))
    for d in days:
        actual_pax = float(d["actual"]["pax"])
        algo_pax = float(d["algo"]["pax"])
        for w in booking_windows:
            progress = _clamp(1.0 - (float(w) / max_window), 0.0, 1.0)
            # Growth profile: fewer early bookings, steep ramp close to departure.
            actual_bookings = actual_pax * (0.16 + 0.84 * progress**0.72) * (0.98 + rng.gauss(0, 0.025))
            algo_bookings = algo_pax * (0.14 + 0.86 * progress**0.70) * (0.99 + rng.gauss(0, 0.02))
            booking_curve.append(
                {
                    "date": d["date"],
                    "window": w,
                    "actualBookings": round(max(0.0, actual_bookings), 0),
                    "algoBookings": round(max(0.0, algo_bookings), 0),
                }
            )

    shock_events: List[Dict[str, Any]] = []
    for d in days:
        if d["shock"] <= 0:
            continue
        severity, base_text = _shock_meta(float(d["shock"]))
        shock_events.append(
            {
                "date": d["date"],
                "severity": severity,
                "label": "Demand anomaly",
                "narrative": base_text,
            }
        )

    if not shock_events:
        for d in top[:3]:
            shock_events.append(
                {
                    "date": d["date"],
                    "severity": "low",
                    "label": "Regret spike",
                    "narrative": "No explicit shock marker was logged, but pricing regret materially exceeded the route baseline.",
                }
            )

    nash_states: List[Dict[str, Any]] = []
    ua_price = 286.0
    dl_price = 292.0
    for i in range(1, 21):
        exogenous = competitor_aggr[min(i - 1, len(competitor_aggr) - 1)]
        ua_target = _clamp(248.0 + 0.46 * dl_price + 8.0 * exogenous, 205.0, 355.0)
        dl_target = _clamp(242.0 + 0.48 * ua_price + 10.0 * exogenous, 205.0, 360.0)
        ua_price = 0.58 * ua_price + 0.42 * ua_target
        dl_price = 0.61 * dl_price + 0.39 * dl_target
        ua_share = _clamp(0.50 + (dl_price - ua_price) / 210.0 + rng.gauss(0, 0.012), 0.20, 0.80)
        dl_share = round(1.0 - ua_share, 3)
        synthetic_regret = max(0.0, (ua_target - ua_price) * 180.0)
        nash_states.append(
            {
                "dayIndex": i,
                "uaPrice": round(ua_price, 2),
                "dlPrice": round(dl_price, 2),
                "uaShare": round(ua_share, 3),
                "dlShare": dl_share,
                "regret": round(synthetic_regret, 2),
            }
        )

    convergence_day = len(nash_states)
    for state in nash_states:
        if abs(float(state["uaPrice"]) - float(state["dlPrice"])) <= 1.5:
            convergence_day = int(state["dayIndex"])
            break

    payload: Dict[str, Any] = {
        "route": {"origin": "ORD", "destination": "LGA"},
        "competitor": {
            "name": "Delta",
            "dailyAggressiveness": competitor_aggr,
            "inferredPolicyLabel": "price-match with lagged undercut on shock days",
        },
        "days": days,
        "heatmap": {
            "bookingWindows": booking_windows,
            "dows": dows,
            "actual": heat_actual,
            "algo": heat_algo,
        },
        "narrative": narrative,
        "bookingCurve": booking_curve,
        "shockEvents": shock_events,
        "nashSim": {
            "states": nash_states,
            "convergenceDay": convergence_day,
        },
    }

    return payload
