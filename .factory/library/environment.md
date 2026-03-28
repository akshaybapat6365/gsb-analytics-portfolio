# Environment

Environment variables, external dependencies, and setup notes.

**What belongs here:** required runtimes, environment variables, public/open-data dependencies, install quirks, platform-specific setup notes.
**What does NOT belong here:** service ports/commands (use `.factory/services.yaml`).

---

- Runtime requirement: Node 20.20.0 via `nvm` in WSL.
- Python 3.12 is available and is required for the data-discovery/enrichment pipeline in `scripts/python/**`.
- Core install currently requires `npm install --legacy-peer-deps` under Node 20 because the repo still has peer-resolution issues under a plain `npm install`.
- Validation dry run proved local dev on port 3401 is reachable.
- Production build under Node 20 now succeeds after adding the missing DeckGL widgets dependency (`@deck.gl/widgets`).
- Playwright smoke validation now starts and runs against the built app on port 3501; remaining failures are route-contract/test expectation issues rather than the previous missing-dependency baseline blocker.
- Mission is restricted to open/public data sources only. Do not introduce paid or private APIs.
- Runtime data-policy modes already supported by the product: `strict-real`, `baseline-fallback`, `synthetic-demo`.
- Optional media generation paths require `REPLICATE_API_TOKEN`, but that path is out of scope for default milestone validation unless explicitly targeted.
