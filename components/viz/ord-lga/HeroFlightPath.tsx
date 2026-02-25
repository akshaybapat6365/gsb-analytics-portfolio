"use client";

import { useEffect, useRef, useState } from "react";

// Steps 19–22: Animated ORD→LGA flight path with great-circle arc
export default function HeroFlightPath({ liftAmount = 567000 }: { liftAmount?: number }) {
    const pathRef = useRef<SVGPathElement>(null);
    const [mounted, setMounted] = useState(false);
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        setMounted(true);
        // Animate counter from 0 to liftAmount
        const start = performance.now();
        const duration = 1800;
        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
            setCounter(Math.round(liftAmount * ease));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [liftAmount]);

    useEffect(() => {
        if (pathRef.current) {
            const len = pathRef.current.getTotalLength();
            pathRef.current.style.setProperty("--path-length", `${len}`);
        }
    }, [mounted]);

    // ORD: Chicago (projected to simple x,y)
    // LGA: New York
    const w = 400, h = 220;
    const ordX = 60, ordY = 130;
    const lgaX = 340, lgaY = 110;
    const midX = (ordX + lgaX) / 2;
    const arcPeakY = 40; // arc apex
    const arcPath = `M ${ordX} ${ordY} Q ${midX} ${arcPeakY} ${lgaX} ${lgaY}`;

    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            height="100%"
            style={{ maxWidth: 400, maxHeight: 220 }}
            className="hero-flight-svg"
        >
            {/* Step 22: Faint grid background */}
            <defs>
                <pattern id="navGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(148,163,184,0.04)" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(148,163,184,0.04)" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width={w} height={h} fill="url(#navGrid)" />

            {/* Step 19: Flight arc with draw animation */}
            <path
                ref={pathRef}
                d={arcPath}
                fill="none"
                stroke="var(--radar-amber, #c9962b)"
                strokeWidth="2"
                strokeLinecap="round"
                className={mounted ? "flight-arc-animate" : "flight-arc-hidden"}
            />

            {/* Subtle shadow arc */}
            <path
                d={arcPath}
                fill="none"
                stroke="rgba(201,150,43,0.08)"
                strokeWidth="8"
                strokeLinecap="round"
            />

            {/* Step 19: Pulsing endpoint dots */}
            <circle cx={ordX} cy={ordY} r="5" fill="var(--radar-green, #3edd8f)" className="pulse-dot" />
            <circle cx={ordX} cy={ordY} r="3" fill="var(--radar-green, #3edd8f)" />
            <circle cx={lgaX} cy={lgaY} r="5" fill="var(--radar-green, #3edd8f)" className="pulse-dot" />
            <circle cx={lgaX} cy={lgaY} r="3" fill="var(--radar-green, #3edd8f)" />

            {/* Step 20: City labels */}
            <text x={ordX} y={ordY + 20} textAnchor="middle" fill="var(--radar-text-2, #94a3b8)" fontSize="10" fontFamily="var(--font-mono, 'JetBrains Mono', monospace)" letterSpacing="0.08em">
                ORD
            </text>
            <text x={lgaX} y={lgaY + 22} textAnchor="middle" fill="var(--radar-text-2, #94a3b8)" fontSize="10" fontFamily="var(--font-mono, 'JetBrains Mono', monospace)" letterSpacing="0.08em">
                LGA
            </text>

            {/* Step 20: Distance label */}
            <text x={midX} y={arcPeakY + 70} textAnchor="middle" fill="rgba(148,163,184,0.4)" fontSize="9" fontFamily="var(--font-mono, 'JetBrains Mono', monospace)">
                1,189 km
            </text>

            {/* Step 21: Revenue delta at arc apex */}
            <text x={midX} y={arcPeakY - 6} textAnchor="middle" fill="var(--radar-amber, #c9962b)" fontSize="14" fontWeight="600" fontFamily="var(--font-mono, 'JetBrains Mono', monospace)">
                ${Math.round(counter / 1000)}K at risk
            </text>

            <style>{`
        .flight-arc-hidden {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }
        .flight-arc-animate {
          stroke-dasharray: var(--path-length, 400);
          stroke-dashoffset: 0;
          transition: stroke-dashoffset 2s ease-in-out;
        }
        .pulse-dot {
          animation: pulseDot 2s ease-in-out infinite;
          opacity: 0.4;
        }
        @keyframes pulseDot {
          0%, 100% { r: 5; opacity: 0.3; }
          50% { r: 9; opacity: 0; }
        }
      `}</style>
        </svg>
    );
}
