import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatPct } from "@/lib/metrics/format";
import type { FraudPayload } from "@/lib/schemas/fraud";

function monthsBetween(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const years = end.getUTCFullYear() - start.getUTCFullYear();
  const months = end.getUTCMonth() - start.getUTCMonth();
  return Math.max(0, years * 12 + months);
}

export function Hero({ payload }: { payload: FraudPayload }) {
  const latestIso = payload.filings.reduce((latest, filing) =>
    filing.filingDate > latest ? filing.filingDate : latest,
  payload.filings[0]?.filingDate ?? "1970-01-01");

  const leaders = [...payload.filings]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);

  const focusTicker = leaders[0]?.ticker ?? payload.filings[0]?.ticker ?? "";
  const history = payload.filings
    .filter((filing) => filing.ticker === focusTicker)
    .sort((a, b) => a.filingDate.localeCompare(b.filingDate))
    .slice(-18);

  const width = 820;
  const height = 220;
  const padX = 18;
  const padY = 18;
  const xStep = history.length > 1 ? (width - padX * 2) / (history.length - 1) : 0;
  const points = history.map((filing, idx) => {
    const x = padX + idx * xStep;
    const y = padY + (1 - filing.riskScore) * (height - padY * 2);
    return [x, y] as const;
  });
  const pathD = points
    .map(([x, y], idx) => `${idx === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-rose-300/20 bg-[#11090c]/80 p-6 sm:p-8">
      <ProjectBackdrop slug="fraud-radar" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(165deg,rgba(12,10,9,0.28),rgba(12,10,9,0.88)_52%,rgba(12,10,9,0.96)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(920px_520px_at_12%_14%,rgba(var(--p-accent),0.22),transparent_62%),radial-gradient(920px_480px_at_86%_10%,rgba(var(--p-accent2),0.14),transparent_64%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="crimson">Forensic Dossier</Chip>
            <Chip tone="neutral">SEC filing language + accounting</Chip>
            <Chip tone="neutral">Lead-time alerting board</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-rose-100/85">
            Project 02
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Fraud Radar:
            <br />
            <span className="text-rose-100">forensic pre-collapse signal board</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            Case-board composition of filing trajectories, deception index drift,
            and lead-time alerts before enforcement events hit the tape.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="border-b border-white/10 bg-white/5 px-4 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/85">
                Risk Sweep · {focusTicker || "n/a"}
              </p>
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full">
              <defs>
                <linearGradient id="fraudSweep" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(251,113,133,0.25)" />
                  <stop offset="55%" stopColor="rgba(244,63,94,0.8)" />
                  <stop offset="100%" stopColor="rgba(139,107,62,0.9)" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width={width} height={height} fill="rgba(0,0,0,0.15)" />
              {Array.from({ length: 7 }).map((_, row) => (
                <line
                  key={`h-${row}`}
                  x1={0}
                  y1={Math.round((row / 6) * height)}
                  x2={width}
                  y2={Math.round((row / 6) * height)}
                  stroke="rgba(182,169,151,0.14)"
                  strokeWidth="1"
                />
              ))}
              <path d={pathD || ""} fill="none" stroke="url(#fraudSweep)" strokeWidth="3" strokeLinecap="round" />
              {points.map(([x, y], idx) => (
                <circle
                  key={`p-${idx}`}
                  cx={x}
                  cy={y}
                  r={idx === points.length - 1 ? 4.8 : 3}
                  fill={idx === points.length - 1 ? "rgba(244,63,94,0.95)" : "rgba(182,169,151,0.75)"}
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-100/90">
            Case Board · Top Flags
          </p>
          <div className="mt-4 space-y-3">
            {leaders.map((filing, idx) => {
              const leadMonths = monthsBetween(filing.filingDate, latestIso);
              return (
                <article key={`${filing.ticker}-${filing.filingDate}`} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {idx + 1}. {filing.ticker}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{filing.filingDate}</p>
                    </div>
                    <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-100">
                      {leadMonths}m lead
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-base text-rose-100">
                    {formatPct(filing.riskScore, { digits: 0 })} risk
                  </p>
                  <p className="mt-1 text-xs text-slate-300">{filing.topSignals.slice(0, 2).join(" · ")}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
