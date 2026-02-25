"use client";

import { useEffect, useState, useRef } from "react";
import { usePriceWarStore } from "./global-state";
import { NeuralEyebrow } from "./Typography";
import { cn } from "@/lib/utils";
import { animate } from "framer-motion";

/**
 * Phase 3 (Step 35): ShaderTooltip
 * A custom fast tooltip that reads raw pointer positions over the WebGL 
 * context to provide simulated pixel data without expensive DOM events.
 */
export function ShaderTooltip({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Simulated matrix lookup values
    const [metrics, setMetrics] = useState({ value: 0, confidence: 0 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handlePointerMove = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setPos({ x, y });

            // Compute proxy values mapped to coordinates
            const nx = x / rect.width;
            const ny = y / rect.height;
            const simulatedValue = Math.sin(nx * 10) * Math.cos(ny * 10) * 500 + 500;

            setMetrics({
                value: simulatedValue,
                confidence: 100 - (Math.abs(nx - 0.5) * 100)
            });

            if (!visible) setVisible(true);
        };

        const handlePointerLeave = () => setVisible(false);

        el.addEventListener("pointermove", handlePointerMove);
        el.addEventListener("pointerleave", handlePointerLeave);

        return () => {
            el.removeEventListener("pointermove", handlePointerMove);
            el.removeEventListener("pointerleave", handlePointerLeave);
        };
    }, [containerRef, visible]);

    // Spring physics for tooltip positioning
    useEffect(() => {
        if (tooltipRef.current && visible) {
            animate(tooltipRef.current, {
                x: pos.x + 15,
                y: pos.y + 15,
                opacity: 1,
                scale: 1,
            }, { type: "spring", stiffness: 300, damping: 20 });
        } else if (tooltipRef.current) {
            animate(tooltipRef.current, { opacity: 0, scale: 0.95 }, { duration: 0.1 });
        }
    }, [pos, visible]);

    return (
        <div
            ref={tooltipRef}
            className={cn(
                "absolute top-0 left-0 pointer-events-none z-50",
                "neural-glass-panel p-3 min-w-[140px] border border-plasma-cyan/30 shadow-[0_0_15px_-3px_rgba(0,240,255,0.3)]",
                "will-change-transform"
            )}
            style={{ opacity: 0 }} // Managed by framer-motion above
        >
            <NeuralEyebrow className="text-plasma-cyan mb-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-plasma-cyan animate-pulse" />
                GPU_SAMPLE
            </NeuralEyebrow>
            <div className="flex flex-col gap-0.5 mt-2 font-mono text-xs">
                <div className="flex justify-between">
                    <span className="text-frost-white/60">VAL</span>
                    <span className="text-plasma-magenta">{(metrics.value).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-frost-white/60">CONF</span>
                    <span className="text-frost-white/90">{metrics.confidence.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
}
