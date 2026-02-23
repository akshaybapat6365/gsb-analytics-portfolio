# ORD-LGA Price War Methods

## Objective
Estimate counterfactual pricing performance for United on ORD-LGA in Q2 2023 under a constrained policy model with competitor reaction effects.

## Data contract
- `observed`: route-day price/revenue anchors and real external signals.
- `inferred`: transformed features such as shock intensity and competitor aggressiveness proxies.
- `modeled`: policy-simulated price, passenger response, and counterfactual revenue.

## Model families
1. Static baseline
  - constant fare equal to train-window average.
2. Sticky reactive baseline
  - high inertia rule with low competitor/shock responsiveness.
3. Policy model
  - bounded fare adjustments blending observed and algorithmic targets,
  - explicit competitor reactivity term,
  - explicit shock response term,
  - elasticity-constrained passenger response.

## Key constraints
- Fare bound: `[195, 365]`.
- Sticky lambda to prevent unrealistic day-over-day oscillation.
- Competitor reactivity clamped to avoid runaway dynamics.

## Optimization target
Maximize expected incremental revenue while preserving stable policy behavior under shock and competitor perturbations.
