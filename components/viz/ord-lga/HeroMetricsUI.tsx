"use client";
export function HeroMetricsUI() {
    return (
        <div className="relative z-10 space-y-8 pt-32 pb-16 w-full max-w-7xl mx-auto px-6 lg:px-12 pointer-events-auto">
            <div className="flex flex-col space-y-8">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0, 240, 255, 0.45)" }}>PROJECT 01</span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.035em", lineHeight: "1.08" }}>
                    ORD → LGA Price War
                </h1>
                <p className="text-[15px] leading-[1.7] max-w-2xl" style={{ fontFamily: "var(--font-body)", color: "rgba(226, 232, 240, 0.5)" }}>
                    United vs Delta algorithmic pricing simulation across 91 route-days. Revenue maximization under Nash equilibrium competitive constraints.
                </p>
            </div>
        </div>
    );
}
