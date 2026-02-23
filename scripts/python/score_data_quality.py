from __future__ import annotations

import argparse
import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple


ROOT = Path(__file__).resolve().parents[2]
PY_ROOT = ROOT / "scripts" / "python"
if str(PY_ROOT) not in sys.path:
    sys.path.insert(0, str(PY_ROOT))

from common.io import write_json  # noqa: E402
from open_data_catalog import OPEN_DATA_CATALOG, project_slugs  # noqa: E402
from sources.common import now_iso  # noqa: E402


PROJECT_LIMITATIONS: Dict[str, List[str]] = {
    "ord-lga-price-war": [
        "Route-level fare microdata from consumer booking engines is mostly non-open; current route dynamics rely on modeled disaggregation.",
    ],
    "fraud-radar": [
        "Earnings-call transcript quality varies without licensed transcript feeds; filing text remains strongest open signal.",
    ],
    "target-shrink": [
        "High-quality public theft/CV labeled datasets are sparse; core event behavior remains partially modeled.",
    ],
    "starbucks-pivot": [
        "High-resolution commercial foot-traffic feeds are not open; commuting and market proxies dominate.",
    ],
    "tesla-nacs": [
        "Open datasets do not fully capture proprietary charger utilization and dynamic queue behavior.",
    ],
    "netflix-roi": [
        "Subscriber-level viewership and churn attribution data are largely commercial/restricted.",
    ],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compute project-level open-data quality scores and rankings.",
    )
    parser.add_argument(
        "--project",
        action="append",
        choices=project_slugs(),
        help="Project slug to score. Repeatable. Default: all projects.",
    )
    return parser.parse_args()


def _safe_load_json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _parse_as_of(value: str | None) -> date | None:
    if not value:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S"):
        try:
            dt = datetime.strptime(value, fmt)
            return dt.date()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
    except Exception:
        return None


def _signal_score(status: str) -> float:
    if status == "ok":
        return 1.0
    if status == "stale":
        return 0.6
    return 0.0


def _freshness_score_for_age(age_days: int) -> float:
    if age_days <= 7:
        return 100.0
    if age_days <= 30:
        return 90.0
    if age_days <= 90:
        return 75.0
    if age_days <= 365:
        return 55.0
    return 35.0


