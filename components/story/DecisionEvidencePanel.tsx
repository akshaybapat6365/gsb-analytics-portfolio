import type { DecisionEvidence } from "@/lib/schemas/common";

type DecisionEvidencePanelProps = {
  title?: string;
  evidence?: DecisionEvidence[];
};

export function DecisionEvidencePanel({
  title = "Decision Evidence",
  evidence = [],
}: DecisionEvidencePanelProps) {
  return (
    <section className="terminal overflow-hidden" data-testid="decision-console">
      <div className="border-b border-white/10 bg-white/5 px-5 py-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-200">
          {title}
        </p>
      </div>
      {evidence.length === 0 ? (
        <p className="px-5 py-5 text-[14px] leading-6 text-slate-300">
          No model evidence is available for the current state.
        </p>
      ) : (
        <div className="space-y-3 px-5 py-5 text-[14px] leading-6 text-slate-200">
          {evidence.map((item) => (
            <article key={item.recommendationId} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p>
                <span className="text-slate-100">Recommendation:</span> {item.recommendationId}
              </p>
              <p className="mt-1">
                <span className="text-slate-100">Counterfactual delta:</span>{" "}
                <span className="font-mono text-amber-100">{item.counterfactualDelta}</span>
              </p>
              <p className="mt-1">
                <span className="text-slate-100">Confidence band:</span>{" "}
                {(item.confidenceBand[0] * 100).toFixed(0)}% - {(item.confidenceBand[1] * 100).toFixed(0)}%
              </p>
              <div className="mt-2">
                <p className="text-slate-100">Primary drivers:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.drivers.map((driver) => (
                    <span
                      key={`${item.recommendationId}-${driver}`}
                      className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-300"
                    >
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
          {evidence.length > 1 ? (
            <p className="text-[12px] text-slate-400">
              Showing {evidence.length} ranked evidence rows for the current scenario.
            </p>
          ) : null}
          <div>
            <p className="text-slate-100">Evidence trace:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {evidence.map((item) => (
                <span
                  key={`${item.recommendationId}-trace`}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-300"
                >
                  {item.recommendationId}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
