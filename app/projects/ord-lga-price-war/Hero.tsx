import { Chip } from "@/components/ui/Chip";
import { RadarGrid } from "@/components/viz/ord-lga/RadarGrid";
import { formatUSD } from "@/lib/metrics/format";
import type { AirlinePayload } from "@/lib/schemas/airline";
import HeroFlightPath from "@/components/viz/ord-lga/HeroFlightPath";
import MiniSparkGrid from "@/components/viz/ord-lga/MiniSparkGrid";
import { derivePolicyDays } from "@/components/viz/ord-lga/transforms";
import { runAirlineDecisionEngine } from "@/lib/decision-engines/airline";

// Step 30: Restructured hero — 2-column layout with flight path + sparkline grid
export function Hero({ payload }: { payload: AirlinePayload }) {
  const competitor = payload.competitor?.name ?? "Delta";
  const decision = runAirlineDecisionEngine(payload);
  const lift = decision.primaryMetric.value;
  const riskAdjustedLift = decision.riskAdjustedLift ?? lift;
  const liftCi = payload.uncertainty?.revenueLiftCi;
  const lineage = payload.dataLineage;
  const policyContext = payload.competitor?.inferredPolicyLabel ?? "Modeled competitor response";

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

      <div className="relative z-10 space-y-10">
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
            Premium war-room replay of the United–Delta ORD–LGA fare fight. This
            route blends observed market anchors with inferred competitor behavior
            and a modeled pricing policy so reviewers can inspect where the
            recommendation is observed, inferred, and simulated before accepting
            the upside story.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            {lineage && (
              <div className="max-w-md rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                  Evidence Lineage
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
                <p className="mt-3 text-[12px] leading-6 text-slate-400">
                  Policy context: {policyContext}. Treat the modeled share and revenue uplift as
                  an uncertainty-bounded counterfactual, not direct historical truth.
                </p>
              </div>
            )}

            <div className="max-w-md rounded-2xl border border-white/[0.06] bg-black/25 p-4 text-xs">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                Uncertainty Envelope
              </p>
              <p className="mt-1 font-mono text-slate-300">
                {liftCi ? `${formatUSD(liftCi[0])} — ${formatUSD(liftCi[1])}` : "n/a"}
              </p>
              <p className="mt-3 text-[12px] leading-6 text-slate-400">
                Canonical baseline estimate: {formatUSD(lift)} modeled Q2 lift versus the observed desk, with {formatUSD(riskAdjustedLift)} risk-adjusted after uncertainty and validation penalties.
                Inspect the validation and sensitivity chapters before escalating to an
                aggressive policy rollout.
              </p>
            </div>
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
