"use client";

import { useMemo, useState } from "react";
import type { Annotation } from "@/lib/schemas/common";

type EvidenceRailProps = {
  title?: string;
  annotations?: Annotation[];
  interactive?: boolean;
  groupByType?: boolean;
};

const TYPE_LABEL: Record<Annotation["type"], string> = {
  shock: "Shock",
  anomaly: "Anomaly",
  inflection: "Inflection",
  recommendation: "Recommendation",
};

export function EvidenceRail({
  title = "Evidence Rail",
  annotations = [],
  interactive = false,
  groupByType = true,
}: EvidenceRailProps) {
  const [typeFilter, setTypeFilter] = useState<Annotation["type"] | "all">("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return annotations;
    return annotations.filter((annotation) => annotation.type === typeFilter);
  }, [annotations, typeFilter]);

  const grouped = useMemo(() => {
    const groups: Record<Annotation["type"], Annotation[]> = {
      shock: [],
      anomaly: [],
      inflection: [],
      recommendation: [],
    };
    for (const annotation of filtered) {
      groups[annotation.type].push(annotation);
    }
    return groups;
  }, [filtered]);

  if (annotations.length === 0) {
    return (
      <section className="panel p-5 sm:p-6" data-testid="annotation-rail">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-300">
          {title}
        </p>
        <p className="mt-3 text-[14px] leading-6 text-slate-200">
          No annotation evidence is available for this snapshot.
        </p>
      </section>
    );
  }

  return (
    <section className="panel p-5 sm:p-6" data-testid="annotation-rail">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-300">
          {title}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">
          {filtered.length} linked callouts
        </p>
      </div>
      {interactive ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {(["all", "shock", "anomaly", "inflection", "recommendation"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={
                type === typeFilter
                  ? "rounded-full border border-amber-200/35 bg-amber-200/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-amber-100"
                  : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-300 hover:bg-white/[0.08]"
              }
            >
              {type}
            </button>
          ))}
        </div>
      ) : null}
      {groupByType ? (
        <div className="mt-4 space-y-4">
          {(Object.keys(grouped) as Annotation["type"][]).map((type) => {
            const rows = grouped[type];
            if (rows.length === 0) return null;
            return (
              <section key={type} className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  {TYPE_LABEL[type]} · {rows.length}
                </p>
                {rows.slice(0, 4).map((annotation) => (
                  <article
                    key={annotation.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-amber-100">
                        {TYPE_LABEL[annotation.type]}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">
                        {annotation.timestampOrIndex}
                      </span>
                    </div>
                    <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-100">{annotation.title}</p>
                    <p className="mt-1 text-[14px] leading-6 text-slate-200">{annotation.body}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {annotation.evidenceRefs.slice(0, 3).map((entry) => (
                        <span
                          key={`${annotation.id}-${entry.source}-${entry.seriesId}`}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-slate-300"
                        >
                          {entry.source}:{entry.seriesId}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.slice(0, 6).map((annotation) => (
            <article
              key={annotation.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-amber-100">
                  {TYPE_LABEL[annotation.type]}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">
                  {annotation.timestampOrIndex}
                </span>
              </div>
              <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-100">{annotation.title}</p>
              <p className="mt-1 text-[14px] leading-6 text-slate-200">{annotation.body}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
