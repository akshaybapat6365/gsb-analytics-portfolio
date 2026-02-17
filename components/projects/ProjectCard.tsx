import Link from "next/link";
import type { Project } from "@/lib/projects/catalog";
import { cn } from "@/lib/cn";
import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";

const accentRing: Record<Project["accent"], string> = {
  cyan: "hover:border-cyan-300/35",
  emerald: "hover:border-emerald-300/35",
  crimson: "hover:border-rose-300/35",
  amber: "hover:border-amber-300/35",
};

const accentChip: Record<Project["accent"], Parameters<typeof Chip>[0]["tone"]> =
  {
    cyan: "cyan",
    emerald: "emerald",
    crimson: "crimson",
    amber: "amber",
  };

const accentGlow: Record<Project["accent"], string> = {
  cyan: "from-cyan-300/28 via-cyan-500/4 to-transparent",
  emerald: "from-emerald-300/30 via-emerald-500/4 to-transparent",
  crimson: "from-rose-300/26 via-rose-500/4 to-transparent",
  amber: "from-amber-300/30 via-amber-500/4 to-transparent",
};

const accentText: Record<Project["accent"], string> = {
  cyan: "text-cyan-100",
  emerald: "text-emerald-100",
  crimson: "text-rose-100",
  amber: "text-amber-100",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group relative block min-h-[300px] overflow-hidden rounded-3xl border p-0 transition-all duration-300 no-underline hover:no-underline",
        "border-white/10 hover:bg-white/[0.06] hover:shadow-[0_32px_90px_rgba(0,0,0,0.55)]",
        accentRing[project.accent],
      )}
    >
      <ProjectBackdrop slug={project.slug} className="opacity-85 transition duration-500 group-hover:scale-[1.02]" />
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", accentGlow[project.accent])} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.76)_45%,rgba(2,6,23,0.94)_100%)]" />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Chip tone={accentChip[project.accent]}>War Room</Chip>
          <p className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-300">
            {project.methods[0]}
          </p>
        </div>

        <h3 className={cn("max-w-2xl text-xl font-semibold tracking-tight sm:text-2xl", accentText[project.accent])}>
          {project.title}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200/92">
          {project.subtitle}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.methods.slice(1, 3).map((method) => (
            <span
              key={method}
              className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-sans text-xs text-slate-300"
            >
              {method}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">
            Open Simulator
          </p>
          <span className={cn("text-base font-semibold transition group-hover:translate-x-1", accentText[project.accent])}>
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
