# Architecture Contracts

This folder defines enforceable contracts for root-level architecture decisions.

## Contracts
- `route-composition.md`: canonical route structure per project.
- `data-policy.md`: strict vs fallback vs synthetic mode behavior.
- `typography.md`: approved font stack and usage constraints.
- `design-grammar.md`: module-level visual differentiation rules.
- `analytics-depth.md`: decision-engine and evidence-density requirements.
- `perf-budgets.md`: route-level performance targets and hard caps.
- `open-data-pipeline.md`: open-only parallel data discovery/enrichment/quality scoring contract.
- `agent-orchestration.md`: 6-project meta-agent hierarchy and visual-loop completion gates.

## Validation Scripts
- `scripts/contracts/check_route_contract.mjs`
- `scripts/contracts/check_data_policy_strings.mjs`
- `scripts/contracts/check_dead_paths.mjs`
- `scripts/contracts/check_token_semantics.mjs`
- `scripts/contracts/check_typography_contract.mjs`
