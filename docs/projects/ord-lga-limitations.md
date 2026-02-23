# ORD-LGA Limitations

## Open-data limitation boundary
1. Route-level fare microstructure from private booking engines is not fully open.
2. Competitor tactical state is inferred from proxies, not direct internal desk logs.
3. Passenger demand is partially reconstructed from modeled elasticity relationships.

## Interpretation constraints
1. Counterfactual lift is model-based and uncertainty-bounded, not an observed historical fact.
2. Recommendation quality depends on calibration quality and shock labeling assumptions.
3. Deployment should include guardrails and live monitoring before operational rollout.

## Improvement path
1. Add richer open route-specific ticketing detail when legally available.
2. Incorporate better competitor timing signals.
3. Recalibrate with rolling windows and post-2023 regime changes.
