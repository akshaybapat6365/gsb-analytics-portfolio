import { Chip } from "@/components/ui/Chip";
import { RadarGrid } from "@/components/viz/ord-lga/RadarGrid";
import { formatPct, formatUSD } from "@/lib/metrics/format";
import type { AirlinePayload } from "@/lib/schemas/airline";
import HeroFlightPath from "@/components/viz/ord-lga/HeroFlightPath";
import MiniSparkGrid from "@/components/viz/ord-lga/MiniSparkGrid";
import { derivePolicyDays } from "@/components/viz/ord-lga/transforms";

// Step 30: Restructured hero — 2-column layout with flight path + sparkline grid
export function Hero({ payload }: { payload: AirlinePayload }) {
  const competitor = payload.competitor?.name ?? "Delta";
  const actual = payload.days.reduce((acc, day) => acc + day.actual.revenue, 0);
  const algo = payload.days.reduce((acc, day) => acc + day.algo.revenue, 0);
  const lift = algo - actual;
  const liftCi = payload.uncertainty?.revenueLiftCi;
  const lineage = payload.dataLineage;

  // Derive rows for sparks
  const rows = derivePolicyDays(payload, 64, 58);

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

      <div className="relative z-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
        {/* Left column: Title + Subtitle + Methodology badges */}
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
          <h1 className="radar-heading mt-3 max-w-4xl text-[40px] sm:text-[56px]" style={{ letterSpacing: "-0.03em" }}>
            United vs.&nbsp;Delta:
            <br />
            <span style={{ color: "var(--radar-amber)" }}>
              ORD–LGA price war simulator
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300/90 sm:text-[16px]">
            Multi-agent pricing simulation with a DQN-style policy lens and
            inferred competitor response. Explore day-by-day counterfactual
            pricing, booking-window leakage, and equilibrium dynamics.
          </p>

          {/* Data lineage bar */}
          {lineage && (
            <div className="mt-6 max-w-md">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                Data Lineage
              </p>
              <div className="flex h-2 overflow-hidden rounded-full">
                <div className="transition-all" style={{ width: `${lineage.observedPct * 100}%`, background: "var(--radar-green)" }} title={`Observed: ${Math.round(lineage.observedPct * 100)}%`} />
                <div className="transition-all" style={{ width: `${lineage.inferredPct * 100}%`, background: "var(--radar-amber)" }} title={`Inferred: ${Math.round(lineage.inferredPct * 100)}%`} />
                <div className="transition-all" style={{ width: `${lineage.modeledPct * 100}%`, background: "var(--radar-cyan)" }} title={`Modeled: ${Math.round(lineage.modeledPct * 100)}%`} />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[9px] text-slate-500">
                <span>obs {Math.round(lineage.observedPct * 100)}%</span>
                <span>inf {Math.round(lineage.inferredPct * 100)}%</span>
                <span>mod {Math.round(lineage.modeledPct * 100)}%</span>
              </div>
            </div>
          )}

          {/* CI strip */}
          <div className="mt-4 max-w-md rounded-xl border border-white/[0.05] bg-black/25 p-3 text-xs">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
              Revenue Lift CI
            </p>
            <p className="mt-1 font-mono text-slate-300">
              {liftCi ? `${formatUSD(liftCi[0])} — ${formatUSD(liftCi[1])}` : "n/a"}
            </p>
          </div>
        </div>

        {/* Right column: Flight path + Sparkline grid */}
        <div className="flex flex-col gap-5">
          {/* Flight path animation */}
          <div className="radar-panel p-4" style={{ background: "rgba(10,14,26,0.6)" }}>
            <HeroFlightPath liftAmount={lift} />
          </div>

          {/* Mini sparkline grid */}
          <MiniSparkGrid rows={rows} payload={payload} />
        </div>
      </div>
    </section>
  );
}
