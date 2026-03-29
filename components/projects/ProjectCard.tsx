"use client";

import Link from "next/link";
import type { Project } from "@/lib/projects/catalog";
import { cn } from "@/lib/cn";
import { ACCENT_BY_SLUG, DOMAIN_BY_SLUG } from "@/lib/chartTheme";
import { buildProjectTrustLabels } from "@/lib/projects/trust";
import { CardMiniViz } from "@/components/home/CardMiniViz";

/* ── Evidence badge helper ──────────────────────────── */

function evidenceBadge(level: Project["homepage"]["evidenceLevel"]) {
  switch (level) {
    case "real":
      return { icon: "●", label: "Real", cls: "border-emerald-400/30 bg-emerald-400/8 text-emerald-300" };
    case "mixed":
      return { icon: "▲", label: "Mixed", cls: "border-amber-400/30 bg-amber-400/8 text-amber-300" };
    default:
      return { icon: "■", label: "Modeled", cls: "border-slate-400/30 bg-slate-400/8 text-slate-300" };
  }
}

/* ── ProjectCard ────────────────────────────────────── */

export function ProjectCard({ project }: { project: Project }) {
  const badge = evidenceBadge(project.homepage.evidenceLevel);
  const accent = ACCENT_BY_SLUG[project.slug] ?? "160,175,220";
  const domain = DOMAIN_BY_SLUG[project.slug] ?? project.domain;
  const trustLabels = buildProjectTrustLabels(project.homepage);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl",
        "bg-[#111116] no-underline transition-all duration-200",
        "hover:-translate-y-0.5 hover:bg-[#141419]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
      )}
    >
      {/* ── Visualization Zone: 55-60% of card ── */}
      <div className="relative h-[240px] overflow-hidden border-b border-white/[0.03]">
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ background: `radial-gradient(ellipse at 50% 80%, rgba(${accent},0.5), transparent 70%)` }}
        />

        {/* Domain tag */}
        <span className="absolute left-3 top-3 z-10 rounded font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
          {domain}
        </span>

        {/* D3 chart */}
        <div className="flex h-full items-center justify-center px-4 pt-8 pb-3">
          <CardMiniViz
            vizType={project.homepage.vizType}
            data={project.homepage.spark}
            accent={accent}
            width={400}
            height={200}
          />
        </div>
      </div>

      {/* ── Content Zone ── */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]", badge.cls)}>
              <span aria-hidden="true">{badge.icon}</span>
              {trustLabels.evidenceBadgeLabel}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
              {project.homepage.homepageSubtitle}
            </span>
          </div>

          <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-slate-50 sm:text-[18px]">
            {project.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
            {project.homepage.claim}
          </p>

          <dl className="mt-4 grid gap-3 text-[12px] leading-6 text-slate-300">
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                Decision claim
              </dt>
              <dd className="mt-1">{project.homepage.claimFraming}</dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                Method + source
              </dt>
              <dd className="mt-1">{project.homepage.methodPlain} {trustLabels.sourceLabel}.</dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                Freshness
              </dt>
              <dd className="mt-1">{trustLabels.freshnessLabel}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            {project.homepage.resultLabel}
          </p>
          <p
            className="mt-2 font-mono text-[20px] font-semibold leading-tight tracking-tight"
            style={{ color: `rgb(${accent})` }}
          >
            {project.homepage.resultValue}
          </p>
        </div>

        <div className="mt-4 border-t border-white/[0.04] pt-3">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.14em] transition-colors group-hover:brightness-125"
            style={{ color: `rgba(${accent}, 0.7)` }}
          >
            Open case study →
          </span>
        </div>
      </div>
    </Link>
  );
}
