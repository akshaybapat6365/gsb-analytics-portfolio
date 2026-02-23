from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any, Dict, List


ROOT = Path(__file__).resolve().parents[2]
PY_ROOT = ROOT / "scripts" / "python"
if str(PY_ROOT) not in sys.path:
    sys.path.insert(0, str(PY_ROOT))

from common.io import write_json  # noqa: E402
from open_data_catalog import OPEN_DATA_CATALOG, project_slugs  # noqa: E402
from sources.common import now_iso  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate open-data source manifests for each project.",
    )
    parser.add_argument(
        "--project",
        action="append",
        choices=project_slugs(),
        help="Project slug to process. Repeatable. Default: all projects.",
    )
    return parser.parse_args()


def _project_manifest(project_slug: str, discovered_at: str) -> Dict[str, Any]:
    cfg = OPEN_DATA_CATALOG[project_slug]
    sources: List[Dict[str, Any]] = []
    for src in cfg["sources"]:
        sources.append(
            {
                "id": src["id"],
                "label": src["label"],
                "sourceKey": src["sourceKey"],
                "url": src["url"],
                "kind": src["kind"],
                "opennessScore": src["opennessScore"],
                "expectedSignalIds": src.get("expectedSignalIds", []),
                "status": "configured",
            }
        )

    openness_avg = round(
        sum(float(src["opennessScore"]) for src in cfg["sources"]) / max(1, len(cfg["sources"])),
        2,
    )
    return {
        "projectSlug": project_slug,
        "projectTitle": cfg["title"],
        "mode": "open-only",
        "discoveredAt": discovered_at,
        "opennessPotentialScore": openness_avg,
        "qualityRubric": cfg["qualityRubric"],
        "sources": sources,
    }


def main() -> int:
    args = parse_args()
    discovered_at = now_iso()
    selected = args.project or project_slugs()
    provenance_root = ROOT / "data" / "provenance"

    index: Dict[str, Any] = {
        "mode": "open-only",
        "discoveredAt": discovered_at,
        "projects": {},
    }

    for slug in selected:
        manifest = _project_manifest(slug, discovered_at)
        out_path = provenance_root / slug / "sources.json"
        write_json(out_path, manifest)
        index["projects"][slug] = {
            "projectTitle": manifest["projectTitle"],
            "sourceCount": len(manifest["sources"]),
            "opennessPotentialScore": manifest["opennessPotentialScore"],
        }
        print(f"Wrote {out_path.relative_to(ROOT)}")

    write_json(provenance_root / "index.json", index)
    print(f"Wrote {(provenance_root / 'index.json').relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
