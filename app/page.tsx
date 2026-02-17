import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { PortfolioPulse } from "@/components/home/PortfolioPulse";
import { SignalWall } from "@/components/home/SignalWall";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Chip } from "@/components/ui/Chip";
import { KpiCard } from "@/components/ui/KpiCard";
import { projects } from "@/lib/projects/catalog";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(150deg,rgba(4,8,16,0.78),rgba(3,6,12,0.9))] p-6 sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_16%,rgba(34,211,238,0.20),transparent_60%),radial-gradient(820px_480px_at_88%_18%,rgba(52,211,153,0.14),transparent_65%)]" />
        <Reveal>
          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Chip tone="cyan">Senior Data Analyst</Chip>
                <Chip tone="emerald">MS Business Analytics</Chip>
                <Chip tone="crimson">Cloud Data + Decision Science</Chip>
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-slate-50 sm:text-6xl">
                Strategy simulators
                <br />
                <span className="text-cyan-200">for high-stakes decisions.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Six visual-first analytics products with interactive controls, scenario
                narratives, and quantified outputs: incremental revenue, alpha, NPV,
                and risk-adjusted value creation.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/90 px-6 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:no-underline hover:bg-cyan-200"
                >
                  Explore Simulators
                </Link>
                <a
                  href={site.links.resume}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-slate-100 no-underline transition hover:no-underline hover:bg-white/[0.11]"
                >
                  Profile
                </a>
              </div>
            </div>

            <PortfolioPulse />
          </div>
        </Reveal>
      </section>

      <section className="space-y-4">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Visual Signal Wall
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                Six microsites, six distinct visual systems
              </h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <SignalWall />
        </Reveal>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal>
          <KpiCard
            label="Interactive Simulators"
            value="06"
            hint="Each with scenario controls and live decision outputs"
            accent="cyan"
          />
        </Reveal>
        <Reveal delay={0.05}>
          <KpiCard
            label="Method Stack"
            value="RL · DiD · SCM"
            hint="Built for consulting, investing, and strategy roles"
            accent="emerald"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <KpiCard
            label="Decision Layer"
            value="ROI / Alpha / NPV"
            hint="BLUF-first interpretation for executives"
            accent="amber"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <KpiCard
            label="Visualization DNA"
            value="D3 + ECharts + Deck.gl"
            hint="Storytelling-grade interactions and motion"
            accent="crimson"
          />
        </Reveal>
      </section>

      <section id="projects" className="space-y-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Simulator Portfolio
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                Six distinct strategy microsites
              </h2>
            </div>
            <Link
              href="/projects"
              className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 no-underline hover:no-underline hover:bg-white/[0.1]"
            >
              View all
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.slug} delay={Math.min(index * 0.06, 0.3)}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Reveal>
          <div className="terminal overflow-hidden">
            <div className="border-b border-white/10 bg-white/[0.06] px-6 py-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-200/90">
                Decision Flow
              </p>
            </div>
            <div className="space-y-4 px-6 py-6 text-sm text-slate-300">
              <p>
                <span className="text-slate-100">Business Context:</span> each project starts with a live strategic tension.
              </p>
              <p>
                <span className="text-slate-100">Data Insight:</span> validated payloads are precomputed, then stress-tested in-browser.
              </p>
              <p>
                <span className="text-slate-100">Recommendation:</span> BLUF-first output with hard economics (ROI, alpha, NPV, incremental revenue).
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="neo-panel h-full p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Focus Roles
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                Senior Data Analyst / Analytics Lead
              </p>
              <p className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                Cloud Data Engineering (AWS / Snowflake / dbt)
              </p>
              <p className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                Business Intelligence &amp; Decision Science
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
