"use client";

/**
 * BookingCascade — Line chart showing actual vs policy bookings
 * across booking windows for the selected day.
 * Data source: bookingCurve from useOrdLgaScrollytelling
 */

import { useState } from "react";
import { curveMonotoneX, line, max, scaleLinear } from "d3";
import { formatNumber } from "@/lib/metrics/format";

type BookingPoint = {
    window: number;
    actual: number;
    counterfactual: number;
};

type Props = {
    curve: BookingPoint[];
};

export function BookingCascade({ curve }: Props) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const width = 720;
    const height = 380;
    const margin = { top: 28, right: 24, bottom: 52, left: 64 };

    // Sort by window ascending
    const sorted = [...curve].sort((a, b) => a.window - b.window);

    const maxVal = max(sorted, (d) => Math.max(d.actual, d.counterfactual)) ?? 300;

    const x = scaleLinear()
        .domain([0, Math.max(1, sorted.length - 1)])
        .range([margin.left, width - margin.right]);
    const y = scaleLinear()
        .domain([0, maxVal * 1.15])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const actualLine = line<BookingPoint>()
        .curve(curveMonotoneX)
        .x((_, i) => x(i))
        .y((d) => y(d.actual));
    const policyLine = line<BookingPoint>()
        .curve(curveMonotoneX)
        .x((_, i) => x(i))
        .y((d) => y(d.counterfactual));

    return (
        <div className="radar-chart">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="radar-eyebrow">Booking Window Cascade</p>
                    <p className="mt-1 font-mono text-[12px] text-slate-400">
                        Avg bookings by window: actual vs algorithmic policy
                    </p>
                </div>
                <div className="flex gap-3">
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                        <span className="inline-block h-[2px] w-4 rounded" style={{ background: "rgba(148,163,184,0.7)" }} />
                        Actual
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: "var(--radar-amber)" }}>
                        <span className="inline-block h-[2px] w-4 rounded" style={{ background: "var(--radar-amber)" }} />
                        Policy
                    </span>
                </div>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-auto w-full">
                <defs>
                    <linearGradient id="booking-delta-fill" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(62,221,143,0.22)" />
                        <stop offset="100%" stopColor="rgba(62,221,143,0.02)" />
                    </linearGradient>
                </defs>

                {/* Grid */}
                {y.ticks(5).map((tick) => (
                    <g key={tick}>
                        <line
                            x1={margin.left}
                            x2={width - margin.right}
                            y1={y(tick)}
                            y2={y(tick)}
                            stroke="rgba(148,163,184,0.06)"
                            strokeDasharray="3 5"
                        />
                        <text
                            x={margin.left - 10}
                            y={y(tick) + 4}
                            textAnchor="end"
                            fontSize={10}
                            fill="rgba(148,163,184,0.5)"
                            fontFamily="JetBrains Mono, monospace"
                        >
                            {formatNumber(tick, { digits: 0 })}
                        </text>
                    </g>
                ))}

                {/* Lines */}
                <path
                    d={actualLine(sorted) ?? ""}
                    fill="none"
                    stroke="rgba(148,163,184,0.7)"
                    strokeWidth={2}
                />
                <path
                    d={policyLine(sorted) ?? ""}
                    fill="none"
                    stroke="var(--radar-amber)"
                    strokeWidth={2.5}
                />

                {/* Data points */}
                {sorted.map((point, i) => {
                    const isHovered = hoveredIdx === i;
                    return (
                        <g key={point.window}>
                            <circle
                                cx={x(i)}
                                cy={y(point.actual)}
                                r={isHovered ? 5 : 3}
                                fill="rgba(148,163,184,0.8)"
                                stroke="rgba(226,232,240,0.5)"
                                strokeWidth={0.8}
                                onMouseEnter={() => setHoveredIdx(i)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                style={{ cursor: "crosshair" }}
                            />
                            <circle
                                cx={x(i)}
                                cy={y(point.counterfactual)}
                                r={isHovered ? 5 : 3.5}
                                fill="var(--radar-amber)"
                                stroke="rgba(226,232,240,0.5)"
                                strokeWidth={0.8}
                                onMouseEnter={() => setHoveredIdx(i)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                style={{ cursor: "crosshair" }}
                            />
                            <text
                                x={x(i)}
                                y={height - margin.bottom + 20}
                                textAnchor="middle"
                                fontSize={10}
                                fill={isHovered ? "rgba(226,232,240,0.9)" : "rgba(148,163,184,0.7)"}
                                fontFamily="JetBrains Mono, monospace"
                            >
                                {point.window}d
                            </text>
                        </g>
                    );
                })}

                {/* Hover tooltip line */}
                {hoveredIdx !== null && (() => {
                    const point = sorted[hoveredIdx];
                    if (!point) return null;
                    const delta = point.counterfactual - point.actual;
                    return (
                        <g>
                            <line
                                x1={x(hoveredIdx)}
                                x2={x(hoveredIdx)}
                                y1={margin.top}
                                y2={height - margin.bottom}
                                stroke="rgba(226,232,240,0.25)"
                                strokeDasharray="3 4"
                            />
                            <text
                                x={x(hoveredIdx) + 8}
                                y={margin.top + 16}
                                fontSize={10}
                                fill="rgba(226,232,240,0.85)"
                                fontFamily="JetBrains Mono, monospace"
                            >
                                Δ {delta >= 0 ? "+" : ""}{formatNumber(delta, { digits: 0 })} pax
                            </text>
                        </g>
                    );
                })()}

                {/* Axis title */}
                <text
                    x={width / 2}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fill="rgba(148,163,184,0.45)"
                    style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
                >
                    Booking Window (days before departure)
                </text>
            </svg>
        </div>
    );
}
