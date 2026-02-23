from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict


ROOT = Path(__file__).resolve().parents[3]
PY_ROOT = ROOT / "scripts" / "python"
if str(PY_ROOT) not in sys.path:
    sys.path.insert(0, str(PY_ROOT))

from airline.analysis_core import build_ord_lga_research_pack  # noqa: E402
from common.io import write_json  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run ORD-LGA ablation analysis.")
    parser.add_argument(
        "--payload",
        default=str(ROOT / "public" / "data" / "airline" / "payload.json"),
        help="Path to airline payload JSON.",
    )
    parser.add_argument(
        "--run-id",
        default=f"real-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        help="Run identifier used in output filename.",
    )
    return parser.parse_args()


def _load_json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    args = parse_args()
    payload = _load_json(Path(args.payload))
    pack = build_ord_lga_research_pack(payload)
    out = ROOT / "data" / "processed" / "ord-lga-price-war" / f"ablation_{args.run_id}.json"
    write_json(out, pack["ablationSummary"])
    print(f"Wrote {out.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
