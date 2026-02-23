import { cn } from "@/lib/cn";
import { MetricCount } from "@/components/motion/MetricCount";

type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: "cyan" | "emerald" | "crimson" | "amber";
  variant?: "default" | "hero-ribbon";
  className?: string;
  countValue?: number;
  countPad?: number;
};

const accentClass: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  cyan: "text-amber-100",
  emerald: "text-emerald-200",
  crimson: "text-rose-100",
  amber: "text-amber-100",
};

export function KpiCard({
  label,
  value,
  hint,
  accent = "cyan",
  variant = "default",
  className,
  countValue,
  countPad,
}: KpiCardProps) {
  const longTextValue = typeof value === "string" && value.trim().length > 18;
  const isHero = variant === "hero-ribbon";

  return (
    <div className={cn("kpi-card", isHero && "kpi-card--hero", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p
          className={cn(
            "font-sans text-sm font-semibold uppercase tracking-[0.14em] text-slate-200",
            isHero && "text-[11px] tracking-[0.18em] text-slate-300",
          )}
        >
          {label}
        </p>
        <div
          className={cn(
            "h-1.5 w-10 rounded-full bg-white/10",
            accent === "cyan" && "bg-amber-400/30",
            accent === "emerald" && "bg-emerald-400/30",
            accent === "crimson" && "bg-rose-400/30",
            accent === "amber" && "bg-amber-300/30",
            isHero && "h-1 w-8",
          )}
        />
      </div>
      <div
        className={cn(
          longTextValue
            ? "mt-3 text-[1.1rem] font-semibold leading-[1.25] sm:text-[1.25rem]"
            : "mt-3 text-[2.15rem] font-extrabold leading-[1.05] tabular-nums sm:text-[2.75rem]",
          isHero &&
            (longTextValue
              ? "text-[1rem] leading-[1.25] text-slate-100 sm:text-[1.1rem]"
              : "text-[1.95rem] leading-[1.02] text-slate-50 sm:text-[2.35rem]"),
          accentClass[accent],
        )}
      >
        {typeof countValue === "number" ? <MetricCount value={countValue} pad={countPad} /> : value}
      </div>
      {hint ? (
        <p
          className={cn(
            "mt-2 text-[14px] leading-6 text-slate-200 sm:text-[15px] sm:leading-7",
            isHero && "text-[12px] leading-5 text-slate-300 sm:text-[12px]",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
