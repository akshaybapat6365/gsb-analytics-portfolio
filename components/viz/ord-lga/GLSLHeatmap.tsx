"use client";
export function GLSLHeatmap() {
    return (
        <div className="w-full min-h-[350px] relative rounded-lg overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0a1628] via-[#0c2041] to-[#1a0a2e]">
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0, 240, 255, 0.5)" }}>REGRET_LATTICE_50x50</span>
            </div>
        </div>
    );
}
