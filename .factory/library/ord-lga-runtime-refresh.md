# ORD-LGA production-like runtime refresh note

When restarting the mission-owned Next.js runtime on port 3501 after a new build, also start a fresh browser session before validating `/projects/ord-lga-price-war`.

Why this matters:
- a stale browser session can keep requesting old `/_next/static/chunks/*` asset names from the previous build
- that shows up as repeated 500s for old chunk URLs and leaves the ORD-LGA lazy gate stuck on the loading placeholder
- a clean browser session against the restarted 3501 server loads the current chunk names, mounts the interactive sandbox, and exposes the deterministic `?routeProbe=loading` recovery surface correctly

Reproducible refresh workflow:
1. `source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && npm run build`
2. `PORT=3501 ./node_modules/.bin/next start --port 3501`
3. wait for `curl -sf http://localhost:3501` to succeed
4. open a fresh `agent-browser --session ...` session on `http://localhost:3501/projects/ord-lga-price-war`
5. scroll into the interactive chapter before judging the lazy gate state
6. open `http://localhost:3501/projects/ord-lga-price-war?routeProbe=loading` in that fresh session to verify the deterministic recoverability probe

Observed good runtime after refresh:
- listener on `:3501` served current chunk paths like `/_next/static/chunks/app/projects/ord-lga-price-war/page-5f414d369988c6c1.js`
- ORD-LGA lazy gate advanced from the loading placeholder into active controls after scrolling
- sliders, scenario buttons, and anomaly cards became reachable on the production-like runtime
- `?routeProbe=loading` showed the route-specific loading copy with recovery links (`Open live route`, `Back to projects`)
