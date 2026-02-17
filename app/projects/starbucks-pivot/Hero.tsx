import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";

export function Hero({ payload }: { payload: StarbucksPayload }) {
  const counts = payload.stores.reduce<Record<string, number>>((acc, store) => {
    acc[store.recommendation] = (acc[store.recommendation] ?? 0) + 1;
    return acc;
  }, {});

  const totalDeltaProfitK = payload.stores.reduce((sum, store) => sum + store.deltaProfitK, 0);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-emerald-300/20 bg-[#08120d]/70 p-6 sm:p-8">
      <ProjectBackdrop slug="starbucks-pivot" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(155deg,rgba(2,6,23,0.2),rgba(2,6,23,0.85)_50%,rgba(2,6,23,0.92)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(780px_440px_at_16%_14%,rgba(var(--p-accent),0.22),transparent_62%),radial-gradient(760px_420px_at_84%_16%,rgba(var(--p-accent2),0.14),transparent_62%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="emerald">Geo Causal Lab</Chip>
            <Chip tone="neutral">Denver metro</Chip>
            <Chip tone="neutral">DiD portfolio surgery</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-emerald-100/85">
            Project 04
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Starbucks suburban pivot:
            <br />
            <span className="text-emerald-100">remote-work geo-analytics</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            A location-level decision system to convert, retrofit, or close
            stores based on post-COVID footfall shifts, commuting collapse, and
            WFH-driven demand migration.
          </p>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-100/85">
            Portfolio Snapshot
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/85">
                DiD ATE
              </p>
              <p className="mt-1 font-mono text-xl text-emerald-100">
                {formatPct(payload.did.ate, { digits: 0 })}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100/85">
                Convert Count
              </p>
              <p className="mt-1 font-mono text-xl text-cyan-100">
                {formatNumber(counts.Convert ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/85">
                Delta Profit
              </p>
              <p className="mt-1 font-mono text-xl text-amber-100">
                {formatUSD(totalDeltaProfitK * 1000)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
