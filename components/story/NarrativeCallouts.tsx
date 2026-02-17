import { cn } from "@/lib/cn";

export type NarrativeCallout = {
  kicker?: string;
  title: string;
  body: string;
  metric?: string;
};

type NarrativeCalloutsProps = {
  title?: string;
  items: NarrativeCallout[];
  className?: string;
};

export function NarrativeCallouts({ title = "Narrative", items, className }: NarrativeCalloutsProps) {
  return (
    <section className={cn("glass rounded-2xl p-6", className)}>
      <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>

      <div className="mt-5 space-y-5">
        {items.map((item) => (
          <div key={`${item.title}:${item.metric ?? ""}`} className="relative pl-7">
            <div className="absolute left-2 top-0 h-full w-px bg-white/10" aria-hidden="true" />
            <div
              className="absolute left-0 top-1.5 h-4 w-4 rounded-full border border-white/10 bg-white/5"
              aria-hidden="true"
            >
              <div className="absolute inset-1 rounded-full bg-[rgba(var(--p-accent),0.8)]" />
            </div>

            {item.kicker ? (
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {item.kicker}
              </p>
            ) : null}
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-slate-100">{item.title}</p>
              {item.metric ? (
                <p className="font-mono text-xs text-[rgba(var(--p-accent2),0.92)]">{item.metric}</p>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
