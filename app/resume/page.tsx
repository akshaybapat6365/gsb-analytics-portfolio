import { resumeData } from "@/lib/resume";

export const metadata = {
  title: "Resume",
};

const skillSections = [
  { label: "Programming", values: resumeData.skills.programming },
  { label: "Data Engineering", values: resumeData.skills.dataEngineering },
  { label: "Business Analysis", values: resumeData.skills.businessAnalysis },
  { label: "Visualization", values: resumeData.skills.visualization },
  { label: "Cloud & Databases", values: resumeData.skills.cloudAndData },
] as const;

export default function ResumePage() {
  return (
    <div className="space-y-8 pb-8">
      <section className="neo-panel p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Profile
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
          {resumeData.name}
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-relaxed text-slate-300">
          {resumeData.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">
            {resumeData.location}
          </span>
          <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1">
            {resumeData.phone}
          </span>
          <a
            href={`mailto:${resumeData.email}`}
            className="rounded-full border border-cyan-300/25 bg-cyan-300/12 px-3 py-1 no-underline hover:no-underline"
          >
            {resumeData.email}
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-slate-50">Core Skills</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {skillSections.map((section) => (
            <article key={section.label} className="glass rounded-2xl p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-100/90">
                {section.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {section.values.map((value) => (
                  <span
                    key={value}
                    className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-xs text-slate-200"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-slate-50">Experience</h2>
        <div className="space-y-4">
          {resumeData.experience.map((item) => (
            <article key={`${item.company}-${item.period}`} className="neo-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-50">
                    {item.role} · {item.company}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{item.location}</p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-slate-400">
                  {item.period}
                </p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {item.highlights.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass rounded-2xl p-5">
          <h2 className="font-display text-2xl text-slate-50">Education</h2>
          <div className="mt-4 space-y-4">
            {resumeData.education.map((item) => (
              <div key={`${item.school}-${item.period}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-base font-semibold text-slate-100">{item.degree}</p>
                <p className="mt-1 text-sm text-slate-300">{item.school}</p>
                <p className="mt-1 text-xs text-slate-400">{item.period} · {item.location}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass rounded-2xl p-5">
          <h2 className="font-display text-2xl text-slate-50">Certifications</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {resumeData.certifications.map((cert) => (
              <li key={cert} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                {cert}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-slate-50">Selected Project Impact</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {resumeData.projectHighlights.map((project) => (
            <article key={project.title} className="glass rounded-2xl p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/90">
                {project.impact}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-100">{project.title}</h3>
              <p className="mt-2 text-xs text-slate-400">{project.stack}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
