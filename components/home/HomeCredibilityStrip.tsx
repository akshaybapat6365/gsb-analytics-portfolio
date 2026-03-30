import type { HomeCredibilityVM } from "@/lib/viewmodels/home";

type Props = { model: HomeCredibilityVM };

export function HomeCredibilityStrip({ model }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-sky-400/12 bg-white/[0.03] px-6 py-5 shadow-[0_24px_80px_rgba(2,12,24,0.28)] sm:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent"
      />
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-sky-100/60 sm:text-[11px]">
        {model.trustMetrics.join("  ·  ")}
      </p>
    </section>
  );
}
