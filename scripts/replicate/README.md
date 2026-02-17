# Replicate Asset Pipeline

This project includes a lightweight generator for visual assets (hero graphics, map overlays,
storytelling diagrams) using Replicate official models.

Run:

```bash
export REPLICATE_API_TOKEN=<your-token>
python3 scripts/replicate/build_assets.py
```

Dry-run (no API calls, token not required):
```bash
python3 scripts/replicate/build_assets.py --dry-run
```

All generated files are written under `public/assets/<project>/`.
