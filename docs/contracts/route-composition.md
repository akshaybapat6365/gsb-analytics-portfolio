# Route Composition Contract

Every project route must follow this canonical structure:

1. `page.tsx` (server payload load)
2. `Hero.tsx`
3. `BlufPanel`
4. `RealSignalsPanel`
5. `*Shell.tsx` (SSR chapter)
6. `InteractiveSection.tsx` -> lazy gate -> `*Interactive.tsx`
7. `AssumptionsDrawer`

Required files under `app/projects/<slug>/`:
- `page.tsx`
- `Hero.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- `<Slug>Shell.tsx`
- `<Slug>Interactive.tsx`
- `InteractiveSection.tsx`

Disallowed architectural drift:
- client-side payload fetch for primary payloads
- parallel unused route flows
- missing lazy gate for heavy interactive modules
