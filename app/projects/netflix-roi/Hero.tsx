import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatPct, formatUSD } from "@/lib/metrics/format";
import type { NetflixPayload } from "@/lib/schemas/netflix";

export function Hero({ payload }: { payload: NetflixPayload }) {
  const top = payload.titles.reduce((best, title) => {
    const score = (title.acquisitionLtvM + title.retentionLtvM) / Math.max(1, title.costM);
    const bestScore = (best.acquisitionLtvM + best.retentionLtvM) / Math.max(1, best.costM);
    return score >= bestScore ? title : best;
  }, payload.titles[0]);

  const totalCost = payload.titles.reduce((sum, title) => sum + title.costM, 0);
  const totalLtv = payload.titles.reduce(
    (sum, title) => sum + title.acquisitionLtvM + title.retentionLtvM,
    0,
  );

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-slate-300/20 bg-[#100d0a]/70 p-6 sm:p-8">
      <ProjectBackdrop slug="netflix-roi" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(160deg,rgba(2,6,23,0.3),rgba(2,6,23,0.86)_48%,rgba(2,6,23,0.92)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(820px_450px_at_16%_12%,rgba(var(--p-accent),0.18),transparent_62%),radial-gradient(820px_420px_at_86%_18%,rgba(var(--p-accent2),0.16),transparent_62%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="amber">Content Capital Board</Chip>
            <Chip tone="neutral">Synthetic control + BSTS</Chip>
            <Chip tone="neutral">Acquisition vs retention</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-amber-100/90">
            Project 06
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Netflix content bet:
            <br />
            <span className="text-amber-100">ROI autopsy and optimizer</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            Separate acquisition pull from retention gravity, map titles on a
            value frontier, and simulate greenlight decisions with explicit
            economic tradeoffs.
          </p>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">
            Slate Snapshot
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">
                Best Frontier
              </p>
              <p className="mt-1 font-mono text-xl text-emerald-100">
                {formatPct((top.acquisitionLtvM + top.retentionLtvM) / top.costM, { digits: 1 })}
              </p>
              <p className="mt-1 text-xs text-slate-300">{top.title}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100/90">
                Total Cost
              </p>
              <p className="mt-1 font-mono text-xl text-cyan-100">
                {formatUSD(totalCost * 1_000_000)}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/90">
                Total LTV
              </p>
              <p className="mt-1 font-mono text-xl text-amber-100">
                {formatUSD(totalLtv * 1_000_000)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
