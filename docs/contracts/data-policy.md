# Data Policy Contract

Supported policy modes:
- `strict-real`
- `baseline-fallback`
- `synthetic-demo`

Policy source of truth:
- runtime default from `NEXT_PUBLIC_DATA_POLICY_MODE`
- payload-level override via `payload.meta.policyMode`

Behavior rules:
- `strict-real`: required unavailable signals gate dependent decision modules
- `baseline-fallback`: unavailable live signals may reuse validated baseline values and must be marked as stale/fallback
- `synthetic-demo`: route is explicitly synthetic and must show synthetic provenance

Required metadata fields in `payload.meta`:
- `policyMode`
- `policyDecision`

UI rule:
- `RealSignalsPanel` must always render policy badge and mode-consistent messaging.
