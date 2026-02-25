import { Chip } from "@/components/ui/Chip";
import { RadarGrid } from "@/components/viz/ord-lga/RadarGrid";
import { formatPct, formatUSD } from "@/lib/metrics/format";
import type { AirlinePayload } from "@/lib/schemas/airline";

export function Hero({ payload }: { payload: AirlinePayload }) {
  const competitor = payload.competitor?.name ?? "Delta";
  const actual = payload.days.reduce((acc, day) => acc + day.actual.revenue, 0);
  const algo = payload.days.reduce((acc, day) => acc + day.algo.revenue, 0);
  const lift = algo - actual;
  const liftCi = payload.uncertainty?.revenueLiftCi;
  const shockCount = payload.days.filter((day) => day.shock > 0).length;
  const modeledShare = 0.5 + (lift / Math.max(actual, 1)) * 0.72;
  const lineage = payload.dataLineage;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0e1a] p-6 sm:p-10">
      {/* Radar grid background */}
      <RadarGrid width={1400} height={700} rings={6} radials={16} />

      {/* Sweep glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 25% 20%, rgba(201,150,43,0.06), transparent 60%), radial-gradient(ellipse 45% 55% at 80% 75%, rgba(62,221,143,0.04), transparent 60%)",
        }}
      />

      <div className="relative z-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-end">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="amber">Route War Room</Chip>
            <Chip tone="neutral">
              {payload.route.origin} → {payload.route.destination}
            </Chip>
            <Chip tone="neutral">Q2 2023</Chip>
            <Chip tone="neutral">{competitor} reaction modeled</Chip>
          </div>

          {/* Title — Space Grotesk */}
          <p className="radar-eyebrow mt-8">Project 01</p>
          <h1 className="radar-heading mt-3 max-w-4xl text-[40px] sm:text-[64px]">
            United vs.&nbsp;Delta:
            <br />
            <span style={{ color: "var(--radar-amber)" }}>
              ORD–LGA price war simulator
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300/90 sm:text-[17px]">
            Multi-agent pricing simulation with a DQN-style policy lens and
            inferred competitor response. Explore day-by-day counterfactual
            pricing, booking-window leakage, and equilibrium dynamics.
          </p>
        </div>

        {/* Mission Snapshot — HUD cards */}
        <div className="radar-panel p-5">
          <p className="radar-eyebrow">Mission Snapshot</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="radar-kpi">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                Observed Revenue
              </p>
              <p className="mt-1 font-mono text-lg text-slate-100">
                {formatUSD(actual)}
              </p>
            </div>
            <div className="radar-kpi radar-glow-green">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-green)" }}>
                Counterfactual Lift
              </p>
              <p className="mt-1 font-mono text-lg" style={{ color: "var(--radar-green)" }}>
                {formatUSD(lift)}
              </p>
            </div>
            <div className="radar-kpi">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-crimson)" }}>
                Shock Days
              </p>
              <p className="mt-1 font-mono text-lg" style={{ color: "var(--radar-crimson)" }}>
                {shockCount}
              </p>
            </div>
            <div className="radar-kpi radar-glow-amber">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-amber)" }}>
                Modeled Share
              </p>
              <p className="mt-1 font-mono text-lg" style={{ color: "var(--radar-amber)" }}>
                {formatPct(modeledShare, { digits: 1 })}
              </p>
            </div>
          </div>

          {/* Data lineage bar */}
          {lineage && (
            <div className="mt-4">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                Data Lineage
              </p>
              <div className="flex h-2 overflow-hidden rounded-full">
                <div
                  className="transition-all"
                  style={{
                    width: `${lineage.observedPct * 100}%`,
                    background: "var(--radar-green)",
                  }}
                  title={`Observed: ${Math.round(lineage.observedPct * 100)}%`}
                />
                <div
                  className="transition-all"
                  style={{
                    width: `${lineage.inferredPct * 100}%`,
                    background: "var(--radar-amber)",
                  }}
                  title={`Inferred: ${Math.round(lineage.inferredPct * 100)}%`}
                />
                <div
                  className="transition-all"
                  style={{
                    width: `${lineage.modeledPct * 100}%`,
                    background: "var(--radar-cyan)",
                  }}
                  title={`Modeled: ${Math.round(lineage.modeledPct * 100)}%`}
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[9px] text-slate-500">
                <span>obs {Math.round(lineage.observedPct * 100)}%</span>
                <span>inf {Math.round(lineage.inferredPct * 100)}%</span>
                <span>mod {Math.round(lineage.modeledPct * 100)}%</span>
              </div>
            </div>
          )}

          {/* CI strip */}
          <div className="mt-3 rounded-xl border border-white/[0.05] bg-black/25 p-3 text-xs">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
              Revenue Lift CI
            </p>
            <p className="mt-1 font-mono text-slate-300">
              {liftCi ? `${formatUSD(liftCi[0])} — ${formatUSD(liftCi[1])}` : "n/a"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
