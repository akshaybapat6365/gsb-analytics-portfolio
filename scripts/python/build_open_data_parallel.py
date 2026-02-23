from __future__ import annotations

import argparse
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple


ROOT = Path(__file__).resolve().parents[2]
PY_ROOT = ROOT / "scripts" / "python"
if str(PY_ROOT) not in sys.path:
    sys.path.insert(0, str(PY_ROOT))

from build_all import main as build_synthetic_payloads  # noqa: E402
from build_partial_real import enrich_project  # noqa: E402
from airline.analysis_core import build_ord_lga_research_pack  # noqa: E402
from common.io import write_json  # noqa: E402
from open_data_catalog import OPEN_DATA_CATALOG, project_slugs  # noqa: E402
from sources.common import now_iso  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Parallel open-data enrichment: fetch real signals, store raw/provenance artifacts, and emit payloads.",
    )
    parser.add_argument(
        "--project",
        action="append",
        choices=project_slugs(),
        help="Project slug to enrich. Repeatable. Default: all projects.",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=6,
        help="Max parallel workers (default: 6).",
    )
    parser.add_argument(
        "--allow-baseline-fallback",
        action="store_true",
        default=False,
        help="Allow baseline fallback for unavailable signals.",
    )
    parser.add_argument(
        "--disable-stale-real-cache",
        action="store_true",
        default=False,
        help="Disable stale real-cache reuse for strict-real mode.",
    )
    parser.add_argument(
        "--skip-synthetic-rebuild",
        action="store_true",
        default=False,
        help="Skip baseline synthetic payload regeneration before enrichment.",
    )
    return parser.parse_args()


def _status_rank(status: str) -> int:
    if status == "ok":
        return 2
    if status == "stale":
        return 1
    return 0


def _merge_signal_status(statuses: List[str]) -> str:
    if not statuses:
        return "reference"
    ranked = sorted(statuses, key=_status_rank)
    return ranked[0]


