import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/lib/projects/catalog";

export const metadata = {
  title: "Projects",
};

export default function ProjectsIndexPage() {
  return (
    <div className="space-y-10 pb-4">
      <Reveal>
        <section className="neo-panel overflow-hidden p-6 sm:p-8">
          <div className="relative z-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Strategy Case Library
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
              Interactive decision war rooms
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
              Every project is designed as a playable strategy product with
              parameter controls, visual counterfactuals, and a direct financial
              recommendation.
            </p>
          </div>
        </section>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, idx) => (
          <Reveal key={project.slug} delay={Math.min(0.08 * idx, 0.34)}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
