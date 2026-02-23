import { cn } from "@/lib/cn";

type StoryTone = "cyan" | "emerald" | "crimson" | "amber";

type StoryChapterShellProps = {
  chapter: string;
  title: string;
  description: string;
  insight?: string;
  impact?: string;
  annotationCount?: number;
  tone?: StoryTone;
  children: React.ReactNode;
  className?: string;
};

const toneMap: Record<StoryTone, string> = {
  cyan: "text-amber-100/85 border-amber-300/15",
  emerald: "text-emerald-100/85 border-emerald-300/15",
  crimson: "text-rose-100/85 border-rose-300/15",
  amber: "text-amber-100/85 border-amber-300/15",
};

export function StoryChapterShell({
  chapter,
  title,
  description,
  insight,
  impact,
  annotationCount,
  tone = "cyan",
  children,
  className,
}: StoryChapterShellProps) {
  return (
    <section
      className={cn(
        "grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]",
        className,
      )}
    >
      <aside className={cn("glass h-fit rounded-3xl border p-5 xl:sticky xl:top-24", toneMap[tone])}>
        <p className="font-feature text-[12px] uppercase tracking-[0.18em]">{chapter}</p>
        <h3 className="mt-3 font-display text-[32px] leading-[1.08] text-slate-50">{title}</h3>
        <p className="mt-3 text-[15px] leading-7 text-slate-200">{description}</p>
        {insight ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] leading-6 text-slate-200">
            <span className="font-mono uppercase tracking-[0.12em] text-slate-300">Insight</span>{" "}
            {insight}
          </p>
        ) : null}
        {impact ? (
          <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] leading-6 text-slate-200">
            <span className="font-mono uppercase tracking-[0.12em] text-slate-300">Impact</span>{" "}
            {impact}
          </p>
        ) : null}
        {annotationCount !== undefined ? (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
            {annotationCount} annotation{annotationCount === 1 ? "" : "s"}
          </p>
        ) : null}
        <div className="chapter-divider mt-4" />
      </aside>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
