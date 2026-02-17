import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatPct, formatUSD } from "@/lib/metrics/format";
import type { ShrinkPayload } from "@/lib/schemas/shrink";

export function Hero({ payload }: { payload: ShrinkPayload }) {
  const best = payload.policy.outcomes.reduce((current, outcome) => {
    if (!current) return outcome;
    return outcome.roi > current.roi ? outcome : current;
  }, payload.policy.outcomes[0]);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-amber-300/20 bg-[#120f08]/70 p-6 sm:p-8">
      <ProjectBackdrop slug="target-shrink" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(170deg,rgba(2,6,23,0.3),rgba(2,6,23,0.86)_50%,rgba(2,6,23,0.94)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(740px_400px_at_15%_12%,rgba(var(--p-accent),0.20),transparent_64%),radial-gradient(800px_420px_at_84%_18%,rgba(var(--p-danger),0.16),transparent_62%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="amber">Loss Prevention Ops</Chip>
            <Chip tone="neutral">Bayesian threshold policy</Chip>
            <Chip tone="neutral">False-positive economics</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-amber-100/85">
            Project 03
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Target&apos;s shrink problem:
            <br />
            <span className="text-amber-100">detection policy optimizer</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            Optimize intervention timing, not raw model accuracy. The simulator
            balances prevented theft against LTV-weighted false-positive costs
            for per-store profitability.
          </p>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">
            Operations Snapshot
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">
                Best ROI
              </p>
              <p className="mt-1 font-mono text-xl text-emerald-100">
                {best ? formatPct(best.roi, { digits: 0 }) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/90">
                Optimal Threshold
              </p>
              <p className="mt-1 font-mono text-xl text-amber-100">
                {best ? formatPct(best.threshold, { digits: 0 }) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 sm:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/90">
                Prevented Loss (Per Store)
              </p>
              <p className="mt-1 font-mono text-xl text-rose-100">
                {best ? formatUSD(best.preventedLoss) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
