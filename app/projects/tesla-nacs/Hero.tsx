import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatNumber, formatUSD } from "@/lib/metrics/format";
import type { EvPayload } from "@/lib/schemas/ev";

export function Hero({ payload }: { payload: EvPayload }) {
  const best = payload.candidateSites.reduce((a, b) => (a.npvM >= b.npvM ? a : b));
  const worst = payload.candidateSites.reduce((a, b) => (a.npvM <= b.npvM ? a : b));

  const stationMix = payload.stations.reduce(
    (acc, station) => {
      acc[station.brand] = (acc[station.brand] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-cyan-300/20 bg-[#07101a]/70 p-6 sm:p-8">
      <ProjectBackdrop slug="tesla-nacs" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(158deg,rgba(2,6,23,0.24),rgba(2,6,23,0.84)_50%,rgba(2,6,23,0.92)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(900px_460px_at_15%_12%,rgba(var(--p-accent),0.22),transparent_60%),radial-gradient(900px_500px_at_84%_14%,rgba(var(--p-accent2),0.12),transparent_62%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
        <div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="cyan">Charging War Game</Chip>
            <Chip tone="neutral">I-5 corridor · {payload.corridor.name}</Chip>
            <Chip tone="neutral">Stackelberg + network effects</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-cyan-100/85">
            Project 05
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Tesla NACS gambit:
            <br />
            <span className="text-cyan-100">infrastructure game theory board</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            Simulate where to build, expand, or retreat charging infrastructure
            while balancing cross-brand capture, cannibalization, and capital
            efficiency along key desert zones.
          </p>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/90">
            Corridor Snapshot
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">
                Best NPV Node
              </p>
              <p className="mt-1 font-mono text-xl text-emerald-100">
                {formatUSD(best.npvM * 1_000_000)}
              </p>
              <p className="mt-1 text-xs text-slate-300">{best.name}</p>
            </div>
            <div className="rounded-2xl border border-rose-300/25 bg-rose-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/90">
                Worst NPV Node
              </p>
              <p className="mt-1 font-mono text-xl text-rose-100">
                {formatUSD(worst.npvM * 1_000_000)}
              </p>
              <p className="mt-1 text-xs text-slate-300">{worst.name}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100/90">
                Station Mix (T / EA / O)
              </p>
              <p className="mt-1 font-mono text-xl text-cyan-100">
                {formatNumber(stationMix.Tesla ?? 0)}/{formatNumber(stationMix.EA ?? 0)}/
                {formatNumber(stationMix.Other ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
