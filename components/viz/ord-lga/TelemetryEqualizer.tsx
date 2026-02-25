"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Phase 5 (Step 65): Visual Equalizers
 * Thin glowing bars tracking an ambient sine wave, mocking an audio/telemetry equalizer
 * to boost visual richness in the sticky HUD areas.
 */
export function TelemetryEqualizer({ bars = 12 }: { bars?: number }) {
    const [volumes, setVolumes] = useState<number[]>(new Array(bars).fill(0.1));

    useEffect(() => {
        let animationFrameId: number;
        let t = 0;

        const renderLoop = () => {
            t += 0.05;
            const newVols = Array.from({ length: bars }, (_, i) => {
                // Pseudo-random overlapping sines for "ambient engine noise"
                const base = Math.sin(t + i * 0.5) * 0.3 + 0.5;
                const jitter = Math.random() * 0.3;
                return Math.max(0.1, Math.min(1, base + jitter));
            });
            setVolumes(newVols);
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        renderLoop();
        return () => cancelAnimationFrame(animationFrameId);
    }, [bars]);

    return (
        <div className="flex items-end gap-[2px] h-6">
            {volumes.map((vol, i) => (
                <motion.div
                    key={i}
                    className="w-1 bg-plasma-cyan shadow-[0_0_5px_var(--plasma-cyan)]"
                    animate={{ height: `${vol * 100}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                />
            ))}
        </div>
    );
}
