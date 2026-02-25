"use client";
export function GLSLSensitivity() {
    return (
        <div className="w-full min-h-[350px] relative rounded-lg overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0a1628] via-[#1a0a2e] to-[#0c2041]">
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-mono)", color: "rgba(139, 0, 255, 0.5)" }}>NOISE_CONTOUR_MATRIX</span>
            </div>
        </div>
    );
}
