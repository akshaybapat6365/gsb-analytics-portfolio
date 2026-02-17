import { cn } from "@/lib/cn";

type RouteLoadingProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function RouteLoading({ title, subtitle, className }: RouteLoadingProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <section className="glass-strong overflow-hidden rounded-3xl p-8">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Loading
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-sm text-slate-400">{subtitle}</p>
        ) : null}

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

