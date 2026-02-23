"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { HomepageEvidenceLevel, Project, ProjectDomain, ProjectOutputType } from "@/lib/projects/catalog";

type ProjectsIndexGridProps = {
  projects: Project[];
};

type AnyFilter = "all";

const domainLabels: Record<ProjectDomain, string> = {
  pricing: "Pricing",
  fraud: "Fraud",
  ops: "Ops",
  geo: "Geo",
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

function filterButtonClass(active: boolean) {
  return active
    ? "rounded-full border border-amber-200/45 bg-amber-300/18 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-100"
    : "rounded-full border border-white/16 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-amber-200/30 hover:text-amber-100";
}

export function ProjectsIndexGrid({ projects }: ProjectsIndexGridProps) {
  const [domain, setDomain] = useState<ProjectDomain | AnyFilter>("all");
  const [evidence, setEvidence] = useState<HomepageEvidenceLevel | AnyFilter>("all");
  const [outputType, setOutputType] = useState<ProjectOutputType | AnyFilter>("all");

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      if (domain !== "all" && project.domain !== domain) return false;
      if (evidence !== "all" && project.homepage.evidenceLevel !== evidence) return false;
      if (outputType !== "all" && project.outputType !== outputType) return false;
      return true;
    });
  }, [projects, domain, evidence, outputType]);

  const domains = Object.keys(domainLabels) as ProjectDomain[];
  const outputs = Object.keys(outputLabels) as ProjectOutputType[];
  const evidences = Object.keys(evidenceLabels) as HomepageEvidenceLevel[];

  return (
    <section className="space-y-6" aria-label="Project index filters and cards">
      <div className="surface-primary p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300">Domain</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => setDomain("all")} className={filterButtonClass(domain === "all")}>
                All
              </button>
              {domains.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDomain(value)}
                  className={filterButtonClass(domain === value)}
                >
                  {domainLabels[value]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300">Evidence</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEvidence("all")}
                className={filterButtonClass(evidence === "all")}
              >
                All
              </button>
              {evidences.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEvidence(value)}
                  className={filterButtonClass(evidence === value)}
                >
                  {evidenceLabels[value]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300">Output</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOutputType("all")}
                className={filterButtonClass(outputType === "all")}
              >
                All
              </button>
              {outputs.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOutputType(value)}
                  className={filterButtonClass(outputType === value)}
                >
                  {outputLabels[value]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 font-mono text-[12px] text-slate-300">
          Showing {filtered.length} of {projects.length} simulations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
