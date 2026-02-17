import { cn } from "@/lib/cn";

type StoryTone = "cyan" | "emerald" | "crimson" | "amber";

type StoryChapterShellProps = {
  chapter: string;
  title: string;
  description: string;
  tone?: StoryTone;
  children: React.ReactNode;
  className?: string;
};

const toneMap: Record<StoryTone, string> = {
  cyan: "text-cyan-100/85 border-cyan-300/15",
  emerald: "text-emerald-100/85 border-emerald-300/15",
  crimson: "text-rose-100/85 border-rose-300/15",
  amber: "text-amber-100/85 border-amber-300/15",
};

export function StoryChapterShell({
  chapter,
  title,
  description,
  tone = "cyan",
  children,
  className,
}: StoryChapterShellProps) {
  return (
    <section className={cn("grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]", className)}>
      <aside className={cn("glass h-fit rounded-3xl border p-5 xl:sticky xl:top-24", toneMap[tone])}>
        <p className="font-feature text-xs uppercase tracking-[0.22em]">{chapter}</p>
        <h3 className="mt-3 font-display text-2xl leading-tight text-slate-50">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
      </aside>
      <div>{children}</div>
    </section>
  );
}
