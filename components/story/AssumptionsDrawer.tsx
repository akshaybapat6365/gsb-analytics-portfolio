import { cn } from "@/lib/cn";

type AssumptionsDrawerProps = {
  title?: string;
  subtitle?: string;
  items: string[];
  className?: string;
};

export function AssumptionsDrawer({
  title = "Assumptions & Data Provenance",
  subtitle = "Strict real-data mode. Review feed provenance, assumptions, and readiness caveats.",
  items,
  className,
}: AssumptionsDrawerProps) {
  return (
    <details className={cn("glass rounded-2xl", className)}>
      <summary className="cursor-pointer list-none px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Appendix
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-slate-100">
              {title}
            </p>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-sans text-xs font-medium text-slate-200">
            Toggle
          </div>
        </div>
      </summary>

      <div className="border-t border-white/10 px-6 py-6">
        <ul className="space-y-3 text-sm leading-relaxed text-slate-300">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(var(--p-accent),0.85)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
