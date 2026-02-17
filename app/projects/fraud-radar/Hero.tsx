import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatPct } from "@/lib/metrics/format";
import type { FraudPayload } from "@/lib/schemas/fraud";

export function Hero({ payload }: { payload: FraudPayload }) {
  const top = payload.filings.reduce((best, filing) => {
    if (!best) return filing;
    return filing.riskScore > best.riskScore ? filing : best;
  }, payload.filings[0]);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-rose-300/20 bg-[#11090c]/70 p-6 sm:p-8">
      <ProjectBackdrop slug="fraud-radar" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(165deg,rgba(2,6,23,0.34),rgba(2,6,23,0.88)_50%,rgba(2,6,23,0.94)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(760px_420px_at_16%_14%,rgba(var(--p-accent),0.20),transparent_64%),radial-gradient(720px_420px_at_84%_12%,rgba(var(--p-accent2),0.12),transparent_62%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="crimson">Forensic Radar</Chip>
            <Chip tone="neutral">2018-2024 filings</Chip>
            <Chip tone="neutral">Language + accounting signals</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-rose-100/85">
            Project 02
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Shorting Nikola:
            <br />
            <span className="text-rose-100">pre-collapse fraud radar</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            A forensic dashboard that combines Beneish-style accounting signals
            with filing-language anomalies to identify likely deception months
            before enforcement headlines.
          </p>
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-100/85">
            Dossier Snapshot
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-rose-300/25 bg-rose-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/85">
                Peak Risk Signal
              </p>
              <p className="mt-1 font-mono text-xl text-rose-100">
                {top ? formatPct(top.riskScore, { digits: 0 }) : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                {top ? `${top.ticker} · ${top.filingDate}` : "No filing rows"}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">
                Backtest Alpha
              </p>
              <p className="mt-1 font-mono text-xl text-emerald-100">
                {formatPct(payload.backtest.annualizedAlpha, { digits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
