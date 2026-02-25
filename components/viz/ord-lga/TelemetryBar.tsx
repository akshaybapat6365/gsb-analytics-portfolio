"use client";

/**
 * TelemetryBar — Minimal HUD footer
 * Stubbed version without zustand dependency.
 */
export function TelemetryBar() {
    return (
        <div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-between px-4 py-1.5 border-t border-white/[0.04] bg-[#050a12]/90 backdrop-blur-sm">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-mono)", color: "rgba(0, 240, 255, 0.3)" }}>
                ORD-LGA TELEMETRY
            </span>
            <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "rgba(226, 232, 240, 0.3)" }}>
                FPS: 60 | ACTIVE
            </span>
        </div>
    );
}
