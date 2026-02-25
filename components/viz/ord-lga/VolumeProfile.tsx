"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { OrdDerivedDay } from "./transforms";
import { NeuralEyebrow } from "./Typography";

/**
 * Phase 4 (Step 51): VolumeProfile
 * A horizontal histogram representing aggregate volumes at specific price nodes,
 * rendered with intense glowing overlapping bars.
 */
export function VolumeProfile({ data }: { data: OrdDerivedDay[] }) {
    const bins = useMemo(() => {
        // Bin data into $10 increments for volume profile
        const minPrice = 150;
        const maxPrice = 400;
        const binSize = 10;
        const binCounts = new Array(Math.ceil((maxPrice - minPrice) / binSize)).fill(0);

        data.forEach(d => {
            const pIndex = Math.max(0, Math.min(binCounts.length - 1, Math.floor((d.policyPrice - minPrice) / binSize)));
            binCounts[pIndex] += d.policyPax;
        });

        return binCounts.map((vol, i) => ({
            priceBin: minPrice + i * binSize,
            volume: vol
        }));
    }, [data]);

    const maxVol = Math.max(...bins.map(b => b.volume), 1);
    const H = 300;
    const W = 300;

    return (
        <div className="w-full aspect-square relative neural-glass-panel border-plasma-cyan/30 p-4">
            <NeuralEyebrow className="absolute top-4 left-6 z-10 text-plasma-cyan">VOLUME_PROFILE_MATRIX</NeuralEyebrow>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full mt-8" style={{ mixBlendMode: 'screen' }}>
                <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#FF007F" stopOpacity="0.1" />
                    </linearGradient>
                    <filter id="volGlow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Y Axis Line */}
                <line x1={40} y1={0} x2={40} y2={H} stroke="#00F0FF" strokeWidth="1" className="opacity-40" />

                {bins.map((b, i) => {
                    const y = H - ((i + 1) / bins.length) * H;
                    const barW = (b.volume / maxVol) * (W - 50);
                    const barH = (H / bins.length) - 1;

                    if (b.volume === 0) return null;

                    return (
                        <g key={i}>
                            <text x={35} y={y + barH / 2 + 3} fill="#E2E8F0" fontSize={8} fontFamily="monospace" textAnchor="end" className="opacity-60">
                                ${b.priceBin}
                            </text>
                            <motion.rect
                                x={40}
                                y={y}
                                height={barH}
                                fill="url(#volGrad)"
                                filter="url(#volGlow)"
                                initial={{ width: 0 }}
                                whileInView={{ width: barW }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.8, delay: i * 0.02, type: "spring" }}
                            />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
