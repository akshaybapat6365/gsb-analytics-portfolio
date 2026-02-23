import type { Annotation } from "@/lib/schemas/common";

type NarrativeStripProps = {
  title: string;
  subtitle: string;
  annotations?: Annotation[];
  maxItems?: number;
  tone?: "rose" | "amber" | "emerald";
};

const toneMap: Record<NonNullable<NarrativeStripProps["tone"]>, string> = {
  rose: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  emerald: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
};

export function NarrativeStrip({
  title,
  subtitle,
  annotations = [],
  maxItems = 3,
  tone = "amber",
}: NarrativeStripProps) {
  return (
    <section className="glass rounded-2xl p-4 sm:p-5" data-testid="annotation-rail">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-300">
            {title}
          </p>
          <p className="mt-1 text-[14px] leading-6 text-slate-200">{subtitle}</p>
        </div>
      </div>

      {annotations.length === 0 ? (
        <p className="mt-4 text-[14px] leading-6 text-slate-300">
          Annotation signals are not available for this chapter.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {annotations.slice(0, maxItems).map((annotation) => (
            <article
              key={annotation.id}
              className="rounded-xl border border-white/10 bg-black/25 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] ${toneMap[tone]}`}>
                  {annotation.type}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-500">
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
