import { cn } from "@/lib/cn";

type DataIntegrityDrawerProps = {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  title?: string;
  subtitle?: string;
};

export function DataIntegrityDrawer({
  children,
  className,
  defaultOpen = false,
  title = "Feed Coverage & Provenance",
  subtitle = "Feed status, source lineage, and readiness diagnostics.",
}: DataIntegrityDrawerProps) {
  return (
    <section className={cn("surface-secondary p-4 sm:p-5", className)}>
      <details open={defaultOpen} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">
              {title}
            </p>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
          <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300 transition group-open:text-amber-100">
            Toggle
          </span>
        </summary>
        <div className="mt-4">{children}</div>
      </details>
    </section>
  );
}
