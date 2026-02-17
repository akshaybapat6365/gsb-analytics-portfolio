import { cn } from "@/lib/cn";

type ChipProps = {
  children: React.ReactNode;
  tone?: "neutral" | "cyan" | "emerald" | "crimson" | "amber";
  className?: string;
};

const toneClass: Record<NonNullable<ChipProps["tone"]>, string> = {
  neutral: "border-white/10 bg-white/5 text-slate-200",
  cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  crimson: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
};

export function Chip({ children, tone = "neutral", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-sans text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
