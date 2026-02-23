import Link from "next/link";
import type { Project } from "@/lib/projects/catalog";
import { cn } from "@/lib/cn";
import { Chip } from "@/components/ui/Chip";
import { ProjectBackdrop } from "@/components/projects/ProjectBackdrop";

const accentRing: Record<Project["accent"], string> = {
  "market-competition": "hover:border-amber-300/35",
  "forensic-risk": "hover:border-rose-300/35",
  "retail-operations": "hover:border-amber-300/35",
  "geo-portfolio": "hover:border-emerald-300/35",
  "infrastructure-strategy": "hover:border-slate-300/35",
  "content-capital": "hover:border-amber-300/35",
};

const accentChip: Record<Project["accent"], Parameters<typeof Chip>[0]["tone"]> =
  {
    "market-competition": "amber",
    "forensic-risk": "crimson",
    "retail-operations": "amber",
    "geo-portfolio": "emerald",
    "infrastructure-strategy": "cyan",
    "content-capital": "amber",
  };

const accentGlow: Record<Project["accent"], string> = {
  "market-competition": "from-amber-300/28 via-amber-500/4 to-transparent",
  "forensic-risk": "from-rose-300/26 via-rose-500/4 to-transparent",
  "retail-operations": "from-amber-300/30 via-amber-500/4 to-transparent",
  "geo-portfolio": "from-emerald-300/30 via-emerald-500/4 to-transparent",
  "infrastructure-strategy": "from-slate-300/25 via-slate-500/4 to-transparent",
  "content-capital": "from-amber-300/30 via-amber-500/4 to-transparent",
};

const accentText: Record<Project["accent"], string> = {
  "market-competition": "text-amber-100",
  "forensic-risk": "text-rose-100",
  "retail-operations": "text-amber-100",
  "geo-portfolio": "text-emerald-100",
  "infrastructure-strategy": "text-slate-100",
  "content-capital": "text-amber-100",
};

function evidenceBadge(project: Project) {
  if (project.homepage.evidenceLevel === "real") {
    return {
      icon: "✓",
      label: "Real",
      className: "border-emerald-300/45 bg-emerald-300/15 text-emerald-100",
    };
  }
  if (project.homepage.evidenceLevel === "mixed") {
    return {
      icon: "⚠",
      label: "Mixed",
      className: "border-amber-300/45 bg-amber-300/15 text-amber-100",
    };
  }
  return {
    icon: "🔬",
    label: "Modeled",
    className: "border-rose-300/45 bg-rose-300/14 text-rose-100",
  };
}

export function ProjectCard({ project }: { project: Project }) {
  const badge = evidenceBadge(project);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group relative block min-h-[320px] overflow-hidden rounded-3xl border p-0 transition-all duration-300 no-underline hover:no-underline",
        "border-white/18 hover:bg-white/[0.06] hover:shadow-[0_32px_90px_rgba(0,0,0,0.55)]",
        accentRing[project.accent],
      )}
    >
      <ProjectBackdrop slug={project.slug} className="opacity-85 transition duration-500 group-hover:scale-[1.02]" />
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", accentGlow[project.accent])} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.18),rgba(12,10,9,0.76)_45%,rgba(12,10,9,0.94)_100%)]" />

      <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
              badge.className,
            )}
            title={project.homepage.provenanceLong}
          >
            <span aria-hidden="true">{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-slate-300">
            As of {project.homepage.asOf}
          </p>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Chip tone={accentChip[project.accent]}>War Room</Chip>
          <p className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-300">
            {project.methods[0]}
          </p>
        </div>

        <h3
          className={cn(
            "max-w-2xl text-[28px] font-semibold leading-[1.12] tracking-tight sm:text-[32px]",
            accentText[project.accent],
          )}
        >
          {project.title}
        </h3>
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-100/95">
          {project.subtitle}
        </p>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-200/85">{project.homepage.claimFraming}</p>
        <div className="mt-3 rounded-xl border border-white/16 bg-black/28 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
              {project.homepage.resultLabel}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
                badge.className,
              )}
            >
              <span aria-hidden="true">{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          </div>
          <p className="mt-2 font-mono text-[21px] leading-[1.15] text-amber-100">
            {project.homepage.resultValue}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-slate-200">{project.homepage.limitation}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.methods.slice(1, 3).map((method) => (
            <span
              key={method}
              className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-sans text-[12px] text-slate-300"
            >
              {method}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-white/18 bg-black/30 px-4 py-3">
          <p className="font-mono text-[12px] text-slate-200">Source: {project.homepage.source}</p>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-300/24 bg-amber-300/10 px-4 py-3 transition group-hover:border-amber-300/45 group-hover:bg-amber-300/18">
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-100">
            Open simulator
          </p>
          <span
            className={cn(
              "text-base font-semibold transition group-hover:translate-x-1",
              accentText[project.accent],
            )}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
