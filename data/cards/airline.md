# United vs. Delta (ORD–LGA) — Data Card

## Status
Synthetic (default)

## What’s included
- Daily pricing, passengers, and revenue for Q2 2023 (2023-04-01 to 2023-06-30)
- A synthetic “algorithm” policy (revenue-optimizing in a discretized action space)
- A synthetic “human team” policy (sticky pricing with slow shock response)
- Booking-window x day-of-week price heatmaps
- A small set of narrative callouts (top incremental-revenue days)

## Core assumptions (synthetic)
- Demand follows an isoelastic curve vs. price with a fixed elasticity.
- Rare demand shocks represent events/weather/ops and affect demand additively.
- The algorithm is treated as an upper-bound counterfactual (perfectly optimized under the synthetic model).

## Real-world swap
- DOT DB1B (route-level tickets) for calibration and seasonality
- True competitor response estimated from observed fare histories

