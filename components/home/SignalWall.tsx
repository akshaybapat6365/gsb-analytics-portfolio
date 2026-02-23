import Link from "next/link";

import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";
import { projects, type ProjectSlug } from "@/lib/projects/catalog";
import { cn } from "@/lib/cn";

const contextLine: Record<ProjectSlug, string> = {
  "ord-lga-price-war": "$18M counterfactual revenue lens",
  "fraud-radar": "34% annualized alpha backtest",
  "target-shrink": "$1.2B shrink loss economics",
  "starbucks-pivot": "2,400-store suburban surgery",
  "tesla-nacs": "I-5 network effects war game",
  "netflix-roi": "$17B content allocation frontier",
};

const accentGlow: Record<ProjectSlug, string> = {
  "ord-lga-price-war": "from-amber-300/30 via-amber-500/8 to-transparent",
  "fraud-radar": "from-rose-300/30 via-rose-500/8 to-transparent",
  "target-shrink": "from-amber-300/30 via-amber-500/8 to-transparent",
  "starbucks-pivot": "from-emerald-300/32 via-emerald-500/8 to-transparent",
  "tesla-nacs": "from-amber-300/28 via-emerald-500/8 to-transparent",
  "netflix-roi": "from-amber-300/28 via-slate-300/8 to-transparent",
};

export function SignalWall() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="group relative min-h-[250px] overflow-hidden rounded-[28px] border border-white/12"
        >
          <ProjectBackdrop
            slug={project.slug}
            className="opacity-95 transition duration-500 group-hover:scale-[1.025]"
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-br",
              accentGlow[project.slug],
            )}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.24),rgba(12,10,9,0.72)_48%,rgba(12,10,9,0.9)_100%)]" />

          <div className="relative z-10 flex h-full flex-col justify-end p-5">
            <p className="font-feature text-[10px] uppercase tracking-[0.2em] text-slate-300">
              {project.title.split(":")[0]}
            </p>
            <h3 className="mt-2 text-lg font-semibold leading-tight text-slate-100">
              {project.subtitle}
            </h3>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">
              {contextLine[project.slug]}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}
