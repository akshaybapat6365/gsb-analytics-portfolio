import { cn } from "@/lib/cn";

type DecisionLine = {
  label: string;
  value: string;
  tone?: "neutral" | "cyan" | "emerald" | "crimson" | "amber";
  hint?: string;
};

type DecisionConsoleProps = {
  title?: string;
  lines: DecisionLine[];
  className?: string;
};

const toneClass: Record<NonNullable<DecisionLine["tone"]>, string> = {
  neutral: "text-slate-100",
  cyan: "text-amber-200",
  emerald: "text-emerald-200",
  crimson: "text-rose-200",
  amber: "text-amber-100",
};

export function DecisionConsole({ title = "Decision Console", lines, className }: DecisionConsoleProps) {
  return (
    <section className={cn("terminal overflow-hidden", className)} data-testid="decision-console">
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <p className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-slate-300">
          {title}
        </p>
      </div>
      <div className="space-y-3 px-6 py-6 text-[15px] text-slate-200">
        {lines.map((line) => (
          <div key={`${line.label}:${line.value}`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-slate-300">{line.label}</span>
              <span className={cn("font-mono text-[15px] tabular-nums", toneClass[line.tone ?? "neutral"])}>
                {line.value}
              </span>
            </div>
            {line.hint ? (
              <div className="mt-1 text-[13px] text-slate-400">{line.hint}</div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
