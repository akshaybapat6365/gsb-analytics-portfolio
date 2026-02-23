from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, List, Tuple


ROOT = Path(__file__).resolve().parents[2]
PY_ROOT = ROOT / "scripts" / "python"
if str(PY_ROOT) not in sys.path:
    sys.path.insert(0, str(PY_ROOT))

from common.io import write_json  # noqa: E402
from sources.common import SourceResult, now_iso  # noqa: E402
from sources.dot_db1b import fetch_airfare_cpi_yoy  # noqa: E402
from sources.sec_edgar import fetch_recent_10k_10q_count  # noqa: E402
from sources.yahoo_price_proxy import fetch_stooq_return  # noqa: E402
from sources.doe_afdc import fetch_ca_ev_station_count, fetch_i5_corridor_station_count  # noqa: E402
from sources.census_lodes import fetch_denver_remote_work_share  # noqa: E402
from sources.google_trends import fetch_daily_trends_presence  # noqa: E402


ProjectBuilder = Callable[[], List[Dict[str, Any]]]

PROJECT_TO_DATA_DIR = {
    "ord-lga-price-war": "airline",
    "fraud-radar": "fraud",
    "target-shrink": "shrink",
    "starbucks-pivot": "starbucks",
    "tesla-nacs": "ev",
    "netflix-roi": "netflix",
}


def _signal(
    signal_id: str,
    label: str,
    result: SourceResult,
    unit: str | None = None,
    required: bool = True,
) -> Dict[str, Any]:
    status = "ok" if result.ok else "unavailable"
    signal: Dict[str, Any] = {
        "id": signal_id,
        "label": label,
        "status": status,
        "required": required,
    }
    if result.reason:
        signal["reasonCode"] = result.reason
    if result.value is not None and status == "ok":
        signal["value"] = result.value
    if unit:
        signal["unit"] = unit
    if result.note:
        signal["change"] = result.note
    if result.source:
        provenance: Dict[str, Any] = {
            "source": result.source,
            "fetchedAt": result.fetched_at or now_iso(),
        }
        if result.as_of:
            provenance["asOf"] = result.as_of
        if result.note:
            provenance["note"] = result.note
        signal["provenance"] = provenance
    return signal


