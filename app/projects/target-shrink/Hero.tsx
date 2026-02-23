import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { ShrinkPayload } from "@/lib/schemas/shrink";

export function Hero({ payload }: { payload: ShrinkPayload }) {
  const best = payload.policy.outcomes.reduce((current, outcome) => {
    if (!current) return outcome;
    return outcome.roi > current.roi ? outcome : current;
  }, payload.policy.outcomes[0]);

  const hotspots = [...payload.store.zones].sort((a, b) => b.theftPressure - a.theftPressure).slice(0, 4);
  const scale = 0.42;
  const width = Math.round(payload.store.width * scale);
  const height = Math.round(payload.store.height * scale);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-amber-300/20 bg-[#120f08]/80 p-6 sm:p-8">
      <ProjectBackdrop slug="target-shrink" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(170deg,rgba(12,10,9,0.3),rgba(12,10,9,0.88)_52%,rgba(12,10,9,0.96)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(860px_500px_at_14%_12%,rgba(var(--p-accent),0.22),transparent_62%),radial-gradient(840px_480px_at_82%_10%,rgba(var(--p-danger),0.14),transparent_64%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="amber">Operations Control Floor</Chip>
            <Chip tone="neutral">Threshold economics</Chip>
            <Chip tone="neutral">False-positive drag minimization</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-amber-100/85">Project 03</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Target Shrink Simulator:
            <br />
            <span className="text-amber-100">operations floor intervention engine</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            Zone pressure and stop-rule economics unified in one control room so
            intervention posture is tuned for net value, not classifier vanity.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="border-b border-white/10 bg-white/5 px-4 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/85">
                Live Zone Pressure Schematic
              </p>
            </div>
            <div className="p-3">
              <svg viewBox={`0 0 ${width} ${height}`} className="h-[190px] w-full">
                <rect x="0" y="0" width={width} height={height} rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(182,169,151,0.2)" />
                {payload.store.zones.map((zone, idx) => {
                  const x = Math.round(zone.x * scale);
                  const y = Math.round(zone.y * scale);
                  const w = Math.round(zone.w * scale);
                  const h = Math.round(zone.h * scale);
                  const pressure = Math.max(0, Math.min(1, zone.theftPressure));
                  return (
                    <g key={zone.id}>
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        rx="9"
                        fill={`rgba(${Math.round(88 + pressure * 134)},${Math.round(82 + pressure * 26)},${Math.round(56 + pressure * 36)},0.38)`}
                        stroke="rgba(255,255,255,0.14)"
                      />
                      {idx < 2 ? (
                        <circle cx={x + w - 14} cy={y + 14} r="6" fill="rgba(251,113,133,0.72)">
                          <animate attributeName="r" values="5;8;5" dur="1.8s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0.35;0.9" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                      ) : null}
                      <text x={x + 8} y={y + 16} fill="rgba(226,232,240,0.9)" fontSize="10">{zone.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">
            Threshold Economics Strip
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">Recommended Threshold</p>
              <p className="mt-1 font-mono text-xl text-emerald-100">{best ? formatPct(best.threshold, { digits: 0 }) : "—"}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/90">Best ROI</p>
              <p className="mt-1 font-mono text-xl text-amber-100">{best ? formatPct(best.roi, { digits: 0 }) : "—"}</p>
            </div>
            <div className="rounded-2xl border border-rose-300/25 bg-rose-300/10 p-3 sm:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/90">Monthly Net Economics Signal</p>
              <p className="mt-1 font-mono text-xl text-rose-100">{best ? formatUSD(best.preventedLoss - best.falsePositiveRate * payload.events.length * payload.economics.falsePositiveCost) : "—"}</p>
              <p className="mt-1 text-xs text-slate-300">Hot zones monitored: {formatNumber(hotspots.length)} · event volume {formatNumber(payload.events.length)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
