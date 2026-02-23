import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatPct, formatUSD } from "@/lib/metrics/format";
import type { AirlinePayload } from "@/lib/schemas/airline";

export function Hero({ payload }: { payload: AirlinePayload }) {
  const competitor = payload.competitor?.name ?? "Delta";
  const actual = payload.days.reduce((acc, day) => acc + day.actual.revenue, 0);
  const algo = payload.days.reduce((acc, day) => acc + day.algo.revenue, 0);
  const lift = algo - actual;
  const liftCi = payload.uncertainty?.revenueLiftCi;
  const avgShock =
    payload.days.reduce((acc, day) => acc + day.shock, 0) /
    Math.max(1, payload.days.length);
  const shockCount = payload.days.filter((day) => day.shock > 0).length;
  const modeledShare = 0.5 + lift / Math.max(actual, 1) * 0.72;
  const lineage = payload.dataLineage;

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-amber-300/20 bg-[#100d0a]/80 p-6 sm:p-8">
      <ProjectBackdrop slug="ord-lga-price-war" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(160deg,rgba(12,10,9,0.35),rgba(12,10,9,0.88)_48%,rgba(12,10,9,0.95)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(780px_460px_at_16%_12%,rgba(var(--p-accent),0.26),transparent_62%),radial-gradient(740px_420px_at_86%_18%,rgba(var(--p-warn),0.16),transparent_62%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="amber">Route War Room</Chip>
            <Chip tone="neutral">
              {payload.route.origin} → {payload.route.destination}
            </Chip>
            <Chip tone="neutral">Q2 2023</Chip>
            <Chip tone="neutral">{competitor} reaction modeled</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.28em] text-amber-100/85">
            Project 01
          </p>
          <h1 className="font-display mt-3 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-slate-50 sm:text-6xl">
            United vs. Delta:
            <br />
            <span className="text-amber-200">ORD–LGA price war simulator</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
            Multi-agent pricing simulation with a DQN-style policy lens and
            inferred competitor response. Explore day-by-day counterfactual pricing,
            booking-window leakage, and equilibrium dynamics.
          </p>
        </div>

        <div className="neo-panel relative p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/80">
            Mission Snapshot
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                Observed Revenue
              </p>
              <p className="mt-1 font-mono text-lg text-slate-100">{formatUSD(actual)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">
                Counterfactual Lift
              </p>
              <p className="mt-1 font-mono text-lg text-emerald-100">{formatUSD(lift)}</p>
            </div>
            <div className="rounded-2xl border border-rose-300/25 bg-rose-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/90">
                Shock Days
              </p>
              <p className="mt-1 font-mono text-lg text-rose-100">{shockCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/90">
                Modeled Share
              </p>
              <p className="mt-1 font-mono text-lg text-amber-100">
                {formatPct(modeledShare, { digits: 1 })}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Average shock intensity {avgShock.toFixed(2)}. The policy module
            reallocates price pressure toward high-elasticity windows instead of
            over-indexing on static fare desks.
          </p>
          <div className="mt-4 rounded-2xl border border-white/12 bg-black/20 p-3 text-xs text-slate-300">
            <p className="font-mono uppercase tracking-[0.16em] text-slate-400">
              Research signal quality
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <p>
                Revenue lift CI:{" "}
                <span className="font-mono text-amber-100">
                  {liftCi ? `${formatUSD(liftCi[0])} to ${formatUSD(liftCi[1])}` : "n/a"}
                </span>
              </p>
              <p>
                Lineage:{" "}
                <span className="font-mono text-slate-100">
                  {lineage
                    ? `obs ${Math.round(lineage.observedPct * 100)}% · inf ${Math.round(
                        lineage.inferredPct * 100,
                      )}% · mod ${Math.round(lineage.modeledPct * 100)}%`
                    : "n/a"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
