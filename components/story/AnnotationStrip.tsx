import { cn } from "@/lib/cn";

type AnnotationItem = {
  id: string;
  label: string;
  detail: string;
  value?: string;
};

type AnnotationStripProps = {
  title?: string;
  items: AnnotationItem[];
  tone?: "amber" | "crimson" | "emerald" | "cyan";
  className?: string;
};

const toneClass: Record<NonNullable<AnnotationStripProps["tone"]>, string> = {
  amber: "text-amber-100 border-amber-300/20",
  crimson: "text-rose-100 border-rose-300/20",
  emerald: "text-emerald-100 border-emerald-300/20",
  cyan: "text-slate-100 border-slate-300/20",
};

export function AnnotationStrip({
  title = "Narrative Callouts",
  items,
  tone = "amber",
  className,
}: AnnotationStripProps) {
  if (items.length === 0) return null;

  return (
    <section className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-3", className)}>
      {items.slice(0, 6).map((item) => (
        <article
          key={item.id}
          className={cn(
            "rounded-2xl border bg-black/25 px-4 py-3",
            toneClass[tone],
          )}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
            {title}
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-6 text-slate-100">{item.label}</p>
          <p className="mt-1 text-[14px] leading-6 text-slate-200">{item.detail}</p>
          {item.value ? (
            <p className="mt-2 font-mono text-[13px] text-slate-200">{item.value}</p>
          ) : null}
        </article>
      ))}
    </section>
  );
}
