import type { Annotation } from "@/lib/schemas/common";
import { EvidenceRail } from "@/components/story/EvidenceRail";

type AnnotatedVizFrameProps = {
  title: string;
  subtitle: string;
  annotations?: Annotation[];
  interactiveEvidence?: boolean;
  children: React.ReactNode;
};

export function AnnotatedVizFrame({
  title,
  subtitle,
  annotations,
  interactiveEvidence = true,
  children,
}: AnnotatedVizFrameProps) {
  return (
    <section className="space-y-4">
      {children}
      <EvidenceRail
        title={title}
        annotations={annotations}
        interactive={interactiveEvidence}
        groupByType
      />
      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
          Annotation Intent
        </p>
        <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
      </div>
    </section>
  );
}
