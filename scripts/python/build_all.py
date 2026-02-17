from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PY_ROOT = ROOT / "scripts" / "python"
sys.path.insert(0, str(PY_ROOT))

from common.io import write_json  # noqa: E402

from airline.generate import generate_payload as generate_airline  # noqa: E402
from ev.generate import generate_payload as generate_ev  # noqa: E402
from fraud.generate import generate_payload as generate_fraud  # noqa: E402
from netflix.generate import generate_payload as generate_netflix  # noqa: E402
from shrink.generate import generate_payload as generate_shrink  # noqa: E402
from starbucks.generate import generate_payload as generate_starbucks  # noqa: E402


def main() -> None:
    outputs = [
        (ROOT / "public" / "data" / "airline" / "payload.json", generate_airline()),
        (ROOT / "public" / "data" / "fraud" / "payload.json", generate_fraud()),
        (ROOT / "public" / "data" / "shrink" / "payload.json", generate_shrink()),
        (ROOT / "public" / "data" / "starbucks" / "payload.json", generate_starbucks()),
        (ROOT / "public" / "data" / "ev" / "payload.json", generate_ev()),
        (ROOT / "public" / "data" / "netflix" / "payload.json", generate_netflix()),
    ]

    for path, payload in outputs:
        write_json(path, payload)
        rel = path.relative_to(ROOT)
        print(f"Wrote {rel}")


if __name__ == "__main__":
    main()

