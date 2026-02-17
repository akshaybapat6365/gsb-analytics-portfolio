import type { PayloadMeta, RealSignal } from "@/lib/schemas/common";
import { DataBadge } from "@/components/story/DataBadge";
import { ProvenanceTooltip } from "@/components/story/ProvenanceTooltip";
import type { DataStatus } from "@/lib/schemas/common";

type RealSignalsPanelProps = {
  title?: string;
  meta?: PayloadMeta;
  signals?: RealSignal[];
};

type ModuleEntry = {
  id: string;
  status: DataStatus;
  reasonCode?: string;
  provenance?: RealSignal["provenance"];
};

function prettyLabel(id: string) {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function moduleToSignal(entry: ModuleEntry): RealSignal {
  return {
    id: entry.id,
    label: prettyLabel(entry.id),
    status: entry.status,
    reasonCode: entry.reasonCode,
    provenance: entry.provenance,
  };
}

export function RealSignalsPanel({
  title = "Real Data Coverage",
  meta,
  signals = [],
}: RealSignalsPanelProps) {
  const overallStatus = meta?.overallStatus ?? "stale";
  const moduleEntries: ModuleEntry[] = Object.entries(meta?.modules ?? {}).map(
    ([id, entry]) => ({
      id,
      status: entry.status,
      reasonCode: entry.reasonCode,
      provenance: entry.provenance,
    }),
  );
  const mergedSignals: RealSignal[] = signals.length > 0 ? signals : moduleEntries.map(moduleToSignal);
  const availableCount = mergedSignals.filter((s) => s.status === "ok").length;
  const unavailableCount = mergedSignals.filter((s) => s.status === "unavailable").length;
  const staleCount = mergedSignals.filter((s) => s.status === "stale").length;
  const failureDetails = moduleEntries
    .filter((module) => module.status !== "ok")
    .slice(0, 5)
    .map((module) => {
      const source = module.provenance?.source ? ` from ${module.provenance.source}` : "";
      const reason = module.reasonCode ? ` (${module.reasonCode})` : "";
      return `${module.id}${source}${reason}`;
    });

  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Data Integrity
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            Real feeds enrich this module when available. Scenario analytics remain active even if a live source is temporarily down.
          </p>
        </div>
        <DataBadge status={overallStatus} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mergedSignals.map((signal) => (
          <article
            key={signal.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-100">{signal.label}</p>
              <DataBadge status={signal.status} className="shrink-0" />
            </div>
            <p className="mt-3 font-mono text-xl text-cyan-100">
              {signal.value ?? "—"}
              {signal.unit ? (
                <span className="ml-1 text-xs text-slate-400">{signal.unit}</span>
              ) : null}
            </p>
            {signal.change ? (
              <p className="mt-1 text-xs text-slate-400">{signal.change}</p>
            ) : null}
            <div className="mt-3 border-t border-white/8 pt-2">
              <ProvenanceTooltip provenance={signal.provenance} />
            </div>
            {signal.status === "unavailable" && signal.reasonCode ? (
              <p className="mt-2 text-xs text-rose-200/90">
                reason: {signal.reasonCode}
              </p>
            ) : null}
            {signal.status === "stale" && signal.reasonCode ? (
              <p className="mt-2 text-xs text-amber-100/90">
                warning: {signal.reasonCode}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      {mergedSignals.length > 0 && availableCount > 0 && (unavailableCount > 0 || staleCount > 0) ? (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-amber-100/90">
            Partial feed coverage
          </p>
          <p className="mt-2 text-xs text-slate-300">
            {unavailableCount > 0 ? `${unavailableCount} signal(s) unavailable. ` : ""}
            {staleCount > 0 ? `${staleCount} signal(s) stale. ` : ""}
            Core dashboard remains operational with available real feeds.
          </p>
        </div>
      ) : null}

      {mergedSignals.length === 0 || availableCount === 0 ? (
        <section className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/8 p-5">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-cyan-100/90">
            Synthetic Baseline Mode
          </p>
          <p className="mt-2 text-sm text-slate-100">
            Live feeds are currently unavailable, so this module is running on validated baseline payloads.
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Scenario controls, charts, and decision outputs remain active. Real-signal cards will repopulate automatically on the next successful data refresh.
          </p>
          {failureDetails.length > 0 ? (
            <details className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <summary className="cursor-pointer font-sans text-xs uppercase tracking-[0.14em] text-slate-300">
                Feed diagnostics (optional)
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {failureDetails.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1 w-1 rounded-full bg-cyan-200" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
