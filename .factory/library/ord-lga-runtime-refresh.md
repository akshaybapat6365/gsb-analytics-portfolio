# ORD-LGA production-like runtime refresh note

When restarting the mission-owned Next.js runtime on port 3501 after a new build, also start a fresh browser session before validating `/projects/ord-lga-price-war`.

Why this matters:
- a stale browser session can keep requesting old `/_next/static/chunks/*` asset names from the previous build
- that shows up as repeated 500s for old chunk URLs and leaves the ORD-LGA lazy gate stuck on the loading placeholder
- a clean browser session against the restarted 3501 server loads the current chunk names, mounts the interactive sandbox, and exposes the deterministic `?routeProbe=loading` recovery surface correctly

Observed good runtime after refresh:
- listener on `:3501` served current chunk paths like `/_next/static/chunks/webpack-2ba3b061b76ab736.js`
- ORD-LGA lazy gate advanced from `data-state="idle"` to `data-state="active"` after scrolling
- scenario controls, later chapters, and the decision console became reachable on the production-like runtime