def _source_statuses(project_slug: str, signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    cfg = OPEN_DATA_CATALOG[project_slug]
    signal_map = {str(signal.get("id")): signal for signal in signals}
    statuses: List[Dict[str, Any]] = []

    for source in cfg["sources"]:
        expected = source.get("expectedSignalIds") or []
        matched_signals = [signal_map[sid] for sid in expected if sid in signal_map]
        merged = _merge_signal_status([str(s.get("status")) for s in matched_signals])
        statuses.append(
            {
                "id": source["id"],
                "sourceKey": source["sourceKey"],
                "label": source["label"],
                "url": source["url"],
                "kind": source["kind"],
                "status": merged,
                "expectedSignalIds": expected,
                "matchedSignalStatuses": [
                    {
                        "id": str(signal.get("id")),
                        "status": str(signal.get("status")),
                        "reasonCode": signal.get("reasonCode"),
                    }
                    for signal in matched_signals
                ],
                "opennessScore": source["opennessScore"],
            }
        )

    return statuses


def _write_project_artifacts(
    project_slug: str,
    run_id: str,
    generated_at: str,
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    cfg = OPEN_DATA_CATALOG[project_slug]
    signals = list(payload.get("realSignals") or [])
    meta = dict(payload.get("meta") or {})
    source_status = _source_statuses(project_slug, signals)

    raw_root = ROOT / "data" / "raw" / project_slug
    processed_root = ROOT / "data" / "processed" / project_slug
    provenance_root = ROOT / "data" / "provenance" / project_slug

    # Persist per-signal raw artifacts for this run.
    for signal in signals:
        signal_id = str(signal.get("id") or "unknown_signal")
        signal_key = signal_id.replace("/", "_")
        out_path = raw_root / signal_key / f"{run_id}.json"
        write_json(
            out_path,
            {
                "projectSlug": project_slug,
                "projectTitle": cfg["title"],
                "runId": run_id,
                "generatedAt": generated_at,
                "signal": signal,
            },
        )

    # Persist processed run snapshot.
    write_json(
        processed_root / f"real_signals_{run_id}.json",
        {
            "projectSlug": project_slug,
            "projectTitle": cfg["title"],
            "runId": run_id,
            "generatedAt": generated_at,
            "meta": meta,
            "signals": signals,
        },
    )

    # Persist provenance state.
    provenance_payload = {
        "projectSlug": project_slug,
        "projectTitle": cfg["title"],
        "mode": "open-only",
        "runId": run_id,
        "generatedAt": generated_at,
        "meta": meta,
        "sourceStatuses": source_status,
        "qualityRubric": cfg["qualityRubric"],
    }
    write_json(provenance_root / "latest.json", provenance_payload)
    write_json(provenance_root / "runs" / f"{run_id}.json", provenance_payload)

    return {
        "projectSlug": project_slug,
        "overallStatus": str(meta.get("overallStatus", "unavailable")),
        "signalCount": len(signals),
        "okSignals": sum(1 for signal in signals if signal.get("status") == "ok"),
        "staleSignals": sum(1 for signal in signals if signal.get("status") == "stale"),
        "unavailableSignals": sum(1 for signal in signals if signal.get("status") == "unavailable"),
        "sourceStatuses": source_status,
    }


def _run_project(
    project_slug: str,
    run_id: str,
    generated_at: str,
    allow_baseline_fallback: bool,
    disable_stale_real_cache: bool,
) -> Dict[str, Any]:
    payload_path, payload = enrich_project(
        project_slug,
        run_id=run_id,
        generated_at=generated_at,
        strict_real_only=not allow_baseline_fallback,
        enable_stale_real_cache=not disable_stale_real_cache,
    )

    if project_slug == "ord-lga-price-war":
        research_pack = build_ord_lga_research_pack(payload)
        payload["methodMeta"] = research_pack["methodMeta"]
        payload["dataLineage"] = research_pack["dataLineage"]
        payload["validationSummary"] = research_pack["validationSummary"]
        payload["ablationSummary"] = research_pack["ablationSummary"]
        payload["sensitivitySummary"] = research_pack["sensitivitySummary"]
        payload["uncertainty"] = research_pack["uncertainty"]

        processed_root = ROOT / "data" / "processed" / "ord-lga-price-war"
        write_json(processed_root / f"baselines_{run_id}.json", research_pack["baselines"])
        write_json(processed_root / f"policy_model_{run_id}.json", research_pack["policyModel"])
        write_json(processed_root / f"ablation_{run_id}.json", research_pack["ablationSummary"])
        write_json(processed_root / f"sensitivity_{run_id}.json", research_pack["sensitivitySummary"])
        write_json(processed_root / f"validation_{run_id}.json", research_pack["validationSummary"])
        write_json(processed_root / f"research_tables_{run_id}.json", research_pack["researchTables"])

    data_dir = OPEN_DATA_CATALOG[project_slug]["dataDir"]
    meta_path = ROOT / "public" / "data" / data_dir / "meta.json"
    write_json(payload_path, payload)
    write_json(meta_path, payload["meta"])

    summary = _write_project_artifacts(
        project_slug=project_slug,
        run_id=run_id,
        generated_at=generated_at,
        payload=payload,
    )
    summary["payloadPath"] = str(payload_path.relative_to(ROOT))
    summary["metaPath"] = str(meta_path.relative_to(ROOT))
    return summary


def _overall_status(project_summaries: Iterable[Dict[str, Any]]) -> str:
    statuses = [str(summary.get("overallStatus")) for summary in project_summaries]
    if any(status == "unavailable" for status in statuses):
        return "unavailable"
    if any(status == "stale" for status in statuses):
        return "stale"
    return "ok"


def main() -> int:
    args = parse_args()
    selected = args.project or project_slugs()
    run_id = f"real-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    generated_at = now_iso()

    if not args.skip_synthetic_rebuild:
        print("Rebuilding baseline synthetic payloads...")
        build_synthetic_payloads()

    workers = max(1, min(args.workers, len(selected)))
    print(f"Running open-data enrichment in parallel ({workers} workers)...")

    project_results: Dict[str, Dict[str, Any]] = {}
    failures: Dict[str, str] = {}

    with ThreadPoolExecutor(max_workers=workers) as executor:
        future_map = {
            executor.submit(
                _run_project,
                slug,
                run_id,
                generated_at,
                args.allow_baseline_fallback,
                args.disable_stale_real_cache,
            ): slug
            for slug in selected
        }

        for future in as_completed(future_map):
            slug = future_map[future]
            try:
                result = future.result()
                project_results[slug] = result
                print(
                    f"Enriched {slug}: {result['overallStatus']} "
                    f"(ok={result['okSignals']} stale={result['staleSignals']} unavailable={result['unavailableSignals']})",
                )
            except Exception as exc:  # pragma: no cover - integration/network path
                failures[slug] = f"{type(exc).__name__}: {exc}"
                print(f"FAILED {slug}: {failures[slug]}")

    run_summary: Dict[str, Any] = {
        "runId": run_id,
        "generatedAt": generated_at,
        "mode": "open-only",
        "projects": {
            slug: {
                "overallStatus": project_results.get(slug, {}).get("overallStatus", "unavailable"),
                "signalCount": project_results.get(slug, {}).get("signalCount", 0),
                "okSignals": project_results.get(slug, {}).get("okSignals", 0),
                "staleSignals": project_results.get(slug, {}).get("staleSignals", 0),
                "unavailableSignals": project_results.get(slug, {}).get("unavailableSignals", 0),
            }
            for slug in selected
        },
        "failures": failures,
    }
    run_summary["overallStatus"] = _overall_status(project_results.values()) if project_results else "unavailable"
    if failures:
        run_summary["overallStatus"] = "unavailable"

    write_json(ROOT / "public" / "data" / "_health.json", run_summary)
    write_json(ROOT / "public" / "data" / "_runs" / f"{run_id}.json", run_summary)
    write_json(ROOT / "data" / "processed" / "_runs" / f"{run_id}.json", run_summary)

    if failures:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