def _baseline_signal_map(payload: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    baseline: Dict[str, Dict[str, Any]] = {}
    for raw in payload.get("realSignals", []):
        if isinstance(raw, dict) and raw.get("id"):
            baseline[str(raw["id"])] = raw
    return baseline


def _apply_stale_real_cache(
    signals: List[Dict[str, Any]],
    baseline_signals: Dict[str, Dict[str, Any]],
) -> List[Dict[str, Any]]:
    merged: List[Dict[str, Any]] = []

    for signal in signals:
        if signal.get("status") == "ok":
            merged.append(signal)
            continue

        baseline = baseline_signals.get(str(signal.get("id")), {})
        baseline_status = str(baseline.get("status") or "")
        has_cached_value = baseline.get("value") is not None and baseline_status in {"ok", "stale"}
        if not has_cached_value:
            merged.append(signal)
            continue

        reason = str(signal.get("reasonCode") or "live_feed_unavailable")
        patched = dict(signal)
        patched["status"] = "stale"
        patched["reasonCode"] = f"stale_real_cache:{reason}"

        if patched.get("value") is None and baseline.get("value") is not None:
            patched["value"] = str(baseline["value"])
        if patched.get("change") is None and baseline.get("change"):
            patched["change"] = str(baseline["change"])
        if patched.get("unit") is None and baseline.get("unit"):
            patched["unit"] = str(baseline["unit"])

        baseline_provenance = baseline.get("provenance")
        live_provenance = patched.get("provenance")
        if isinstance(baseline_provenance, dict):
            provenance = dict(baseline_provenance)
            note_parts = [str(provenance.get("note") or "").strip()]
            if isinstance(live_provenance, dict) and live_provenance.get("source"):
                note_parts.append(f"live source failed: {live_provenance['source']}")
            note_parts.append("reused last known real observation (stale cache)")
            provenance["note"] = "; ".join(part for part in note_parts if part)
            provenance["fetchedAt"] = now_iso()
            patched["provenance"] = provenance

        merged.append(patched)

    return merged


def _apply_baseline_fallback(
    signals: List[Dict[str, Any]],
    baseline_signals: Dict[str, Dict[str, Any]],
) -> List[Dict[str, Any]]:
    merged: List[Dict[str, Any]] = []

    for signal in signals:
        if signal.get("status") == "ok":
            merged.append(signal)
            continue

        baseline = baseline_signals.get(str(signal.get("id")), {})
        reason = str(signal.get("reasonCode") or "live_feed_unavailable")
        signal["status"] = "stale"
        signal["reasonCode"] = f"fallback_baseline:{reason}"

        if "value" not in signal and baseline.get("value") is not None:
            signal["value"] = str(baseline["value"])
        if "change" not in signal and baseline.get("change"):
            signal["change"] = str(baseline["change"])
        if "unit" not in signal and baseline.get("unit"):
            signal["unit"] = str(baseline["unit"])

        baseline_provenance = baseline.get("provenance")
        live_provenance = signal.get("provenance")
        if isinstance(baseline_provenance, dict):
            provenance = dict(baseline_provenance)
            note_parts = [str(provenance.get("note") or "").strip()]
            if isinstance(live_provenance, dict) and live_provenance.get("source"):
                note_parts.append(f"live source failed: {live_provenance['source']}")
            note_parts.append("using validated baseline fallback")
            provenance["note"] = "; ".join(part for part in note_parts if part)
            provenance["fetchedAt"] = now_iso()
            signal["provenance"] = provenance

        merged.append(signal)

    return merged


def _build_data_readiness(meta_modules: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    readiness: List[Dict[str, Any]] = []
    for module_id, module in meta_modules.items():
        status = str(module.get("status", "unavailable"))
        if status == "ok":
            readiness_status = "ready"
            coverage = 100
            missing: List[str] = []
        elif status == "stale":
            readiness_status = "partial"
            coverage = 60
            missing = [module_id]
        else:
            readiness_status = "blocked"
            coverage = 0
            missing = [module_id]

        provenance = module.get("provenance") if isinstance(module, dict) else None
        last_success = None
        if isinstance(provenance, dict):
            last_success = provenance.get("fetchedAt") or provenance.get("asOf")

        readiness.append(
            {
                "moduleId": module_id,
                "status": readiness_status,
                "realCoveragePct": coverage,
                "minRequiredSeries": [module_id],
                "missingSeries": missing,
                "lastSuccessfulRealRunAt": last_success,
            }
        )
    return readiness


def _signal_map(signals: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    return {str(s.get("id")): s for s in signals}


def _evidence_ref(signal: Dict[str, Any], series_id: str) -> Dict[str, Any]:
    provenance = signal.get("provenance") if isinstance(signal, dict) else {}
    if not isinstance(provenance, dict):
        provenance = {}
    ref: Dict[str, Any] = {
        "source": str(provenance.get("source") or "unknown"),
        "seriesId": series_id,
    }
    if provenance.get("asOf") is not None:
        ref["asOf"] = provenance.get("asOf")
    if signal.get("value") is not None:
        ref["value"] = signal.get("value")
    return ref


def _build_annotations(project_slug: str, payload: Dict[str, Any], signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    signal_lookup = _signal_map(signals)
    default_ref = _evidence_ref(next(iter(signal_lookup.values()), {}), "real_signal")
    annotations: List[Dict[str, Any]] = []

    if project_slug == "ord-lga-price-war":
        shock_events = payload.get("shockEvents") or []
        for idx, event in enumerate(shock_events[:3]):
            annotations.append(
                {
                    "id": f"ord-shock-{idx+1}",
                    "moduleId": "pricing-war-room",
                    "timestampOrIndex": str(event.get("date") or f"event-{idx+1}"),
                    "title": str(event.get("label") or "Demand shock event"),
                    "body": str(event.get("narrative") or "Route demand shock changed optimal counter-pricing."),
                    "type": "shock",
                    "evidenceRefs": [
                        _evidence_ref(signal_lookup.get("airfare_cpi_yoy", {}), "airfare_cpi_yoy"),
                        _evidence_ref(signal_lookup.get("ual_30d_return", {}), "ual_30d_return"),
                    ],
                }
            )

    elif project_slug == "fraud-radar":
        filings = sorted(payload.get("filings") or [], key=lambda f: float(f.get("riskScore", 0)), reverse=True)
        for idx, filing in enumerate(filings[:3]):
            annotations.append(
                {
                    "id": f"fraud-risk-{idx+1}",
                    "moduleId": "forensic-risk-timeline",
                    "timestampOrIndex": str(filing.get("filingDate") or f"filing-{idx+1}"),
                    "title": f"{filing.get('ticker', 'N/A')} risk spike",
                    "body": f"Risk score {round(float(filing.get('riskScore', 0))*100, 1)}% with deception marker intensity shift.",
                    "type": "anomaly",
                    "evidenceRefs": [
                        _evidence_ref(signal_lookup.get("spy_30d_return", {}), "spy_30d_return"),
                        _evidence_ref(signal_lookup.get("nkla_recent_10k_10q", {}), "nkla_recent_10k_10q"),
                    ],
                }
            )

    elif project_slug == "target-shrink":
        zones = sorted((payload.get("store") or {}).get("zones") or [], key=lambda z: float(z.get("theftPressure", 0)), reverse=True)
        for idx, zone in enumerate(zones[:3]):
            annotations.append(
                {
                    "id": f"shrink-zone-{idx+1}",
                    "moduleId": "zone-pressure-map",
                    "timestampOrIndex": f"zone-{zone.get('id', idx+1)}",
                    "title": f"{zone.get('name', 'Zone')} pressure hotspot",
                    "body": f"Theft pressure index {round(float(zone.get('theftPressure', 0))*100, 1)} drives threshold sensitivity.",
                    "type": "inflection",
                    "evidenceRefs": [
                        _evidence_ref(signal_lookup.get("tgt_30d_return", {}), "tgt_30d_return"),
                        _evidence_ref(signal_lookup.get("wmt_30d_return", {}), "wmt_30d_return"),
                    ],
                }
            )

    elif project_slug == "starbucks-pivot":
        stores = sorted(payload.get("stores") or [], key=lambda s: abs(float(s.get("deltaProfitK", 0))), reverse=True)
        for idx, store in enumerate(stores[:3]):
            annotations.append(
                {
                    "id": f"sbux-store-{idx+1}",
                    "moduleId": "portfolio-surgery-board",
                    "timestampOrIndex": str(store.get("id") or f"store-{idx+1}"),
                    "title": f"{store.get('name', 'Store')} recommendation pressure",
                    "body": f"{store.get('recommendation', 'Review')} scenario with delta profit {round(float(store.get('deltaProfitK', 0)), 1)}k.",
                    "type": "recommendation",
                    "evidenceRefs": [
                        _evidence_ref(signal_lookup.get("sbux_30d_return", {}), "sbux_30d_return"),
                        _evidence_ref(signal_lookup.get("denver_remote_share", {}), "denver_remote_share"),
                    ],
                }
            )

    elif project_slug == "tesla-nacs":
        sites = sorted(payload.get("candidateSites") or [], key=lambda s: float(s.get("npvM", 0)), reverse=True)
        for idx, site in enumerate(sites[:3]):
            annotations.append(
                {
                    "id": f"tesla-site-{idx+1}",
                    "moduleId": "corridor-economics-board",
                    "timestampOrIndex": str(site.get("id") or f"site-{idx+1}"),
                    "title": f"{site.get('name', 'Candidate')} strategic node",
                    "body": f"Baseline NPV {round(float(site.get('npvM', 0)), 2)}M with capture/cannibalization trade-offs.",
                    "type": "recommendation",
                    "evidenceRefs": [
                        _evidence_ref(signal_lookup.get("tsla_30d_return", {}), "tsla_30d_return"),
                        _evidence_ref(signal_lookup.get("i5_corridor_stations", {}), "i5_corridor_stations"),
                    ],
                }
            )

    elif project_slug == "netflix-roi":
        titles = sorted(
            payload.get("titles") or [],
            key=lambda t: float(t.get("retentionLtvM", 0)) + float(t.get("acquisitionLtvM", 0)) - float(t.get("costM", 0)),
            reverse=True,
        )
        for idx, title in enumerate(titles[:3]):
            net = float(title.get("retentionLtvM", 0)) + float(title.get("acquisitionLtvM", 0)) - float(title.get("costM", 0))
            annotations.append(
                {
                    "id": f"netflix-title-{idx+1}",
                    "moduleId": "content-allocation-frontier",
                    "timestampOrIndex": str(title.get("id") or f"title-{idx+1}"),
                    "title": f"{title.get('title', 'Title')} net contribution",
                    "body": f"Net modeled contribution {round(net, 1)}M under current acquisition-retention weighting.",
                    "type": "inflection",
                    "evidenceRefs": [
                        _evidence_ref(signal_lookup.get("nflx_30d_return", {}), "nflx_30d_return"),
                        _evidence_ref(signal_lookup.get("nflx_recent_10k_10q", {}), "nflx_recent_10k_10q"),
                    ],
                }
            )

    if not annotations:
        annotations.append(
            {
                "id": f"{project_slug}-default-1",
                "moduleId": "core-module",
                "timestampOrIndex": "snapshot",
                "title": "No project-specific annotation available",
                "body": "Add project-level annotation templates in pipeline for richer narrative evidence.",
                "type": "anomaly",
                "evidenceRefs": [default_ref],
            }
        )

    return annotations


def _build_decision_evidence(project_slug: str, payload: Dict[str, Any], signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    ok_signals = sum(1 for s in signals if s.get("status") == "ok")
    total_signals = max(1, len(signals))
    confidence = ok_signals / total_signals
    confidence_band = [round(max(0.1, confidence - 0.2), 2), round(min(0.98, confidence + 0.12), 2)]

    if project_slug == "ord-lga-price-war":
        actual = sum(float((d.get("actual") or {}).get("revenue", 0)) for d in payload.get("days", []))
        algo = sum(float((d.get("algo") or {}).get("revenue", 0)) for d in payload.get("days", []))
        delta = algo - actual
        return [
            {
                "recommendationId": "ord-price-policy",
                "drivers": ["booking-window elasticity", "competitor reactivity", "demand shock handling"],
                "counterfactualDelta": f"{delta:,.0f} revenue delta",
                "confidenceBand": confidence_band,
            }
        ]

    if project_slug == "fraud-radar":
        top = max((float(f.get("riskScore", 0)) for f in payload.get("filings", [])), default=0.0)
        return [
            {
                "recommendationId": "fraud-short-basket",
                "drivers": ["beneish-score drift", "deception marker slope", "similarity cluster weight"],
                "counterfactualDelta": f"{top*100:.1f}% peak risk score",
                "confidenceBand": confidence_band,
            }
        ]

    if project_slug == "target-shrink":
        best_roi = max((float(o.get("roi", 0)) for o in (payload.get("policy") or {}).get("outcomes", [])), default=0.0)
        return [
            {
                "recommendationId": "shrink-threshold-policy",
                "drivers": ["zone theft pressure", "false-positive cost", "event volume"],
                "counterfactualDelta": f"{best_roi:,.2f}x best ROI frontier point",
                "confidenceBand": confidence_band,
            }
        ]

    if project_slug == "starbucks-pivot":
        delta = sum(float(s.get("deltaProfitK", 0)) for s in payload.get("stores", []))
        return [
            {
                "recommendationId": "starbucks-portfolio-surgery",
                "drivers": ["wfh exposure", "segment mix", "store-level unit economics"],
                "counterfactualDelta": f"{delta:,.1f}k portfolio profit delta",
                "confidenceBand": confidence_band,
            }
        ]

    if project_slug == "tesla-nacs":
        best_npv = max((float(s.get("npvM", 0)) for s in payload.get("candidateSites", [])), default=0.0)
        return [
            {
                "recommendationId": "tesla-corridor-build-order",
                "drivers": ["site capture rate", "cannibalization", "capex multiplier"],
                "counterfactualDelta": f"{best_npv:,.2f}M top site NPV",
                "confidenceBand": confidence_band,
            }
        ]

    retention_lift = float((payload.get("headline") or {}).get("retentionLiftPct", 0))
    return [
        {
            "recommendationId": "netflix-content-allocation",
            "drivers": ["acquisition lift", "retention value", "content cost efficiency"],
            "counterfactualDelta": f"{retention_lift*100:.1f}% retention lift",
            "confidenceBand": confidence_band,
        }
    ]


def build_ord_lga() -> List[Dict[str, Any]]:
    return [
        _signal("airfare_cpi_yoy", "US airfare CPI YoY", fetch_airfare_cpi_yoy(), unit="%"),
        _signal("ual_30d_return", "UAL 30d return", fetch_stooq_return("UAL"), unit="%"),
        _signal("dal_30d_return", "DAL 30d return", fetch_stooq_return("DAL"), unit="%"),
    ]


def build_fraud() -> List[Dict[str, Any]]:
    return [
        _signal("spy_30d_return", "SPY 30d return", fetch_stooq_return("SPY"), unit="%"),
        _signal(
            "nkla_30d_return",
            "NKLA 30d return",
            fetch_stooq_return("NKLA"),
            unit="%",
            required=False,
        ),
        _signal(
            "nkla_recent_10k_10q",
            "NKLA 10-K/10-Q filings (365d)",
            fetch_recent_10k_10q_count("1731289"),
        ),
    ]


def build_shrink() -> List[Dict[str, Any]]:
    return [
        _signal("tgt_30d_return", "TGT 30d return", fetch_stooq_return("TGT"), unit="%"),
        _signal("wmt_30d_return", "WMT 30d return", fetch_stooq_return("WMT"), unit="%"),
    ]


def build_starbucks() -> List[Dict[str, Any]]:
    return [
        _signal("sbux_30d_return", "SBUX 30d return", fetch_stooq_return("SBUX"), unit="%"),
        _signal(
            "denver_remote_share",
            "Denver remote-work share",
            fetch_denver_remote_work_share(),
            unit="%",
        ),
    ]


def build_tesla() -> List[Dict[str, Any]]:
    return [
        _signal("tsla_30d_return", "TSLA 30d return", fetch_stooq_return("TSLA"), unit="%"),
        _signal("ca_ev_station_count", "CA public EV stations", fetch_ca_ev_station_count()),
        _signal("i5_corridor_stations", "I-5 corridor EV stations", fetch_i5_corridor_station_count()),
    ]


def build_netflix() -> List[Dict[str, Any]]:
    return [
        _signal("nflx_30d_return", "NFLX 30d return", fetch_stooq_return("NFLX"), unit="%"),
        _signal(
            "netflix_daily_trend_presence",
            "Google Trends daily presence (Netflix)",
            fetch_daily_trends_presence("netflix"),
            required=False,
        ),
        _signal(
            "nflx_recent_10k_10q",
            "NFLX 10-K/10-Q filings (365d)",
            fetch_recent_10k_10q_count("1065280"),
        ),
    ]


PROJECT_BUILDERS: Dict[str, ProjectBuilder] = {
    "ord-lga-price-war": build_ord_lga,
    "fraud-radar": build_fraud,
    "target-shrink": build_shrink,
    "starbucks-pivot": build_starbucks,
    "tesla-nacs": build_tesla,
    "netflix-roi": build_netflix,
}


def _overall_status(signals: List[Dict[str, Any]]) -> str:
    if not signals:
        return "unavailable"

    required_signals = [s for s in signals if s.get("required") is not False]
    status_source = required_signals if required_signals else signals
    statuses = [str(s.get("status")) for s in status_source]
    ok_count = sum(1 for status in statuses if status == "ok")
    stale_count = sum(1 for status in statuses if status == "stale")
    unavailable_count = sum(1 for status in statuses if status == "unavailable")

    if ok_count == len(status_source):
        return "ok"
    if unavailable_count == len(status_source):
        return "unavailable"
    if stale_count > 0 or unavailable_count > 0:
        return "stale"
    return "ok"


def _build_modules(signals: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    modules: Dict[str, Dict[str, Any]] = {}
    for s in signals:
        if s.get("required") is False:
            continue
        module_key = str(s["id"])
        provenance = s.get("provenance")
        block: Dict[str, Any] = {"status": s.get("status", "unavailable")}
        if s.get("reasonCode"):
            block["reasonCode"] = s.get("reasonCode")
        if provenance:
            block["provenance"] = provenance
        modules[module_key] = block
    return modules


def _load_json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def enrich_project(
    project_slug: str,
    run_id: str,
    generated_at: str,
    strict_real_only: bool = True,
    enable_stale_real_cache: bool = True,
) -> Tuple[Path, Dict[str, Any]]:
    if project_slug not in PROJECT_TO_DATA_DIR:
        raise ValueError(f"Unknown project: {project_slug}")

    data_dir = PROJECT_TO_DATA_DIR[project_slug]
    payload_path = ROOT / "public" / "data" / data_dir / "payload.json"
    payload = _load_json(payload_path)

    signals = PROJECT_BUILDERS[project_slug]()
    baseline_signals = _baseline_signal_map(payload)
    if strict_real_only:
        if enable_stale_real_cache:
            signals = _apply_stale_real_cache(signals, baseline_signals)
        for signal in signals:
            if signal.get("status") == "unavailable":
                signal.pop("value", None)
    else:
        signals = _apply_baseline_fallback(signals, baseline_signals)

    if strict_real_only:
        policy_mode = "strict-real"
        policy_decision = (
            "Strict real-feed mode with stale-real cache continuity."
            if enable_stale_real_cache
            else "Strict real-feed mode without stale cache reuse."
        )
    else:
        policy_mode = "baseline-fallback"
        policy_decision = "Baseline fallback mode: unavailable live feeds may reuse validated baseline values."

    meta = {
        "runId": run_id,
        "generatedAt": generated_at,
        "overallStatus": _overall_status(signals),
        "policyMode": policy_mode,
        "policyDecision": policy_decision,
        "modules": _build_modules(signals),
    }

    payload["meta"] = meta
    payload["realSignals"] = signals
    payload["dataReadiness"] = _build_data_readiness(meta["modules"])
    payload["annotations"] = _build_annotations(project_slug, payload, signals)
    payload["decisionEvidence"] = _build_decision_evidence(project_slug, payload, signals)
    return payload_path, payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Enrich payloads with real-feed signals, readiness, and annotation evidence.",
    )
    parser.add_argument(
        "--project",
        action="append",
        choices=sorted(PROJECT_TO_DATA_DIR.keys()),
        help="Project slug to enrich. Repeatable. Default: all projects.",
    )
    parser.add_argument(
        "--allow-baseline-fallback",
        action="store_true",
        default=False,
        help="Allow stale baseline values to fill unavailable live signals (strict real-only is default).",
    )
    parser.add_argument(
        "--disable-stale-real-cache",
        action="store_true",
        default=False,
        help="Disable reuse of last known real values when live calls fail.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    projects: Iterable[str] = args.project or PROJECT_TO_DATA_DIR.keys()
    run_id = f"real-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    generated_at = now_iso()
    run_summary: Dict[str, Any] = {
        "runId": run_id,
        "generatedAt": generated_at,
        "projects": {},
    }

    for slug in projects:
        payload_path, payload = enrich_project(
            slug,
            run_id=run_id,
            generated_at=generated_at,
            strict_real_only=not args.allow_baseline_fallback,
            enable_stale_real_cache=not args.disable_stale_real_cache,
        )
        write_json(payload_path, payload)
        data_dir = PROJECT_TO_DATA_DIR[slug]
        meta_path = ROOT / "public" / "data" / data_dir / "meta.json"
        write_json(meta_path, payload["meta"])
        run_summary["projects"][slug] = payload["meta"]["overallStatus"]
        print(f"Enriched {slug}: {payload_path.relative_to(ROOT)}")

    overall_status = "ok"
    if any(v == "unavailable" for v in run_summary["projects"].values()):
        overall_status = "unavailable"
    elif any(v == "stale" for v in run_summary["projects"].values()):
        overall_status = "stale"
    run_summary["overallStatus"] = overall_status

    write_json(ROOT / "public" / "data" / "_health.json", run_summary)
    write_json(ROOT / "public" / "data" / "_runs" / f"{run_id}.json", run_summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
