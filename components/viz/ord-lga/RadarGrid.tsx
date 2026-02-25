"use client";

/**
 * RadarGrid — Concentric ring + radial line background for chart containers.
 * Gives the aviation radar terminal aesthetic.
 */
export function RadarGrid({
    width = 800,
    height = 400,
    rings = 5,
    radials = 12,
    className,
}: {
    width?: number;
    height?: number;
    rings?: number;
    radials?: number;
    className?: string;
}) {
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(cx, cy) * 0.92;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
            <defs>
                <radialGradient id="radar-fade" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(201,150,43,0.04)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>

            {/* Ambient glow */}
            <circle cx={cx} cy={cy} r={maxR} fill="url(#radar-fade)" />

            {/* Concentric rings */}
            {Array.from({ length: rings }, (_, i) => {
                const r = (maxR / rings) * (i + 1);
                return (
                    <circle
                        key={`ring-${i}`}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke="rgba(148,163,184,0.06)"
                        strokeWidth={0.8}
                    />
                );
            })}

            {/* Radial lines */}
            {Array.from({ length: radials }, (_, i) => {
                const angle = (Math.PI * 2 * i) / radials;
                const x2 = cx + Math.cos(angle) * maxR;
                const y2 = cy + Math.sin(angle) * maxR;
                return (
                    <line
                        key={`radial-${i}`}
                        x1={cx}
                        y1={cy}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(148,163,184,0.04)"
                        strokeWidth={0.6}
                    />
                );
            })}
        </svg>
    );
}
