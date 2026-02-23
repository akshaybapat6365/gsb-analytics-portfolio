# ORD-LGA Validation Protocol

## Validation design
1. Temporal split (train/validation) over Q2 2023 daily route panel.
2. Baseline comparisons:
  - static baseline,
  - sticky reactive baseline,
  - policy model.
3. Error metrics:
  - MAE on revenue,
  - MAPE on revenue,
  - mean regret.

## Robustness
1. Ablation scenarios:
  - no competitor response,
  - no shock adjustment,
  - softened/static elasticity profile.
2. Sensitivity grid:
  - elasticity scaling range,
  - competitor reactivity scaling range.
3. Bootstrap uncertainty:
  - confidence intervals for lift, share impact, and regret.

## Research artifacts
Generated per run under `data/processed/ord-lga-price-war/`:
- `baselines_<runId>.json`
- `policy_model_<runId>.json`
- `ablation_<runId>.json`
- `sensitivity_<runId>.json`
- `validation_<runId>.json`
- `research_tables_<runId>.json`
