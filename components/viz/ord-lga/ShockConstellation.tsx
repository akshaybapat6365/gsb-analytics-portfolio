"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { OrdShockEvent } from "./transforms";
import { NeuralEyebrow } from "./Typography";

const C = {
    steel: "#6B9FD4",
    rose: "#C75B5B",
} as const;

/**
 * Phase 4 (Step 52): ShockConstellation
 * A network graph identifying cascading effects of shock events.
 */
export function ShockConstellation({ events }: { events: OrdShockEvent[] }) {
    const nodes = useMemo(() => {
        return events.map((e, i) => {
            // Procedural layout logic for a network constellation
            const angle = (i / events.length) * Math.PI * 2;
            const radius = 80 + (e.severity === "high" ? 40 : 10) + Math.random() * 20;
            return {
                ...e,
                x: 150 + Math.cos(angle) * radius,
                y: 150 + Math.sin(angle) * radius,
            };
        });
    }, [events]);

    const links = useMemo(() => {
        const arr = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            arr.push({ source: nodes[i]!, target: nodes[i + 1]! });
            // High severity shocks link to random other nodes representing cascading damage
            if (nodes[i]!.severity === "high" && i + 3 < nodes.length) {
                arr.push({ source: nodes[i]!, target: nodes[i + 3]! });
            }
        }
        return arr;
    }, [nodes]);

    return (
        <div className="w-full aspect-square relative neural-glass-panel border-plasma-magenta/30 p-4 overflow-hidden">
            <NeuralEyebrow className="absolute top-4 left-6 z-10 text-plasma-magenta">SHOCK_CONSTELLATION_NET</NeuralEyebrow>

            <svg viewBox="0 0 300 300" className="w-full h-full mt-6" style={{ mixBlendMode: 'screen' }}>
                <defs>
                    <filter id="nodeGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Links */}
                {links.map((link, i) => (
                    <motion.line
                        key={i}
                        x1={link.source.x} y1={link.source.y}
                        x2={link.target.x} y2={link.target.y}
                        stroke={link.source.severity === "high" ? C.rose : C.steel}
                        strokeWidth={link.source.severity === "high" ? 1.5 : 0.5}
                        className="opacity-30"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: i * 0.1 }}
                    />
                ))}

                {/* Nodes */}
                {nodes.map((node, i) => (
                    <motion.g key={node.date} initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}>
                        <circle
                            cx={node.x} cy={node.y}
                            r={node.severity === "high" ? 6 : 3}
                            fill={node.severity === "high" ? C.rose : C.steel}
                            filter="url(#nodeGlow)"
                            className="animate-pulse"
                        />
                        {node.severity === "high" && (
                            <text x={node.x + 10} y={node.y + 3} fill={C.rose} fontSize={8} fontFamily="monospace" className="opacity-80">
                                SHOCK_{node.dayIndex}
                            </text>
                        )}
                    </motion.g>
                ))}

            </svg>
        </div>
    );
}
