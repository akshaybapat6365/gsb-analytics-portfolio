# Tesla NACS — Data Card

## Status
Mode-aware baseline payload (supports strict-real and baseline-fallback enrichment)

## What’s included
- Existing stations (brand + price) and candidate build sites
- Synthetic traffic flows rendered as path layers
- Per-site decision outputs: Ford capture %, cannibalization, capex, NPV

## Core assumptions (synthetic)
- NPV is a function of capex, capture, and cannibalization (stylized).
- Flows are illustrative and not calibrated to any real traffic feed.

## Real-world swap
- DOE AFDC station inventory + NREL demand models (EVI-Pro)
- Traffic + pricing from public sources / partnerships
