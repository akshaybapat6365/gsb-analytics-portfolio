import type { ModuleReadiness, PayloadMeta, RealSignal } from "@/lib/schemas/common";
import { DataBadge } from "@/components/story/DataBadge";
import { ProvenanceTooltip } from "@/components/story/ProvenanceTooltip";
import type { DataPolicyMode, DataStatus } from "@/lib/schemas/common";
import { site } from "@/lib/site";

type RealSignalsPanelProps = {
  title?: string;
  meta?: PayloadMeta;
  signals?: RealSignal[];
  readiness?: ModuleReadiness[];
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

function policyMessage(policyMode: DataPolicyMode) {
  if (policyMode === "strict-real") {
    return "Strict real-feed mode: live feeds are preferred, with explicit fallback diagnostics when providers fail.";
  }
  if (policyMode === "synthetic-demo") {
    return "Synthetic demo mode: decisions run on modeled baseline payloads with explicit synthetic provenance.";
  }
  return "Baseline fallback mode: decision modules remain interactive when live feeds fail, using validated baseline payloads.";
}

function policyBadgeClass(policyMode: DataPolicyMode) {
  if (policyMode === "strict-real") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  if (policyMode === "synthetic-demo") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
}

export function RealSignalsPanel({
  title = "Real Data Coverage",
  meta,
  signals = [],
  readiness = [],
}: RealSignalsPanelProps) {
  const overallStatus = meta?.overallStatus ?? "stale";
  const policyMode = (meta?.policyMode as DataPolicyMode | undefined) ?? site.dataPolicy.mode;
  const moduleEntries: ModuleEntry[] = Object.entries(meta?.modules ?? {}).map(
    ([id, entry]) => ({
      id,
      status: entry.status,
      reasonCode: entry.reasonCode,
      provenance: entry.provenance,
    }),
  );
  const mergedSignals: RealSignal[] = signals.length > 0 ? signals : moduleEntries.map(moduleToSignal);
  const requiredSignals = mergedSignals.filter((signal) => signal.required !== false);
  const gatingSignals = requiredSignals.length > 0 ? requiredSignals : mergedSignals;
  const usableCount = gatingSignals.filter((s) => s.status !== "unavailable").length;
  const unavailableCount = gatingSignals.filter((s) => s.status === "unavailable").length;
  const staleCount = gatingSignals.filter((s) => s.status === "stale").length;
  const optionalUnavailableCount = mergedSignals.filter(
    (signal) => signal.required === false && signal.status === "unavailable",
  ).length;
  const coveragePct =
    gatingSignals.length > 0
      ? Math.round((usableCount / gatingSignals.length) * 100)
      : 0;
  const failureDetails = moduleEntries
    .filter((module) => module.status !== "ok")
    .slice(0, 5)
    .map((module) => {
      const source = module.provenance?.source ? ` from ${module.provenance.source}` : "";
      const reason = module.reasonCode ? ` (${module.reasonCode})` : "";
      return `${module.id}${source}${reason}`;
    });
  const blockedModules = readiness.filter((entry) => entry.status === "blocked").length;
  const partialModules = readiness.filter((entry) => entry.status === "partial").length;

  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Data Integrity
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {policyMessage(policyMode)}
          </p>
          <div
            className={`mt-2 inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${policyBadgeClass(policyMode)}`}
          >
            policy: {policyMode}
          </div>
        </div>
        <DataBadge status={overallStatus} />
      </div>

      {meta ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Snapshot
          </p>
          <p className="mt-1 font-mono text-xs text-slate-200">
            run {meta.runId} · generated {meta.generatedAt}
          </p>
        </div>
      ) : null}

      {readiness.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">
            Module Readiness
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {readiness.map((entry) => (
              <article
                key={entry.moduleId}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
                    {entry.moduleId}
                  </p>
                  <span
                    className={
                      entry.status === "ready"
                        ? "text-[11px] text-emerald-200"
                        : entry.status === "partial"
                          ? "text-[11px] text-amber-100"
                          : "text-[11px] text-rose-200"
                    }
                  >
                    {entry.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  coverage {entry.realCoveragePct}% · missing {entry.missingSeries.length}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mergedSignals.map((signal) => (
          <article
            key={signal.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-100">{signal.label}</p>
                {signal.required === false ? (
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    contextual signal (non-gating)
                  </p>
                ) : null}
              </div>
              <DataBadge status={signal.status} className="shrink-0" />
            </div>
            <p className="mt-3 font-mono text-xl text-amber-100">
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

      {mergedSignals.length > 0 && usableCount > 0 && (unavailableCount > 0 || staleCount > 0) ? (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-amber-100/90">
            Partial feed coverage
          </p>
          <p className="mt-2 text-xs text-slate-300">
            {unavailableCount > 0 ? `${unavailableCount} signal(s) unavailable. ` : ""}
            {staleCount > 0 ? `${staleCount} signal(s) stale. ` : ""}
            {optionalUnavailableCount > 0
              ? `${optionalUnavailableCount} contextual signal(s) unavailable. `
              : ""}
            {partialModules > 0 ? `${partialModules} module(s) partial. ` : ""}
            {blockedModules > 0 ? `${blockedModules} module(s) blocked.` : "Modules remain active with available real feeds."}
          </p>
        </div>
      ) : null}

      {mergedSignals.length === 0 || usableCount === 0 ? (
        <section className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-5">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.16em] text-amber-100/90">
            Live Feed Coverage Limited
          </p>
          <p className="mt-2 text-sm text-slate-100">
            Live upstream providers are currently unavailable for this module set.
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Coverage is {coveragePct}% on required feeds. Simulators, charts, and decision outputs continue with validated baseline payloads while upstream sources recover.
          </p>
          {failureDetails.length > 0 ? (
            <details className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <summary className="cursor-pointer font-sans text-xs uppercase tracking-[0.14em] text-slate-300">
                Feed diagnostics (optional)
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {failureDetails.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1 w-1 rounded-full bg-amber-200" />
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
