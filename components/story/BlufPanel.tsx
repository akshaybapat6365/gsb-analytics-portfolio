import { cn } from "@/lib/cn";

type BlufPanelProps = {
  eyebrow?: string;
  question: string;
  bluf: string;
  className?: string;
};

export function BlufPanel({ eyebrow = "Executive BLUF", question, bluf, className }: BlufPanelProps) {
  return (
    <section className={cn("glass relative overflow-hidden rounded-3xl p-7", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(860px_420px_at_18%_14%,rgba(var(--p-accent),0.10),transparent_62%),radial-gradient(860px_420px_at_84%_22%,rgba(var(--p-accent2),0.08),transparent_62%)]"
      />

      <div className="relative">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {eyebrow}
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Business question
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-200">
              {question}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[rgba(var(--p-accent2),0.20)] bg-white/[0.04] p-5">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Bottom line
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-100">
                {bluf}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
