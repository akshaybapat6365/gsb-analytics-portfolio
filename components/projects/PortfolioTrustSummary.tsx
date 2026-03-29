import Link from "next/link";
import { projects } from "@/lib/projects/catalog";
import { site } from "@/lib/site";

const taxonomy = [
  {
    label: "Real",
    description: "Observed public-feed measurements with freshness and provenance shown in-route.",
  },
  {
    label: "Mixed",
    description: "Observed anchors blended with modeled counterfactual or simulated decision logic.",
  },
  {
    label: "Modeled",
    description: "Scenario or synthetic decision support with explicit limits and swap-path language.",
  },
] as const;

type PortfolioTrustSummaryProps = {
  className?: string;
  compact?: boolean;
};

export function PortfolioTrustSummary({ className = "", compact = false }: PortfolioTrustSummaryProps) {
  return (
    <section className={`surface-secondary overflow-hidden p-5 sm:p-6 ${className}`.trim()}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Portfolio trust guide
          </p>
          <h2 className="font-display text-2xl text-slate-50 sm:text-[2rem]">
            One trust taxonomy across home, library, and case-study routes.
          </h2>
          <p className="text-sm leading-7 text-slate-300 sm:text-[15px]">
            Every card and route uses the same evidence-level language, source framing, and freshness cue so skeptical peers can compare {projects.length} decision packets before drilling down.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Current shell posture</p>
          <div className="mt-2 space-y-2 text-sm text-slate-300">
            <p>Data policy: <span className="font-mono text-slate-100">{site.dataPolicy.mode}</span></p>
            <p>Keyboard path: <span className="text-slate-100">Skip link → nav → filters/cards → trust drawers</span></p>
            <p>Recovery path: <span className="text-slate-100">Every route keeps retry or return-to-projects actions visible.</span></p>
          </div>
        </div>
      </div>

      <div className={`mt-6 grid gap-3 ${compact ? "md:grid-cols-3" : "lg:grid-cols-3"}`}>
        {taxonomy.map((entry) => (
          <article key={entry.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100/90">{entry.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{entry.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <Link
          href="/projects"
          className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-100 transition hover:border-white/25 hover:bg-white/[0.08]"
        >
          Open full project library
        </Link>
        <Link
          href="/resume"
          className="inline-flex items-center justify-center rounded-full border border-white/12 bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300 transition hover:border-white/20 hover:text-slate-100"
        >
          Verify operator credibility
        </Link>
      </div>
    </section>
  );
}
