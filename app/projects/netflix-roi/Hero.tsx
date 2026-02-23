import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { formatNumber, formatUSD } from "@/lib/metrics/format";
import type { NetflixPayload } from "@/lib/schemas/netflix";
import { cn } from "@/lib/cn";

export function Hero({ payload }: { payload: NetflixPayload }) {
  const titles = payload.titles
    .map((title) => ({
      ...title,
      roi: (title.acquisitionLtvM + title.retentionLtvM) / Math.max(1, title.costM),
    }))
    .sort((a, b) => b.roi - a.roi);

  const topWall = titles.slice(0, 6);
  const totalCost = payload.titles.reduce((sum, title) => sum + title.costM, 0);
  const totalAcq = payload.titles.reduce((sum, title) => sum + title.acquisitionLtvM, 0);
  const totalRetention = payload.titles.reduce((sum, title) => sum + title.retentionLtvM, 0);

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-slate-300/20 bg-[#100d0a]/80 p-6 sm:p-8">
      <ProjectBackdrop slug="netflix-roi" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(160deg,rgba(12,10,9,0.3),rgba(12,10,9,0.88)_50%,rgba(12,10,9,0.95)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(900px_520px_at_16%_12%,rgba(var(--p-accent),0.2),transparent_62%),radial-gradient(880px_500px_at_86%_16%,rgba(var(--p-accent2),0.18),transparent_64%)]" />

      <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="amber">Investment Committee Room</Chip>
            <Chip tone="neutral">Acquisition vs retention split</Chip>
            <Chip tone="neutral">Capital allocation frontier</Chip>
          </div>

          <p className="font-feature mt-6 text-xs uppercase tracking-[0.24em] text-amber-100/90">Project 06</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Netflix ROI Autopsy:
            <br />
            <span className="text-amber-100">capital committee decision deck</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90">
            Film-wall composition with ROI chips, split-value accounting, and
            a budget-envelope lens for greenlight sequencing.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {topWall.map((title, index) => (
              <article
                key={title.id}
                className={cn(
                  "rounded-2xl border border-white/10 bg-black/30 p-3",
                  index >= 4 && "hidden sm:block",
                )}
              >
                <p className="text-[15px] font-semibold leading-6 text-slate-100">{title.title}</p>
                <p className="mt-1 font-mono text-[12px] text-amber-100">{formatNumber(title.roi, { digits: 2 })}x ROI</p>
                <p className="mt-1 text-[12px] text-slate-300">Cost {formatUSD(title.costM * 1_000_000)}</p>
              </article>
            ))}
          </div>

          {topWall.length > 4 ? (
            <p className="mt-2 text-[12px] text-slate-400 sm:hidden">
              Showing top 4 titles on mobile. Open desktop view for the full wall.
            </p>
          ) : null}
        </div>

        <div className="neo-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">Capital Envelope Summary</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 sm:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/90">Total Slate Cost</p>
              <p className="mt-1 font-mono text-xl text-amber-100">{formatUSD(totalCost * 1_000_000)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-100/90">Acquisition Value</p>
              <p className="mt-1 font-mono text-xl text-emerald-100">{formatUSD(totalAcq * 1_000_000)}</p>
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-100/90">Retention Value</p>
              <p className="mt-1 font-mono text-xl text-rose-100">{formatUSD(totalRetention * 1_000_000)}</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-slate-300">
            <p>
              Acquisition/Retention split: <span className="font-mono text-amber-100">{formatNumber((totalAcq / Math.max(1, totalAcq + totalRetention)) * 100, { digits: 0 })}% / {formatNumber((totalRetention / Math.max(1, totalAcq + totalRetention)) * 100, { digits: 0 })}%</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
