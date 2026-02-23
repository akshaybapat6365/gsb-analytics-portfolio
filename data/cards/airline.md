# United vs. Delta (ORD–LGA) — Data Card

## Status
Mode-aware baseline payload (supports strict-real and baseline-fallback enrichment)

## What’s included
- Daily pricing, passengers, and revenue for Q2 2023 (2023-04-01 to 2023-06-30)
- A synthetic “algorithm” policy (revenue-optimizing in a discretized action space)
- A synthetic “human team” policy (sticky pricing with slow shock response)
- Booking-window x day-of-week price heatmaps
- A small set of narrative callouts (top incremental-revenue days)
- Validation artifacts (baselines, policy fit, ablation, sensitivity, uncertainty)

## Observed vs inferred vs modeled
- Observed:
  - FRED airfare CPI YoY (`fred:CUSR0000SETG01`)
  - UAL 30d return (`stooq:UAL`)
  - DAL 30d return (`stooq:DAL`)
  - route-day observed fare/revenue anchors in payload
- Inferred:
  - competitor aggressiveness proxy
  - shock markers and booking-window leakage indicators
- Modeled:
  - policy fares and policy passenger path
  - counterfactual revenue and regret surfaces
  - ablation and sensitivity scenario outputs

## Core assumptions (synthetic)
- Demand follows an isoelastic curve vs. price with a fixed elasticity.
- Rare demand shocks represent events/weather/ops and affect demand additively.
- The algorithm is treated as an upper-bound counterfactual (perfectly optimized under the synthetic model).

## Real-world swap
- DOT DB1B (route-level tickets) for calibration and seasonality
- True competitor response estimated from observed fare histories
- Higher-frequency fare observations for improved route microstructure fidelity
