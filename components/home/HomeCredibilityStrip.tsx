import type { HomeCredibilityVM } from "@/lib/viewmodels/home";

type HomeCredibilityStripProps = {
  model: HomeCredibilityVM;
};

export function HomeCredibilityStrip({ model }: HomeCredibilityStripProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="surface-primary overflow-hidden">
        <div className="border-b border-white/12 bg-white/[0.06] px-6 py-4">
          <p className="font-mono text-sm uppercase tracking-[0.15em] text-amber-100">
            Credibility
          </p>
        </div>
        <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
          <article className="surface-data p-4">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-slate-300">
              What each simulator delivers
            </p>
            <ul className="mt-3 space-y-2 text-base leading-7 text-slate-200">
              {model.deliverables.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
          <article className="surface-data p-4">
            <p className="font-mono text-sm uppercase tracking-[0.12em] text-slate-300">
              How validation is handled
            </p>
            <ul className="mt-3 space-y-2 text-base leading-7 text-slate-200">
              {model.validationSteps.map((step) => (
                <li key={step}>• {step}</li>
              ))}
            </ul>
          </article>
        </div>
        <div className="border-t border-white/12 px-6 py-4">
          <p className="font-mono text-sm text-slate-200">
            Data policy: <span className="text-amber-100">{model.dataPolicy}</span>
          </p>
        </div>
      </div>

      <div className="surface-secondary p-5">
        <p className="font-mono text-sm uppercase tracking-[0.14em] text-slate-300">Target roles</p>
        <div className="mt-4 space-y-2">
          {model.audience.map((role) => (
            <p key={role} className="surface-data px-4 py-3 text-base leading-7 text-slate-100">
              {role}
            </p>
          ))}
        </div>

        <p className="mt-6 font-mono text-sm uppercase tracking-[0.14em] text-slate-300">Trust notes</p>
        <div className="mt-3 space-y-2">
          {model.trustNotes.map((note) => (
            <p key={note} className="rounded-xl border border-white/14 bg-black/20 px-4 py-3 text-[15px] leading-7 text-slate-200">
              {note}
            </p>
          ))}
        </div>

        <a
          href={model.cta.href}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-amber-200/35 bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:no-underline hover:bg-amber-200"
        >
          {model.cta.label}
        </a>
      </div>
    </section>
  );
}
