"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type {
  HomepageEvidenceLevel,
  Project,
  ProjectDomain,
  ProjectOutputType,
} from "@/lib/projects/catalog";

type Props = { projects: Project[] };
type AnyFilter = "all";

/* ── Label maps ─────────────────────────────────────── */

const domainLabels: Record<ProjectDomain, string> = {
  pricing: "Pricing",
  fraud: "Fraud",
  ops: "Retail Ops",
  geo: "Geospatial",
  infra: "Infrastructure",
  portfolio: "Portfolio",
};

const outputLabels: Record<ProjectOutputType, string> = {
  "roi-npv": "ROI / NPV",
  ate: "ATE",
  "risk-score": "Risk Score",
  frontier: "Frontier",
};

const evidenceLabels: Record<HomepageEvidenceLevel, string> = {
  real: "Real",
  mixed: "Mixed",
  modeled: "Modeled",
};

/* ── Filter pill component ──────────────────────────── */

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-full border border-white/25 bg-white/[0.10] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          : "rounded-full border border-white/[0.08] bg-transparent px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-slate-500 transition hover:border-white/20 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
      }
    >
      {children}
    </button>
  );
}

/* ── Grid component ─────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2 } },
};

export function ProjectsIndexGrid({ projects }: Props) {
  const [domain, setDomain] = useState<ProjectDomain | AnyFilter>("all");
  const [evidence, setEvidence] = useState<HomepageEvidenceLevel | AnyFilter>("all");
  const [outputType, setOutputType] = useState<ProjectOutputType | AnyFilter>("all");

  const resetFilters = () => {
    setDomain("all");
    setEvidence("all");
    setOutputType("all");
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (domain !== "all" && p.domain !== domain) return false;
      if (evidence !== "all" && p.homepage.evidenceLevel !== evidence) return false;
      if (outputType !== "all" && p.outputType !== outputType) return false;
      return true;
    });
  }, [projects, domain, evidence, outputType]);

  const domains = Object.keys(domainLabels) as ProjectDomain[];
  const outputs = Object.keys(outputLabels) as ProjectOutputType[];
  const evidences = Object.keys(evidenceLabels) as HomepageEvidenceLevel[];

  const hasActiveFilters = domain !== "all" || evidence !== "all" || outputType !== "all";

  return (
    <section className="space-y-6" aria-label="Project index">
      {/* ── Filter bar ── */}
      <div className="rounded-xl border border-white/[0.05] bg-[#0e0e13] p-4 sm:p-5">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                Multi-dimensional discovery
              </p>
              <p className="text-sm leading-6 text-slate-400">
                Filter by domain, evidence posture, and output type without losing trust metadata on the cards.
              </p>
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.13em] text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
              >
                Clear all filters
              </button>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                Domain
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Pill active={domain === "all"} onClick={() => setDomain("all")}>All</Pill>
                {domains.map((v) => (
                  <Pill key={v} active={domain === v} onClick={() => setDomain(v)}>
                    {domainLabels[v]}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                Evidence
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Pill active={evidence === "all"} onClick={() => setEvidence("all")}>All</Pill>
                {evidences.map((v) => (
                  <Pill key={v} active={evidence === v} onClick={() => setEvidence(v)}>
                    {evidenceLabels[v]}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                Output
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Pill active={outputType === "all"} onClick={() => setOutputType("all")}>All</Pill>
                {outputs.map((v) => (
                  <Pill key={v} active={outputType === v} onClick={() => setOutputType(v)}>
                    {outputLabels[v]}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] tracking-[0.08em] text-slate-600">
          Showing {filtered.length} of {projects.length} simulators
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.03] px-5 py-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            No matching projects
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This filter combination currently hides all six case studies. Reset the discovery controls to restore the full library.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-100 transition hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.slug}
                layout
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
