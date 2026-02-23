import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";

export function Hero({ payload }: { payload: StarbucksPayload }) {
  const counts = payload.stores.reduce<Record<string, number>>((acc, store) => {
    acc[store.recommendation] = (acc[store.recommendation] ?? 0) + 1;
    return acc;
  }, {});

  const portfolioDelta = payload.stores.reduce((sum, store) => sum + store.deltaProfitK, 0);
  const officeExposure =
    payload.stores
      .filter((store) => store.segment === "office")
      .reduce((sum, store) => sum + store.wfhExposure, 0) /
    Math.max(1, payload.stores.filter((store) => store.segment === "office").length);
  const residentialExposure =
    payload.stores
      .filter((store) => store.segment === "residential")
      .reduce((sum, store) => sum + store.wfhExposure, 0) /
    Math.max(1, payload.stores.filter((store) => store.segment === "residential").length);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-emerald-300/20 bg-[#08120d]/80 p-6 sm:p-8">
      <ProjectBackdrop slug="starbucks-pivot" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(155deg,rgba(12,10,9,0.2),rgba(12,10,9,0.88)_52%,rgba(12,10,9,0.95)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(820px_500px_at_16%_14%,rgba(var(--p-accent),0.24),transparent_62%),radial-gradient(920px_520px_at_84%_12%,rgba(var(--p-accent2),0.16),transparent_64%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="emerald">Geo Portfolio Surgeon</Chip>
            <Chip tone="neutral">DiD + recommendation engine</Chip>
            <Chip tone="neutral">Commuter-collapse overlays</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-emerald-100/85">Project 04</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Starbucks Pivot:
            <br />
            <span className="text-emerald-100">geo-strategy operating board</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            Editorial map-first board that tracks office-district collapse versus
            suburban midday migration and outputs location-level surgery actions.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="border-b border-white/10 bg-white/5 px-4 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/85">Commuter Collapse Overlay</p>
            </div>
            <svg viewBox="0 0 860 220" className="h-[180px] w-full">
              <rect x="0" y="0" width="860" height="220" fill="rgba(0,0,0,0.15)" />
              <ellipse cx="220" cy="108" rx="165" ry="82" fill="rgba(157,49,49,0.2)" />
              <ellipse cx="622" cy="108" rx="165" ry="82" fill="rgba(73,95,69,0.2)" />
              <circle cx="220" cy="108" r="66" fill="none" stroke="rgba(251,113,133,0.58)" strokeWidth="2" strokeDasharray="6 7" />
              <circle cx="622" cy="108" r="66" fill="none" stroke="rgba(52,211,153,0.6)" strokeWidth="2" strokeDasharray="6 7" />
              <text x="128" y="50" fill="rgba(251,113,133,0.9)" fontSize="11">office district 8am collapse</text>
              <text x="543" y="50" fill="rgba(52,211,153,0.9)" fontSize="11">suburban midday surge</text>
              <line x1="304" y1="108" x2="538" y2="108" stroke="rgba(182,169,151,0.45)" strokeWidth="1.8" markerEnd="url(#arrow)" />
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0,0 10,4 0,8" fill="rgba(182,169,151,0.7)" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-100/90">Recommendation Composition</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/90">Convert</p>
              <p className="mt-1 font-mono text-xl text-amber-100">{formatNumber(counts.Convert ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">Lockers</p>
              <p className="mt-1 font-mono text-xl text-emerald-100">{formatNumber(counts.Lockers ?? 0)}</p>
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/90">Close</p>
              <p className="mt-1 font-mono text-xl text-rose-100">{formatNumber(counts.Close ?? 0)}</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-slate-300">
            <p>Portfolio delta: <span className="font-mono text-emerald-100">{formatUSD(portfolioDelta * 1000)}</span></p>
            <p className="mt-1">Office exposure: <span className="font-mono text-amber-100">{formatPct(officeExposure, { digits: 0 })}</span> · Residential: <span className="font-mono text-amber-100">{formatPct(residentialExposure, { digits: 0 })}</span></p>
            <p className="mt-1">DiD ATE: <span className="font-mono text-emerald-100">{formatPct(payload.did.ate, { digits: 0 })}</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
