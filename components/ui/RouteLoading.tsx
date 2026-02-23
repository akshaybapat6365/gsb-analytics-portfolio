import { cn } from "@/lib/cn";

type RouteLoadingProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function RouteLoading({ title, subtitle, className }: RouteLoadingProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <section className="glass-strong relative overflow-hidden rounded-3xl p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_300px_at_12%_0%,rgba(var(--p-accent),0.14),transparent_66%),radial-gradient(720px_300px_at_88%_0%,rgba(var(--p-accent2),0.12),transparent_68%)]" />
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Loading
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-sm text-slate-400">{subtitle}</p>
        ) : null}
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-100/85">
          First dev compile may take 2-8 seconds
        </p>

        <div className="mt-4 space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-amber-200/70 animate-pulse" />
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 rounded-full bg-emerald-200/65 animate-pulse" />
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse"
            />
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-[92%] rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-[84%] rounded bg-white/5 animate-pulse" />
        </div>
      </section>
    </div>
  );
}
