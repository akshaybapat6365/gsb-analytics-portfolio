# Analytics Depth Contract

## Decision Engine Boundary
Presentation components must not embed core recommendation math.

Required location:
- `lib/decision-engines/<project>.ts`

Required output shape:
- `recommendationId`
- `primaryMetric`
- `counterfactualDelta`
- `confidenceBand`
- `drivers`
- `kpis`

## ViewModel Boundary
Viewmodels (`lib/viewmodels/*.ts`) are formatting adapters only.

Allowed:
- number/string formatting
- unit labels

Not allowed:
- heavy business logic or scenario optimization math.

## Evidence Density
Each project requires:
1. annotation rail entries tied to evidence references.
2. decision evidence panel entries with ranked drivers.
3. confidence context surfaced with recommendation outputs.

## Test Requirement
- decision-engine tests must assert finite numeric outputs and valid confidence bands.
- routes must still render `BLUF + Data Integrity + Decision Console` when partial real feeds are unavailable.
