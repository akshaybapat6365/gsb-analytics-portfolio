# Target Shrink — Data Card

## Status
Mode-aware baseline payload (supports strict-real and baseline-fallback enrichment)

## What’s included
- Store layout with zones and theft-pressure levels
- Event stream (scan / sweep / barcode-switch) with posterior P(theft)
- A policy grid across thresholds with prevented loss, FP rate, and ROI

## Core assumptions (synthetic)
- Theft pressure drives both frequency and posterior confidence.
- Lower thresholds prevent more loss but increase false positives.
- ROI accounts for a simple amortized system cost plus FP costs.

## Real-world swap
- Incident data (LPRC or internal LP logs)
- CV model outputs (YOLO + temporal classifier) to estimate P(theft)
