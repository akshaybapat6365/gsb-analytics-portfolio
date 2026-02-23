import type { HomeCredibilityVM } from "@/lib/viewmodels/home";

type HomeCredibilityStripProps = {
  model: HomeCredibilityVM;
};

export function HomeCredibilityStrip({ model }: HomeCredibilityStripProps) {
  return (
    <section className="trust-metrics-bar rounded-2xl border-y border-white/10 px-4 py-5 sm:px-6">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300 sm:text-[12px]">
        {model.trustMetrics.join(" · ")}
      </p>
    </section>
  );
}
