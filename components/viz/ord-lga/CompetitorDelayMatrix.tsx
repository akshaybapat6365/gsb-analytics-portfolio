"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { CompetitorLagPoint } from "./transforms";
import { NeuralEyebrow } from "./Typography";

/**
 * Phase 4 (Step 46): CompetitorDelayMatrix
 * An adjacency matrix layout showing UAL price moves against DL response delays.
 */
export function CompetitorDelayMatrix({ data }: { data: CompetitorLagPoint[] }) {
    const SIZE = 300;

    // Create a 10x10 heat matrix representing delay density
    const matrix = useMemo(() => {
        const grid = Array.from({ length: 10 }, () => new Array(10).fill(0));
        let max = 1;

        if (!data?.length) return { grid: Array.from({ length: 10 }, () => new Array(10).fill(0)), max: 1 };

        data.forEach(d => {
            if (!d || d.spread == null || d.delayDays == null) return;
            // Mapping spread to X (0-9)
            const spreadAbs = Math.abs(d.spread);
            const x = Math.min(9, Math.floor((spreadAbs / 50) * 10));

            // Mapping delay days to Y (0-9)
            const delayVal = Number(d.delayDays);
            if (isNaN(delayVal)) return;
            const delay = Math.min(9, Math.max(0, Math.floor(delayVal)));

            grid[delay][x] += 1;
            if (grid[delay][x] > max) max = grid[delay][x];
        });

        return { grid, max };
    }, [data]);

    return (
        <div className="w-full aspect-square relative neural-glass-panel border-plasma-purple/30 p-4">
            <NeuralEyebrow className="absolute top-4 left-6 z-10 text-plasma-purple">DELAY_ADJACENCY_MATRIX</NeuralEyebrow>

            <div className="w-full h-full mt-8 flex flex-wrap gap-0.5">
                {matrix.grid.map((row, y) =>
                    row.map((val, x) => {
                        const intensity = val / matrix.max;
                        return (
                            <motion.div
                                key={`${x}-${y}`}
                                className={cn("w-full h-full rounded-[1px] mix-blend-screen")}
                                style={{
                                    backgroundColor: intensity > 0 ? "#8B00FF" : "rgba(139, 0, 255, 0.05)",
                                    opacity: intensity > 0 ? 0.3 + intensity * 0.7 : 0.5
                                }}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: (x + y) * 0.02 }}
                            />
                        )
                    })
                )}
            </div>

            {/* Axis Labels */}
            <div className="absolute bottom-2 left-6 right-6 flex justify-between font-mono text-[8px] text-frost-white/40 uppercase">
                <span>Low Spread</span>
                <span>High Spread</span>
            </div>
            <div className="absolute top-12 bottom-6 left-2 flex flex-col justify-between font-mono text-[8px] text-frost-white/40 uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                <span>Delay: 0d</span>
                <span>Delay: 10d+</span>
            </div>
        </div>
    );
}
