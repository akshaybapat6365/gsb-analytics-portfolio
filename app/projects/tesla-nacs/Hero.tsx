import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatNumber, formatUSD } from "@/lib/metrics/format";
import type { EvPayload } from "@/lib/schemas/ev";

export function Hero({ payload }: { payload: EvPayload }) {
  const ranked = [...payload.candidateSites].sort((a, b) => b.npvM - a.npvM);
  const top = ranked[0];
  const bottom = ranked.at(-1);
  const buildCount = ranked.filter((site) => site.npvM >= 0).length;

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-amber-300/20 bg-[#0f0c0a]/82 p-6 sm:p-8">
      <ProjectBackdrop slug="tesla-nacs" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(158deg,rgba(12,10,9,0.22),rgba(12,10,9,0.86)_52%,rgba(12,10,9,0.95)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(960px_540px_at_14%_10%,rgba(var(--p-accent),0.2),transparent_60%),radial-gradient(980px_560px_at_86%_10%,rgba(var(--p-accent2),0.16),transparent_62%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
        <div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="amber">Infrastructure War Board</Chip>
            <Chip tone="neutral">Node build/hold/abandon planning</Chip>
            <Chip tone="neutral">Flow + cannibalization physics</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-amber-100/85">Project 05</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Tesla NACS War Board:
            <br />
            <span className="text-amber-100">corridor build-order simulator</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            Command view for I-5 network strategy with node-state chips, flow traces,
            and immediate NPV/cannibalization tradeoff visibility.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="border-b border-white/10 bg-white/5 px-4 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/85">Corridor Command View</p>
            </div>
            <svg viewBox="0 0 860 220" className="h-[180px] w-full">
              <rect x="0" y="0" width="860" height="220" fill="rgba(0,0,0,0.16)" />
              <path d="M50 160 C160 98, 260 122, 370 106 C510 90, 640 130, 812 92" fill="none" stroke="rgba(182,169,151,0.35)" strokeWidth="3" strokeDasharray="6 8" />
              {ranked.slice(0, 5).map((site, idx) => {
                const x = 100 + idx * 150;
                const y = 155 - (idx % 2) * 42;
                const good = site.npvM >= 0;
                return (
                  <g key={site.id}>
                    <circle cx={x} cy={y} r="9" fill={good ? "rgba(52,211,153,0.82)" : "rgba(251,113,133,0.82)"}>
                      <animate attributeName="r" values="8;11;8" dur={`${1.4 + idx * 0.2}s`} repeatCount="indefinite" />
                    </circle>
                    <text x={x + 14} y={y + 4} fill="rgba(226,232,240,0.9)" fontSize="10">{site.name}</text>
                  </g>
                );
              })}
              {Array.from({ length: 4 }).map((_, idx) => (
                <path
                  key={`flow-${idx}`}
                  d={`M${62 + idx * 12} 162 C${162 + idx * 22} 118, ${312 + idx * 24} 126, ${792 - idx * 8} 96`}
                  fill="none"
                  stroke="rgba(184,136,82,0.26)"
                  strokeWidth="1.4"
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">Node Status Chips</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-100">
              Build candidates {formatNumber(buildCount)}
            </span>
            <span className="rounded-full border border-amber-300/30 bg-amber-300/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-100">
              Hold candidates {formatNumber(payload.candidateSites.length - buildCount)}
            </span>
            <span className="rounded-full border border-rose-300/30 bg-rose-300/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-rose-100">
              Abandon watch {formatNumber(ranked.filter((site) => site.npvM < -0.5).length)}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">Best Node</p>
              <p className="mt-1 font-mono text-xl text-emerald-100">{top ? formatUSD(top.npvM * 1_000_000) : "—"}</p>
              <p className="mt-1 text-xs text-slate-300">{top?.name ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/90">Bottom Node</p>
              <p className="mt-1 font-mono text-xl text-rose-100">{bottom ? formatUSD(bottom.npvM * 1_000_000) : "—"}</p>
              <p className="mt-1 text-xs text-slate-300">{bottom?.name ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
