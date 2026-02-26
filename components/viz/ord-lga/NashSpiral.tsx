"use client";

import { useMemo, useRef } from "react";
import { useIsomorphicLayoutEffect, animate } from "framer-motion";
import { NeuralEyebrow } from "./Typography";
import { cn } from "@/lib/utils";
import type { OrdNashState } from "./transforms";

const C = {
    steel: "#6B9FD4",
    sage: "#4CAF7D",
    rose: "#C75B5B",
} as const;

/**
 * Phase 4 (Step 44): NashSpiral
 * Visualizes the Nash equilibrium convergence using polar coordinates,
 * replacing the standard cartesian matrix simulation.
 */
export function NashSpiral({ states = [], convergenceDay }: { states?: OrdNashState[], convergenceDay?: number }) {
    const svgRef = useRef<SVGSVGElement>(null);

    const SIZE = 400;
    const CENTER = SIZE / 2;
    const MAX_RADIUS = SIZE / 2 - 20;

    // Transform states into polar coordinates
    const spiralPoints = useMemo(() => {
        if (!states || states.length === 0) return [];
        return states.map((s, i) => {
            const progress = i / states.length; // 0 to 1
            const angle = progress * Math.PI * 6; // 3 full rotations
            const radius = MAX_RADIUS * (1 - progress); // Spirals inward

            const x = CENTER + radius * Math.cos(angle);
            const y = CENTER + radius * Math.sin(angle);

            const isConverged = convergenceDay && i >= convergenceDay;
            const color = isConverged ? C.sage : C.rose;

            return { x, y, color, radius, isConverged, angle };
        });
    }, [states, convergenceDay]);

    const pathData = useMemo(() => {
        if (spiralPoints.length < 2) return "";
        return `M ${spiralPoints[0].x},${spiralPoints[0].y} ` +
            spiralPoints.slice(1).map(p => `L ${p.x},${p.y}`).join(" ");
    }, [spiralPoints]);

    useIsomorphicLayoutEffect(() => {
        if (svgRef.current) {
            // Animate dasharray for drawing effect
            const path = svgRef.current.querySelector('.spiral-path') as SVGPathElement;
            if (path) {
                const len = path.getTotalLength();
                path.style.strokeDasharray = `${len}`;
                path.style.strokeDashoffset = `${len}`;
                animate(path, { strokeDashoffset: [len, 0] }, { duration: 2, ease: "easeOut" });
            }
        }
    }, [spiralPoints]);

    return (
        <div className="w-full aspect-square relative neural-glass-panel border-plasma-cyan/30 flex items-center justify-center p-6">
            <div className="absolute top-4 left-6 z-10">
                <NeuralEyebrow className="text-plasma-magenta">NASH_EQUILIBRIUM_CONVERGENCE</NeuralEyebrow>
                {convergenceDay ? (
                    <p className="font-mono text-xs text-frost-white mt-1">Converged at t+{convergenceDay}</p>
                ) : (
                    <p className="font-mono text-xs text-plasma-purple mt-1 blink">Calculating...</p>
                )}
            </div>

            <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full max-w-[400px] overflow-visible">
                {/* Ambient Grid Rings */}
                {[0.25, 0.5, 0.75, 1].map(scale => (
                    <circle
                        key={scale}
                        cx={CENTER} cy={CENTER} r={MAX_RADIUS * scale}
                        fill="none" stroke={C.steel} strokeWidth="0.5" strokeDasharray="2 4"
                        className="opacity-20"
                    />
                ))}
                <line x1={CENTER} y1={20} x2={CENTER} y2={SIZE - 20} stroke={C.steel} strokeWidth="0.5" className="opacity-20" />
                <line x1={20} y1={CENTER} x2={SIZE - 20} y2={CENTER} stroke={C.steel} strokeWidth="0.5" className="opacity-20" />

                {/* Glow Filter */}
                <defs>
                    <filter id="spiralGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* The Spiral Path */}
                <path
                    className="spiral-path"
                    d={pathData}
                    fill="none"
                    stroke="url(#spiralGradient)"
                    strokeWidth="3"
                    filter="url(#spiralGlow)"
                    style={{ mixBlendMode: 'screen' }}
                />

                {/* Gradient for Path */}
                <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={C.rose} />
                    <stop offset="100%" stopColor={C.sage} />
                </linearGradient>

                {/* Nodes */}
                {spiralPoints.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x} cy={p.y} r={p.isConverged ? 4 : 2}
                        fill={p.color}
                        filter="url(#spiralGlow)"
                        className={cn("transition-all duration-300", p.isConverged && "animate-pulse")}
                    />
                ))}

                {/* Converged Center Point */}
                {convergenceDay && (
                    <circle
                        cx={CENTER} cy={CENTER} r={8}
                        fill={C.sage} filter="url(#spiralGlow)"
                        className="animate-pulse"
                    />
                )}
            </svg>
        </div>
    );
}
