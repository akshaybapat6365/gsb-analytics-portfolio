# Audit Package Index

This folder contains the full repository audit deliverables.

- `00-exec-summary.md`: direct answer and top-level severity snapshot.
- `01-root-cause-tree.md`: architecture-level causes with evidence and closure decisions.
- `02-symptom-vs-root-matrix.md`: symptom-to-cause mapping for repeated regressions.
- `03-file-line-ledger.csv`: exhaustive file coverage + line-specific findings.
- `04-remediation-roadmap.md`: ordered execution roadmap to close root causes.
- `05-qa-gates.md`: objective acceptance gates for architecture, data, visual, and performance.

## Notes
- Scope intentionally excludes vendor/build directories (`node_modules`, `.next`, `.git`, `.venv`, temporary outputs).
- Ledger rows use `P0..P3` severities and `pass/warn/fail` status to support prioritization.
