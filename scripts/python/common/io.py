from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Stable, reviewable output for git diffs.
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")

