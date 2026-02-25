import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectsIndexGrid } from "@/components/projects/ProjectsIndexGrid";
import { projects } from "@/lib/projects/catalog";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Interactive Decision Simulators",
  description:
    "Six interactive strategy war rooms spanning pricing, fraud risk, retail operations, geospatial pivots, infrastructure planning, and content ROI.",
  path: "/projects",
  theme: "ord-lga-price-war",
});

export default function ProjectsIndexPage() {
  return (
    <div className="space-y-8 pb-6">
      {/* ── Hero ── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-[#0e0e13] px-6 py-10 sm:px-10 sm:py-14">
          {/* Dot grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Radial accent glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 70% 30%, rgba(160,175,220,0.06), transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Strategy Case Library · {projects.length} Simulators
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-[36px] font-semibold leading-[1.08] tracking-tight text-slate-50 sm:text-[52px]">
              Interactive decision
              <br />
              war rooms
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-400 sm:text-[16px]">
              Every project is a playable strategy product — parameter controls,
              visual counterfactuals, and a direct financial recommendation.
              Evidence status, source lineage, and as-of timestamp on every card.
            </p>

            {/* Stats strip */}
            <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
              {[
                { n: "06", label: "Simulators" },
                { n: "04", label: "Output families" },
                { n: "03", label: "Evidence levels" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <span className="font-mono text-[22px] font-semibold text-slate-200">{s.n}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Filters + Grid ── */}
      <Reveal delay={0.05}>
        <ProjectsIndexGrid projects={projects} />
      </Reveal>
    </div>
  );
}
