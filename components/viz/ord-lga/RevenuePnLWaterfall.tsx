"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PnLBar } from "./transforms";
import { AnimatedNeonCounter } from "./AnimatedNeonCounter";

/**
 * Phase 4: Extreme Density SVG Refactor (Revenue PnL Waterfall)
 * Rebuilt using Framer Motion staggered cascades and the Plasma Glassmorphism aesthetic.
 */

export function NeuralPnLWaterfall({ data }: { data: PnLBar[] }) {
    if (!data?.length) return null;

    // Extract dimensions
    const minVal = Math.min(...data.map(d => Math.min(d.start, d.end)));
    const maxVal = Math.max(...data.map(d => Math.max(d.start, d.end)));
    const range = maxVal - minVal || 1;

    // Padding for the SVG Y scale
    const yMin = minVal - range * 0.1;
    const yMax = maxVal + range * 0.1;
    const yRange = yMax - yMin;

    const width = 800;
    const height = 400;
    const pxPerY = height / yRange;
    const barWidth = (width / data.length) * 0.6; // 60% width

    return (
        <div className="w-full aspect-[2/1] relative neural-glass-panel border-plasma-cyan/30 p-6 overflow-hidden">
            <div className="absolute top-4 left-6 z-10">
                <span className="neural-eyebrow text-plasma-cyan tracking-widest">REVENUE_DECOMPOSITION_MATRIX</span>
                <h4 className="text-frost-white font-mono mt-2">ALGORITHMIC ALPHA GENERATION</h4>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible mt-8" preserveAspectRatio="none">

                {/* Subtle grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                    const yPos = height - (tick * height);
                    const val = yMin + tick * yRange;
                    return (
                        <g key={tick} className="opacity-30">
                            <line x1={0} x2={width} y1={yPos} y2={yPos} stroke="#00F0FF" strokeWidth="0.5" strokeDasharray="4 4" />
                            <text x={0} y={yPos - 4} fill="#00F0FF" fontSize={12} fontFamily="monospace">
                                ${(val / 1000).toFixed(0)}k
                            </text>
                        </g>
                    );
                })}

                {/* Render staggered waterfall bars */}
                {data.map((bar, i) => {
                    const x = (i / data.length) * width + ((width / data.length) - barWidth) / 2;

                    const yTop = height - ((Math.max(bar.start, bar.end) - yMin) * pxPerY);
                    const yBot = height - ((Math.min(bar.start, bar.end) - yMin) * pxPerY);
                    const barH = Math.max(2, yBot - yTop);

                    const isTotal = bar.category.toLowerCase().includes("total");
                    const isUp = bar.end > bar.start;

                    let fill = "#8B00FF"; // Purple for neutral/total
                    let glow = "url(#glowPurple)";
                    if (!isTotal) {
                        fill = isUp ? "#00F0FF" : "#FF007F";
                        glow = isUp ? "url(#glowCyan)" : "url(#glowMagenta)";
                    }

                    return (
                        <g key={bar.category}>
                            {/* Animated Bar */}
                            <motion.rect
                                x={x}
                                width={barWidth}
                                fill={fill}
                                filter={glow}
                                rx={2}
                                initial={{ y: height, height: 0, opacity: 0 }}
                                animate={{ y: yTop, height: barH, opacity: 0.8 }}
                                transition={{
                                    duration: 0.8,
                                    delay: i * 0.1,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 12
                                }}
                            />

                            {/* Glowing Value Text */}
                            <motion.text
                                x={x + barWidth / 2}
                                y={yTop - 12}
                                textAnchor="middle"
                                fill={fill}
                                fontSize={14}
                                fontFamily="Space Mono, monospace"
                                fontWeight="bold"
                                initial={{ opacity: 0, y: yTop }}
                                animate={{ opacity: 1, y: yTop - 12 }}
                                transition={{ delay: i * 0.1 + 0.4 }}
                            >
                                ${Math.abs(bar.value).toLocaleString()}
                            </motion.text>

                            {/* Label */}
                            <motion.text
                                x={x + barWidth / 2}
                                y={height + 24}
                                textAnchor="middle"
                                fill="#E2E8F0"
                                fontSize={12}
                                fontFamily="Space Mono, monospace"
                                className="opacity-60"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 + 0.5 }}
                            >
                                {bar.category.split(" ")[0]}
                            </motion.text>
                        </g>
                    );
                })}

                {/* SVG Defs for Glassmorphic glow */}
                <defs>
                    <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glowMagenta" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glowPurple" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </div>
    );
}

export default NeuralPnLWaterfall;
