import { cn } from "@/lib/cn";

type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "cyan" | "emerald" | "crimson" | "amber";
  className?: string;
};

const accentClass: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  cyan: "text-cyan-200",
  emerald: "text-emerald-200",
  crimson: "text-rose-200",
  amber: "text-amber-200",
};

export function KpiCard({
  label,
  value,
  hint,
  accent = "cyan",
  className,
}: KpiCardProps) {
  return (
    <div className={cn("kpi-card", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <div
          className={cn(
            "h-1.5 w-10 rounded-full bg-white/10",
            accent === "cyan" && "bg-cyan-400/30",
            accent === "emerald" && "bg-emerald-400/30",
            accent === "crimson" && "bg-rose-400/30",
            accent === "amber" && "bg-amber-300/30",
          )}
        />
      </div>
      <div
        className={cn(
          "mt-3 text-2xl font-semibold tabular-nums",
          accentClass[accent],
        )}
      >
        {value}
      </div>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}
