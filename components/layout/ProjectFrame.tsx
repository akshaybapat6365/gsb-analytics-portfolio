import { cn } from "@/lib/cn";

const FRAME_VARIANTS = {
  default: {
    header: "panel-strong p-5 sm:p-6",
    chapter: "text-slate-400",
    title: "text-slate-50",
    subtitle: "text-slate-300",
    valueWrap: "metric-strip min-w-[220px] px-4 py-3",
    valueText: "text-amber-100",
  },
  warroom: {
    header:
      "rounded-[1.35rem] border border-[rgba(var(--line),0.52)] bg-[linear-gradient(135deg,rgba(var(--panel),0.96),rgba(0,0,0,0.58))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_22px_56px_rgba(0,0,0,0.5)] sm:p-6",
    chapter: "text-[rgba(var(--p-accent2),0.92)]",
    title: "text-[rgb(var(--text-0))]",
    subtitle: "text-[rgba(var(--text-1),0.95)]",
    valueWrap:
      "min-w-[230px] rounded-xl border border-[rgba(var(--p-accent2),0.38)] bg-[rgba(0,0,0,0.34)] px-4 py-3",
    valueText: "text-[rgba(var(--p-accent2),0.95)]",
  },
  forensic: {
    header:
      "rounded-[1.35rem] border border-[rgba(var(--line),0.55)] bg-[linear-gradient(150deg,rgba(54,10,10,0.34),rgba(var(--panel),0.94)_55%,rgba(0,0,0,0.62))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_26px_54px_rgba(0,0,0,0.5)] sm:p-6",
    chapter: "text-rose-200/75",
    title: "text-rose-50",
    subtitle: "text-rose-100/78",
    valueWrap:
      "min-w-[230px] rounded-xl border border-rose-300/25 bg-black/30 px-4 py-3",
    valueText: "text-rose-100",
  },
  operations: {
    header:
      "rounded-[1.35rem] border border-[rgba(var(--line),0.56)] bg-[linear-gradient(145deg,rgba(58,38,12,0.38),rgba(var(--panel),0.94)_52%,rgba(0,0,0,0.64))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_52px_rgba(0,0,0,0.48)] sm:p-6",
    chapter: "text-amber-100/80",
    title: "text-amber-50",
    subtitle: "text-amber-100/74",
    valueWrap:
      "min-w-[230px] rounded-xl border border-amber-300/28 bg-black/28 px-4 py-3",
    valueText: "text-amber-100",
  },
  geo: {
    header:
      "rounded-[1.35rem] border border-[rgba(var(--line),0.56)] bg-[linear-gradient(145deg,rgba(21,52,34,0.32),rgba(var(--panel),0.93)_55%,rgba(0,0,0,0.62))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_52px_rgba(0,0,0,0.48)] sm:p-6",
    chapter: "text-emerald-100/80",
    title: "text-emerald-50",
    subtitle: "text-emerald-100/74",
    valueWrap:
      "min-w-[230px] rounded-xl border border-emerald-300/24 bg-black/28 px-4 py-3",
    valueText: "text-emerald-100",
  },
  systems: {
    header:
      "rounded-[1.35rem] border border-[rgba(var(--line),0.56)] bg-[linear-gradient(145deg,rgba(42,42,42,0.46),rgba(var(--panel),0.93)_56%,rgba(0,0,0,0.64))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_52px_rgba(0,0,0,0.48)] sm:p-6",
    chapter: "text-orange-100/74",
    title: "text-zinc-100",
    subtitle: "text-zinc-300",
    valueWrap:
      "min-w-[230px] rounded-xl border border-orange-300/22 bg-black/32 px-4 py-3",
    valueText: "text-orange-100/90",
  },
  cinematic: {
    header:
      "rounded-[1.35rem] border border-[rgba(var(--line),0.56)] bg-[linear-gradient(145deg,rgba(64,14,14,0.34),rgba(var(--panel),0.92)_55%,rgba(0,0,0,0.66))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_26px_54px_rgba(0,0,0,0.5)] sm:p-6",
    chapter: "text-amber-100/80",
    title: "text-amber-50",
    subtitle: "text-amber-100/72",
    valueWrap:
      "min-w-[230px] rounded-xl border border-amber-300/24 bg-black/32 px-4 py-3",
    valueText: "text-amber-100",
  },
} as const;

type ProjectFrameProps = {
  title: string;
  subtitle: string;
  chapter?: string;
  value?: string;
  valueLabel?: string;
  variant?: keyof typeof FRAME_VARIANTS;
  children: React.ReactNode;
  className?: string;
};

export function ProjectFrame({
  title,
  subtitle,
  chapter = "Decision Chapter",
  value,
  valueLabel,
  variant = "default",
  children,
  className,
}: ProjectFrameProps) {
  const frame = FRAME_VARIANTS[variant];

  return (
    <section className={cn("space-y-5", className)}>
      <header className={frame.header}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={cn("font-mono text-[12px] uppercase tracking-[0.18em]", frame.chapter)}>
              {chapter}
            </p>
            <h2 className={cn("mt-3 font-display text-[34px] leading-[1.05] sm:text-[50px]", frame.title)}>
              {title}
            </h2>
            <p className={cn("mt-3 max-w-3xl text-[15px] leading-7 sm:text-[17px]", frame.subtitle)}>
              {subtitle}
            </p>
          </div>
          {value ? (
            <div className={frame.valueWrap}>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300">
                {valueLabel ?? "Primary Output"}
              </p>
              <p className={cn("mt-1 font-mono text-[30px] leading-[1.05]", frame.valueText)}>{value}</p>
            </div>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
