"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { NeuralEyebrow } from "./Typography";
import { cn } from "@/lib/utils";

/**
 * Phase 4 (Step 53): ValidationRadar
 * Animated glowing radar metric comparison.
 */

interface RadarMetric {
    label: string;
    actual: number;
    simulated: number; // 0 to 100
}

const mockMetrics: RadarMetric[] = [
    { label: "Yield (¢)", actual: 85, simulated: 88 },
    { label: "Load Factor", actual: 92, simulated: 95 },
    { label: "Win Rate", actual: 70, simulated: 78 },
    { label: "Rev Premium", actual: 60, simulated: 65 },
    { label: "Share Retention", actual: 80, simulated: 86 }
];

export function ValidationRadar({ data = mockMetrics }) {
    const SIZE = 300;
    const CENTER = SIZE / 2;
    const RADIUS = SIZE / 2 - 40;

    const getPoints = (isSimulated: boolean) => {
        return data.map((d, i) => {
            const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
            const value = isSimulated ? d.simulated : d.actual;
            const r = (value / 100) * RADIUS;
            return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`;
        }).join(" ");
    };

    const actualPoints = useMemo(() => getPoints(false), [data]);
    const simPoints = useMemo(() => getPoints(true), [data]);

    return (
        <div className="w-full aspect-square relative neural-glass-panel border-plasma-cyan/30 flex items-center justify-center p-6">
            <div className="absolute top-4 left-6 z-10 w-full">
                <NeuralEyebrow className="text-plasma-cyan">MODEL_VALIDATION_MATRIX</NeuralEyebrow>
                <div className="flex gap-4 mt-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-frost-white/30" /> ACTUAL</span>
                    <span className="flex items-center gap-1 text-plasma-magenta"><div className="w-2 h-2 bg-plasma-magenta shadow-[0_0_8px_var(--plasma-magenta)]" /> SIMULATED</span>
                </div>
            </div>

            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full max-w-[300px] overflow-visible mt-8">
                {/* Web Grid */}
                {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
                    <polygon
                        key={scale}
                        points={data.map((_, i) => {
                            const a = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                            return `${CENTER + RADIUS * scale * Math.cos(a)},${CENTER + RADIUS * scale * Math.sin(a)}`;
                        }).join(" ")}
                        fill="none" stroke="#00F0FF" strokeWidth="0.5" className="opacity-20"
                    />
                ))}

                {/* Axes */}
                {data.map((d, i) => {
                    const a = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    const x = CENTER + RADIUS * Math.cos(a);
                    const y = CENTER + RADIUS * Math.sin(a);
                    const labelX = CENTER + (RADIUS + 20) * Math.cos(a);
                    const labelY = CENTER + (RADIUS + 20) * Math.sin(a);
                    return (
                        <g key={d.label}>
                            <line x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#00F0FF" strokeWidth="0.5" className="opacity-30" />
                            <text x={labelX} y={labelY} fill="#E2E8F0" fontSize={9} fontFamily="monospace" textAnchor="middle" alignmentBaseline="middle" className="uppercase opacity-60">
                                {d.label}
                            </text>
                        </g>
                    )
                })}

                {/* Actual Polygon */}
                <polygon points={actualPoints} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2 2" />

                {/* Glow */}
                <defs>
                    <filter id="radarGlow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Simulated Polygon */}
                <motion.polygon
                    points={simPoints}
                    fill="rgba(255, 0, 127, 0.2)"
                    stroke="#FF007F"
                    strokeWidth="2"
                    filter="url(#radarGlow)"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
                    style={{ transformOrigin: "center" }}
                />
            </svg>
        </div>
    );
}
