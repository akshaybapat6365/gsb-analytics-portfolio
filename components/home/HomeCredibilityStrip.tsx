import type { HomeCredibilityVM } from "@/lib/viewmodels/home";

type Props = { model: HomeCredibilityVM };

export function HomeCredibilityStrip({ model }: Props) {
  return (
    <section className="border-y border-white/[0.06] py-5">
      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
        {model.trustMetrics.join("  ·  ")}
      </p>
    </section>
  );
}