def _required_signals(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    all_signals = list(payload.get("realSignals") or [])
    return [signal for signal in all_signals if signal.get("required") is not False]


def _coverage_score(payload: Dict[str, Any]) -> float:
    required = _required_signals(payload)
    if not required:
        return 0.0
    return round(sum(_signal_score(str(s.get("status"))) for s in required) / len(required) * 100.0, 2)


def _freshness_score(payload: Dict[str, Any]) -> float:
    required = _required_signals(payload)
    if not required:
        return 0.0
    today = datetime.now(timezone.utc).date()
    values: List[float] = []
    for signal in required:
        provenance = signal.get("provenance") if isinstance(signal, dict) else {}
        as_of = None
        if isinstance(provenance, dict):
            as_of = provenance.get("asOf") or provenance.get("fetchedAt")
        parsed = _parse_as_of(str(as_of) if as_of else None)
        if parsed is None:
            values.append(45.0)
            continue
        age_days = max(0, (today - parsed).days)
        values.append(_freshness_score_for_age(age_days))
    return round(sum(values) / len(values), 2)


def _provenance_score(payload: Dict[str, Any]) -> float:
    required = _required_signals(payload)
    if not required:
        return 0.0
    values: List[float] = []
    for signal in required:
        provenance = signal.get("provenance") if isinstance(signal, dict) else {}
        if not isinstance(provenance, dict):
            values.append(0.0)
            continue
        has_source = bool(provenance.get("source"))
        has_fetched = bool(provenance.get("fetchedAt"))
        has_asof = bool(provenance.get("asOf"))
        score = 0.0
        score += 45.0 if has_source else 0.0
        score += 35.0 if has_fetched else 0.0
        score += 20.0 if has_asof else 0.0
        values.append(score)
    return round(sum(values) / len(values), 2)


def _ratio_score(value: int | float, target: int | float) -> float:
    if target <= 0:
        return 0.0
    return min(100.0, max(0.0, (float(value) / float(target)) * 100.0))


def _model_depth_score(project_slug: str, payload: Dict[str, Any]) -> float:
    if project_slug == "ord-lga-price-war":
        days = len(payload.get("days") or [])
        heat = payload.get("heatmap") or {}
        rows = len(heat.get("actual") or [])
        cols = len((heat.get("actual") or [[None]])[0] or []) if rows else 0
        shock_events = len(payload.get("shockEvents") or [])
        nash_states = len((payload.get("nashSim") or {}).get("states") or [])
        score = (
            0.35 * _ratio_score(days, 91)
            + 0.25 * _ratio_score(rows * cols, 35)
            + 0.20 * _ratio_score(shock_events, 6)
            + 0.20 * _ratio_score(nash_states, 20)
        )
        return round(score, 2)

    if project_slug == "fraud-radar":
        filings = len(payload.get("filings") or [])
        graph = payload.get("graph") or {}
        nodes = len(graph.get("nodes") or [])
        links = len(graph.get("links") or [])
        backtest_len = len((payload.get("backtest") or {}).get("dates") or [])
        score = (
            0.40 * _ratio_score(filings, 300)
            + 0.20 * _ratio_score(nodes, 12)
            + 0.20 * _ratio_score(links, 20)
            + 0.20 * _ratio_score(backtest_len, 72)
        )
        return round(score, 2)

    if project_slug == "target-shrink":
        events = len(payload.get("events") or [])
        zones = len((payload.get("store") or {}).get("zones") or [])
        outcomes = len((payload.get("policy") or {}).get("outcomes") or [])
        cameras = len(payload.get("initialCameras") or [])
        score = (
            0.35 * _ratio_score(events, 150)
            + 0.25 * _ratio_score(zones, 6)
            + 0.20 * _ratio_score(outcomes, 7)
            + 0.20 * _ratio_score(cameras, 4)
        )
        return round(score, 2)

    if project_slug == "starbucks-pivot":
        stores = len(payload.get("stores") or [])
        scenarios = len(payload.get("scenarios") or [])
        did = payload.get("did") or {}
        segments = len({str(s.get("segment")) for s in (payload.get("stores") or []) if s.get("segment")})
        did_score = 100.0 if all(key in did for key in ("ate", "ci", "pretrendP")) else 40.0
        score = (
            0.40 * _ratio_score(stores, 60)
            + 0.15 * _ratio_score(scenarios, 4)
            + 0.20 * _ratio_score(segments, 3)
            + 0.25 * did_score
        )
        return round(score, 2)

    if project_slug == "tesla-nacs":
        stations = len(payload.get("stations") or [])
        candidates = len(payload.get("candidateSites") or [])
        flows = len(payload.get("flows") or [])
        corridor = payload.get("corridor") or {}
        corridor_score = 100.0 if corridor.get("bounds") else 40.0
        score = (
            0.25 * _ratio_score(stations, 20)
            + 0.35 * _ratio_score(candidates, 8)
            + 0.25 * _ratio_score(flows, 40)
            + 0.15 * corridor_score
        )
        return round(score, 2)

    titles = len(payload.get("titles") or [])
    frontier = len(payload.get("paretoFrontier") or [])
    headline = payload.get("headline") or {}
    model = payload.get("model") or {}
    headline_score = (
        100.0
        if all(k in headline for k in ("dealCostM", "estimatedIncrementalAddsM", "ciAddsM", "retentionLiftPct"))
        else 40.0
    )
    model_score = 100.0 if all(k in model for k in ("acquisitionAddsCoeff", "retentionMonthsCoeff")) else 40.0
    score = (
        0.35 * _ratio_score(titles, 12)
        + 0.25 * _ratio_score(frontier, 6)
        + 0.20 * headline_score
        + 0.20 * model_score
    )
    return round(score, 2)


def _openness_score(project_slug: str) -> float:
    cfg = OPEN_DATA_CATALOG[project_slug]
    vals = [float(src["opennessScore"]) for src in cfg["sources"]]
    return round(sum(vals) / max(1, len(vals)), 2)


def _weighted_quality_score(project_slug: str, component_scores: Dict[str, float]) -> float:
    rubric = OPEN_DATA_CATALOG[project_slug]["qualityRubric"]
    total_weight = float(sum(rubric.values()))
    if total_weight <= 0:
        return 0.0
    weighted = sum(float(component_scores[key]) * float(weight) for key, weight in rubric.items())
    return round(weighted / total_weight, 2)


def _quality_tier(score: float) -> str:
    if score >= 90:
        return "excellent"
    if score >= 80:
        return "strong"
    if score >= 65:
        return "moderate"
    if score >= 50:
        return "limited"
    return "weak"


def _build_report(project_slug: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    coverage = _coverage_score(payload)
    freshness = _freshness_score(payload)
    model_depth = _model_depth_score(project_slug, payload)
    provenance = _provenance_score(payload)
    openness = _openness_score(project_slug)
    weighted_quality = _weighted_quality_score(
        project_slug,
        {
            "coverage": coverage,
            "freshness": freshness,
            "modelDepth": model_depth,
            "provenance": provenance,
        },
    )
    final_score = round(0.75 * weighted_quality + 0.25 * openness, 2)

    required_signals = _required_signals(payload)
    missing = [
        {
            "id": str(signal.get("id")),
            "status": str(signal.get("status")),
            "reasonCode": signal.get("reasonCode"),
        }
        for signal in required_signals
        if signal.get("status") != "ok"
    ]

    meta = payload.get("meta") or {}
    return {
        "projectSlug": project_slug,
        "projectTitle": OPEN_DATA_CATALOG[project_slug]["title"],
        "generatedAt": now_iso(),
        "runId": meta.get("runId"),
        "overallStatus": meta.get("overallStatus"),
        "scores": {
            "finalScore": final_score,
            "tier": _quality_tier(final_score),
            "weightedQuality": weighted_quality,
            "openDataAvailability": openness,
            "components": {
                "coverage": coverage,
                "freshness": freshness,
                "modelDepth": model_depth,
                "provenance": provenance,
            },
            "rubric": OPEN_DATA_CATALOG[project_slug]["qualityRubric"],
        },
        "signalSummary": {
            "requiredSignals": len(required_signals),
            "okRequiredSignals": sum(1 for signal in required_signals if signal.get("status") == "ok"),
            "staleRequiredSignals": sum(1 for signal in required_signals if signal.get("status") == "stale"),
            "unavailableRequiredSignals": sum(
                1 for signal in required_signals if signal.get("status") == "unavailable"
            ),
        },
        "knownLimitations": PROJECT_LIMITATIONS.get(project_slug, []),
        "missingOrStaleSignals": missing,
    }


def _load_project_payload(project_slug: str) -> Dict[str, Any]:
    data_dir = OPEN_DATA_CATALOG[project_slug]["dataDir"]
    payload_path = ROOT / "public" / "data" / data_dir / "payload.json"
    return _safe_load_json(payload_path)


def main() -> int:
    args = parse_args()
    selected = args.project or project_slugs()
    quality_root = ROOT / "data" / "quality"

    reports: List[Dict[str, Any]] = []
    for slug in selected:
        payload = _load_project_payload(slug)
        report = _build_report(slug, payload)
        reports.append(report)
        out_path = quality_root / slug / "quality_report.json"
        write_json(out_path, report)
        print(f"Wrote {out_path.relative_to(ROOT)} (score={report['scores']['finalScore']})")

    ranked = sorted(reports, key=lambda report: float(report["scores"]["finalScore"]), reverse=True)
    ranking_payload = {
        "generatedAt": now_iso(),
        "mode": "open-only",
        "ranking": [
            {
                "rank": idx + 1,
                "projectSlug": report["projectSlug"],
                "projectTitle": report["projectTitle"],
                "score": report["scores"]["finalScore"],
                "tier": report["scores"]["tier"],
            }
            for idx, report in enumerate(ranked)
        ],
    }
    write_json(quality_root / "rankings.json", ranking_payload)
    print(f"Wrote {(quality_root / 'rankings.json').relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
