import type { ModuleReadiness, PayloadMeta, RealSignal } from "@/lib/schemas/common";
import type { ProjectHomepageCard } from "@/lib/projects/catalog";
import { BlufPanel } from "@/components/story/BlufPanel";
import { DataIntegrityDrawer } from "@/components/story/DataIntegrityDrawer";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";

type CaseStudyTrustStackProps = {
  eyebrow: string;
  question: string;
  bluf: string;
  summary: ProjectHomepageCard;
  assumptions: string[];
  meta?: PayloadMeta;
  signals?: RealSignal[];
  readiness?: ModuleReadiness[];
};

export function CaseStudyTrustStack({
  eyebrow,
  question,
  bluf,
  summary,
  assumptions,
  meta,
  signals,
  readiness,
}: CaseStudyTrustStackProps) {
  return (
    <div className="space-y-5">
      <BlufPanel
        eyebrow={eyebrow}
        question={question}
        bluf={bluf}
        keyOutputLabel={summary.resultLabel}
        keyOutputValue={summary.resultValue}
        evidenceLine={`${summary.evidenceLevel.toUpperCase()} · ${summary.source} · as-of ${summary.asOf}`}
        limitation={summary.limitation}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)] xl:items-start">
        <DataIntegrityDrawer
          defaultOpen
          title="Trust, provenance & current run"
          subtitle="Audit the current run ID, freshness, evidence coverage, and upstream provenance directly from the route UI."
        >
          <RealSignalsPanel
            title="Current Run Trust Detail"
            meta={meta}
            signals={signals}
            readiness={readiness}
          />
        </DataIntegrityDrawer>

        <AssumptionsDrawer
          className="h-fit"
          title="Assumptions, limits & swap path"
          subtitle="Inspect the route assumptions, limitation language, and real-world upgrade path before using the recommendation output."
          items={assumptions}
        />
      </div>
    </div>
  );
}
