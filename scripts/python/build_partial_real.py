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


def _signal(signal_id: str, label: str, result: SourceResult, unit: str | None = None) -> Dict[str, Any]:
    status = "ok" if result.ok else "unavailable"
    signal: Dict[str, Any] = {
        "id": signal_id,
        "label": label,
        "status": status,
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


def build_ord_lga() -> List[Dict[str, Any]]:
    return [
        _signal("airfare_cpi_yoy", "US airfare CPI YoY", fetch_airfare_cpi_yoy(), unit="%"),
        _signal("ual_30d_return", "UAL 30d return", fetch_stooq_return("UAL"), unit="%"),
        _signal("dal_30d_return", "DAL 30d return", fetch_stooq_return("DAL"), unit="%"),
    ]


def build_fraud() -> List[Dict[str, Any]]:
    return [
        _signal("spy_30d_return", "SPY 30d return", fetch_stooq_return("SPY"), unit="%"),
        _signal("nkla_30d_return", "NKLA 30d return", fetch_stooq_return("NKLA"), unit="%"),
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

    statuses = [str(s.get("status")) for s in signals]
    ok_count = sum(1 for status in statuses if status == "ok")
    stale_count = sum(1 for status in statuses if status == "stale")
    unavailable_count = sum(1 for status in statuses if status == "unavailable")

    if ok_count == len(signals):
        return "ok"
    if unavailable_count == len(signals):
        return "unavailable"
    if stale_count > 0 or unavailable_count > 0:
        return "stale"
    return "ok"


def _build_modules(signals: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    modules: Dict[str, Dict[str, Any]] = {}
    for s in signals:
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
) -> Tuple[Path, Dict[str, Any]]:
    if project_slug not in PROJECT_TO_DATA_DIR:
        raise ValueError(f"Unknown project: {project_slug}")

    data_dir = PROJECT_TO_DATA_DIR[project_slug]
    payload_path = ROOT / "public" / "data" / data_dir / "payload.json"
    payload = _load_json(payload_path)

    signals = PROJECT_BUILDERS[project_slug]()
    if strict_real_only:
        for signal in signals:
            if signal.get("status") != "ok":
                signal.pop("value", None)

    meta = {
        "runId": run_id,
        "generatedAt": generated_at,
        "overallStatus": _overall_status(signals),
        "modules": _build_modules(signals),
    }

    payload["meta"] = meta
    payload["realSignals"] = signals
    return payload_path, payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Enrich existing payloads with strict real-only partial coverage signals.",
    )
    parser.add_argument(
        "--project",
        action="append",
        choices=sorted(PROJECT_TO_DATA_DIR.keys()),
        help="Project slug to enrich. Repeatable. Default: all projects.",
    )
    parser.add_argument(
        "--strict-real-only",
        action="store_true",
        default=True,
        help="Do not retain values for unavailable signals.",
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
            strict_real_only=args.strict_real_only,
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
