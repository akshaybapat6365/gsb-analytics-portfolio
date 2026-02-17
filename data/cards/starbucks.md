# Starbucks Suburban Pivot — Data Card

## Status
Synthetic (default)

## What’s included
- Denver metro store points with WFH exposure and baseline performance
- Diff-in-Diff headline results (ATE + CI + pretrend p-value)
- A “surgery recommendation” label per store (Convert / Lockers / Close)

## Core assumptions (synthetic)
- WFH exposure is segment-driven (office > mixed > residential).
- Store traffic declines proportional to WFH exposure under scenarios.
- Recommendations are rule-based heuristics for demo purposes.

## Real-world swap
- SafeGraph/Placer patterns + Census commuting data (LODES)
- DID with robust standard errors and placebo checks

