"use client";

import { useMemo, useState } from "react";
import type { NarrativeNode } from "./transforms";

// Steps 56–59: Vertical scrollytelling timeline with linked nodes
export default function NarrativeTimeline({
    nodes,
    selectedIndex,
    onSelectIndex,
}: {
    nodes: NarrativeNode[];
    selectedIndex: number;
    onSelectIndex: (idx: number) => void;
}) {
    const [expandedNode, setExpandedNode] = useState<number | null>(null);

    const nodeColors = useMemo(() => ({
        narrative: "var(--radar-amber, #c9962b)",
        shock: "var(--radar-crimson, #e0453a)",
        annotation: "var(--radar-cyan, #22d3ee)",
    }), []);

    const severityBadge = (severity?: string) => {
        if (!severity) return null;
        const colors: Record<string, string> = {
            low: "var(--radar-cyan)",
            med: "var(--radar-amber)",
            high: "var(--radar-crimson)",
        };
        return (
            <span
                className="inline-block rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                style={{
                    color: colors[severity] ?? "var(--radar-text-2)",
                    border: `1px solid ${colors[severity] ?? "rgba(148,163,184,0.2)"}`,
                    background: "rgba(0,0,0,0.3)",
                }}
            >
                {severity}
            </span>
        );
    };

    return (
        <div className="radar-chart p-5">
            <p className="radar-eyebrow mb-4">Investigation Timeline</p>
            <div className="relative max-h-[500px] overflow-y-auto pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,150,43,0.15) transparent" }}>
                {/* Central vertical line */}
                <div
                    className="absolute left-[18px] top-2 bottom-2 w-px"
                    style={{ background: "rgba(148,163,184,0.08)" }}
                />

                {nodes.map((node, i) => {
                    const isActive = node.dayIndex === selectedIndex;
                    const isExpanded = expandedNode === i;
                    const side = i % 2 === 0; // alternate left/right visually, but keep vertical

                    return (
                        <div
                            key={`${node.date}-${i}`}
                            className="relative flex items-start gap-4 py-2.5"
                            style={{
                                animation: `fadeSlideUp 0.4s ease-out ${i * 100}ms both`,
                                paddingLeft: "40px",
                            }}
                        >
                            {/* Node dot */}
                            <div
                                className="absolute left-[14px] top-[14px] z-10 flex items-center justify-center"
                                style={{ width: 10, height: 10 }}
                            >
                                <div
                                    className="rounded-full"
                                    style={{
                                        width: isActive ? 10 : 7,
                                        height: isActive ? 10 : 7,
                                        background: nodeColors[node.type],
                                        boxShadow: isActive ? `0 0 8px ${nodeColors[node.type]}` : "none",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                                {node.type === "shock" && (
                                    <div
                                        className="absolute rounded-full"
                                        style={{
                                            width: 14,
                                            height: 14,
                                            border: `1px solid ${nodeColors.shock}`,
                                            opacity: 0.4,
                                            animation: "pulseDot 2s ease-in-out infinite",
                                        }}
                                    />
                                )}
                            </div>

                            {/* Content card */}
                            <button
                                type="button"
                                className="flex-1 rounded-lg border p-3 text-left transition-all"
                                style={{
                                    borderColor: isActive ? nodeColors[node.type] : "rgba(148,163,184,0.06)",
                                    background: isActive ? "rgba(201,150,43,0.04)" : "transparent",
                                    boxShadow: isActive ? `0 0 16px rgba(201,150,43,0.06)` : "none",
                                }}
                                onClick={() => {
                                    onSelectIndex(node.dayIndex);
                                    setExpandedNode(isExpanded ? null : i);
                                }}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-[10px]" style={{ color: nodeColors[node.type] }}>
                                        {node.date}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {node.severity && severityBadge(node.severity)}
                                        {node.metric !== undefined && (
                                            <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--radar-green)" }}>
                                                {node.metric >= 0 ? "+" : ""}${Math.round(node.metric).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-1 text-[13px] font-medium text-slate-200 leading-tight">{node.title}</p>
                                {(isExpanded || isActive) && (
                                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{node.body}</p>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
