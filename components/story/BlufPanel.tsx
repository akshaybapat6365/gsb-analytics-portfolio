import { cn } from "@/lib/cn";

type BlufPanelProps = {
  eyebrow?: string;
  question: string;
  bluf: string;
  keyOutputLabel?: string;
  keyOutputValue?: string;
  evidenceLine?: string;
  limitation?: string;
  className?: string;
};

export function BlufPanel({
  eyebrow = "Executive BLUF",
  question,
  bluf,
  keyOutputLabel,
  keyOutputValue,
  evidenceLine,
  limitation,
  className,
}: BlufPanelProps) {
  return (
    <section className={cn("glass relative overflow-hidden rounded-3xl p-7", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(860px_420px_at_18%_14%,rgba(var(--p-accent),0.10),transparent_62%),radial-gradient(860px_420px_at_84%_22%,rgba(var(--p-accent2),0.08),transparent_62%)]"
      />

      <div className="relative">
        <p className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-slate-300">
          {eyebrow}
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Business question
            </p>
            <p className="mt-3 text-[15px] leading-7 text-slate-200 sm:text-base">
              {question}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[rgba(var(--p-accent2),0.20)] bg-white/[0.04] p-5">
              <p className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Bottom line
              </p>
              <p className="mt-3 text-[15px] leading-7 text-slate-100 sm:text-base">
                {bluf}
              </p>
              {(keyOutputLabel || keyOutputValue) && (
                <div className="mt-4 rounded-xl border border-white/14 bg-black/24 px-4 py-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-slate-300">
                    {keyOutputLabel ?? "Key output"}
                  </p>
                  <p className="mt-1 font-mono text-[22px] text-amber-100">
                    {keyOutputValue ?? "—"}
                  </p>
                  {evidenceLine ? (
                    <p
                      className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/14 bg-black/22 px-2 py-0.5 font-mono text-[11px] text-slate-300"
                      data-evidence-badge
                    >
                      {evidenceLine}
                    </p>
                  ) : null}
                </div>
              )}
              {limitation ? (
                <p className="mt-3 text-[13px] leading-6 text-slate-300">
                  Limitation: {limitation}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
