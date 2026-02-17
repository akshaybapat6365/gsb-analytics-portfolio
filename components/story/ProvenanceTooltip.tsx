import type { Provenance } from "@/lib/schemas/common";

type ProvenanceTooltipProps = {
  provenance?: Provenance;
};

export function ProvenanceTooltip({ provenance }: ProvenanceTooltipProps) {
  if (!provenance) {
    return (
      <span className="font-sans text-xs text-slate-500">
        source unavailable
      </span>
    );
  }

  const asOf = provenance.asOf ? `as-of ${provenance.asOf}` : "as-of n/a";
  const title = `${provenance.source} · ${asOf} · fetched ${provenance.fetchedAt}${
    provenance.note ? ` · ${provenance.note}` : ""
  }`;

  return (
    <span className="font-sans text-xs text-slate-400" title={title}>
      {provenance.source} · {asOf}
    </span>
  );
}

