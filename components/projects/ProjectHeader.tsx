import { Chip } from "@/components/ui/Chip";
import type { Project } from "@/lib/projects/catalog";

export function ProjectHeader({
  project,
}: {
  project: Project;
}) {
  const toneMap: Record<Project["accent"], "neutral" | "cyan" | "emerald" | "crimson" | "amber"> = {
    "market-competition": "amber",
    "forensic-risk": "crimson",
    "retail-operations": "amber",
    "geo-portfolio": "emerald",
    "infrastructure-strategy": "cyan",
    "content-capital": "amber",
  };

  const tone = toneMap[project.accent];

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Chip tone={tone}>Project</Chip>
        {project.methods.slice(0, 3).map((m) => (
          <Chip key={m} tone="neutral">
            {m}
          </Chip>
        ))}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
        {project.title}
      </h1>
      <p className="max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
        {project.subtitle}
      </p>
      <section className="glass rounded-2xl p-6">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Business question
        </p>
        <p className="mt-3 text-base leading-relaxed text-slate-200">
          {project.businessQuestion}
        </p>
        <p className="mt-4 text-sm text-slate-400">
          <span className="font-sans font-medium uppercase tracking-[0.18em] text-slate-500">
            BLUF:
          </span>{" "}
          {project.bluf}
        </p>
      </section>
    </header>
  );
}
