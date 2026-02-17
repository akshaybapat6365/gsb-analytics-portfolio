from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

try:
    import requests  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    requests = None  # type: ignore

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MANIFEST_DIR = ROOT / "scripts" / "replicate" / "manifests"
POLL_INTERVAL_SECONDS = 2.0
WAIT_TIMEOUT_SECONDS = 20 * 60
REQ_TIMEOUT_SECONDS = 120
API_BASE = "https://api.replicate.com/v1"
MAX_CREATE_RETRIES = 30


def _load_manifest(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def _find_manifests(manifest_dir: Path, projects: Optional[set[str]]) -> List[Path]:
    manifests = sorted(manifest_dir.glob("*.json"))
    if not projects:
        return manifests

    selected: List[Path] = []
    for manifest in manifests:
        try:
            payload = _load_manifest(manifest)
        except (OSError, json.JSONDecodeError):
            continue

        manifest_project = str(payload.get("project", ""))
        if any(project == manifest_project for project in projects):
            selected.append(manifest)
    return selected


def _coerce_outputs(data: object) -> list[str]:
    if data is None:
        return []
    if isinstance(data, list):
        return [str(x) for x in data]
    return [str(data)]


def _safe_filename(name: str) -> str:
    return "".join(ch if ch.isalnum() or ch in "._-" else "-" for ch in name).strip("-")


def _pick_prediction_status(pred: dict[str, Any]) -> str:
    return str(pred.get("status", "")).lower()


def _fetch_json(url: str, headers: Dict[str, str]) -> Dict[str, Any]:
    response = requests.get(url, headers=headers, timeout=REQ_TIMEOUT_SECONDS)
    response.raise_for_status()
    payload: Dict[str, Any] = response.json()
    return payload


def create_and_wait_prediction(
    session: requests.Session,
    headers: Dict[str, str],
    model_owner: str,
    model_name: str,
    input_payload: Dict[str, Any],
) -> Dict[str, Any]:
    create_url = f"{API_BASE}/models/{model_owner}/{model_name}/predictions"
    create_resp: requests.Response
    for attempt in range(1, MAX_CREATE_RETRIES + 1):
        create_resp = session.post(
            create_url,
            headers=headers,
            json={"input": input_payload},
            timeout=REQ_TIMEOUT_SECONDS,
        )
        if create_resp.status_code != 429:
            break

        retry_after = 10
        try:
            payload = create_resp.json()
            retry_after = int(payload.get("retry_after", retry_after))
        except Exception:
            pass
        wait_for = max(2, min(retry_after + 1, 60))
        print(f"    throttled (429), retrying in {wait_for}s [attempt {attempt}/{MAX_CREATE_RETRIES}]")
        time.sleep(wait_for)
    else:
        details = create_resp.text[:400]
        raise RuntimeError(f"prediction create failed after retries: {details}")

    try:
        create_resp.raise_for_status()
    except requests.HTTPError as exc:
        details = create_resp.text[:400]
        raise RuntimeError(f"prediction create failed ({create_resp.status_code}): {details}") from exc

    prediction: Dict[str, Any] = create_resp.json()

    started = time.time()
    while _pick_prediction_status(prediction) not in {"succeeded", "failed", "canceled"}:
        url = prediction.get("urls", {}).get("get")
        if not url:
            break
        if time.time() - started > WAIT_TIMEOUT_SECONDS:
            raise TimeoutError("prediction timed out")
        time.sleep(POLL_INTERVAL_SECONDS)
        prediction = _fetch_json(url, headers)

    return prediction


def _download_file(session: requests.Session, url: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with session.get(url, stream=True, timeout=REQ_TIMEOUT_SECONDS) as response:
        response.raise_for_status()
        with path.open("wb") as f:
            for chunk in response.iter_content(chunk_size=1 << 15):
                if chunk:
                    f.write(chunk)


def _save_asset(session: requests.Session, session_headers: Dict[str, str], asset: Dict[str, Any], out_dir: Path) -> None:
    model = asset["model"]
    model_owner = str(model["owner"])
    model_name = str(model["name"])
    prompt_input = dict(asset.get("input", {}))
    prompt_input.setdefault("prompt", asset.get("prompt", ""))
    filename = _safe_filename(str(asset["filename"]))

    prediction = create_and_wait_prediction(session, session_headers, model_owner, model_name, prompt_input)

    status = _pick_prediction_status(prediction)
    if status != "succeeded":
        err = prediction.get("error")
        raise RuntimeError(f"prediction for {filename} failed: {err}")

    outputs = _coerce_outputs(prediction.get("output"))
    if not outputs:
        raise RuntimeError(f"prediction for {filename} returned no output")

    for index, output in enumerate(outputs, start=1):
        out_name = filename
        if len(outputs) > 1:
            stem = Path(filename).stem
            ext = Path(filename).suffix or ".png"
            out_name = f"{stem}-{index}{ext}"

        out_path = out_dir / out_name
        _download_file(session, output, out_path)


def run(manifest_dir: Path, projects: Optional[Iterable[str]], dry_run: bool = False, force: bool = False) -> int:
    token = os.environ.get("REPLICATE_API_TOKEN")
    if not token and not dry_run:
        print("REPLICATE_API_TOKEN not set. Set it in the environment and rerun.")
        return 2

    if not dry_run and requests is None:
        print("Missing Python dependency: requests")
        print("Install with: python3 -m pip install -r scripts/replicate/requirements.txt")
        return 3

    manifest_paths = _find_manifests(manifest_dir, set(projects) if projects else None)
    if not manifest_paths:
        print("No manifests found.")
        return 1

    headers: Dict[str, str] = {}
    if token:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    if dry_run:
        for path in manifest_paths:
            manifest_data = _load_manifest(path)
            project = str(manifest_data.get("project", path.stem))
            out_dir = ROOT / str(manifest_data.get("outputs_dir", f"public/assets/{project}"))
            assets = manifest_data.get("assets", [])
            print(f"Building assets for {project} ({len(assets)} files)")

            for asset in assets:
                filename = str(asset.get("filename", "asset.webp"))
                out_path = out_dir / _safe_filename(filename)
                print(f"DRY-RUN -> {out_path}")
        return 0

    assert requests is not None  # for type checkers
    with requests.Session() as session:
        for path in manifest_paths:
            manifest_data = _load_manifest(path)
            project = str(manifest_data.get("project", path.stem))
            out_dir = ROOT / str(manifest_data.get("outputs_dir", f"public/assets/{project}"))
            assets = manifest_data.get("assets", [])
            print(f"Building assets for {project} ({len(assets)} files)")

            for asset in assets:
                filename = str(asset.get("filename", "asset.webp"))
                out_path = out_dir / _safe_filename(filename)
                if dry_run:
                    print(f"DRY-RUN -> {out_path}")
                    continue
                if not force and out_path.exists() and out_path.stat().st_size > 0:
                    print(f"  exists, skipping: {out_path.relative_to(ROOT)}")
                    continue
                print(f"  generating: {filename}")
                _save_asset(session, headers, dict(asset), out_dir)
                if out_path.exists():
                    print(f"  saved: {out_path.relative_to(ROOT)}")
                else:
                    print(f"  done: {out_dir.relative_to(ROOT)}")

    return 0


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build portfolio visual assets from Replicate official models.",
    )
    parser.add_argument(
        "--manifest-dir",
        default=str(DEFAULT_MANIFEST_DIR),
        help="Directory containing asset manifests.",
    )
    parser.add_argument(
        "--project",
        action="append",
        help="Generate assets for a specific project slug. Repeatable.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Validate and print plan without API calls.")
    parser.add_argument("--force", action="store_true", help="Regenerate even if output files already exist.")
    return parser.parse_args()


def main() -> int:
    args = _parse_args()
    manifest_dir = Path(args.manifest_dir)
    if not manifest_dir.exists():
        print(f"Manifest dir not found: {manifest_dir}")
        return 1
    return run(manifest_dir=manifest_dir, projects=args.project, dry_run=args.dry_run, force=args.force)


if __name__ == "__main__":
    raise SystemExit(main())
