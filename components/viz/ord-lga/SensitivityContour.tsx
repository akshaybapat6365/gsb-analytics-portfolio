"use client";

/**
 * SensitivityContour — D3 contour/heatmap of lift across
 * elasticity × competitor-reactivity surface.
 * Data source: payload.sensitivitySummary.grid
 */

import { useMemo, useState } from "react";
import { scaleLinear, scaleBand, interpolateRgbBasis, scaleSequential, extent } from "d3";
import { formatPct, formatUSD } from "@/lib/metrics/format";

type GridPoint = {
    elasticity: number;
    competitorReactivity: number;
    incrementalRevenue: number;
    liftPct: number;
};

type Props = {
    grid: GridPoint[];
    bestCase?: GridPoint | null;
    worstCase?: GridPoint | null;
};

export function SensitivityContour({ grid, bestCase, worstCase }: Props) {
    const [hovered, setHovered] = useState<GridPoint | null>(null);

    const width = 720;
    const height = 440;
    const margin = { top: 36, right: 24, bottom: 56, left: 72 };

    const elasticities = useMemo(
        () => [...new Set(grid.map((g) => g.elasticity))].sort((a, b) => a - b),
        [grid],
    );
    const reactivities = useMemo(
        () => [...new Set(grid.map((g) => g.competitorReactivity))].sort((a, b) => a - b),
        [grid],
    );

    const x = scaleBand<number>()
        .domain(reactivities)
        .range([margin.left, width - margin.right])
        .padding(0.06);
    const y = scaleBand<number>()
        .domain(elasticities)
        .range([margin.top, height - margin.bottom])
        .padding(0.06);

    const [lo, hi] = extent(grid, (d) => d.incrementalRevenue) as [number, number];
    const color = scaleSequential([lo, hi], (t) =>
        interpolateRgbBasis([
            "rgba(224,69,58,0.85)",
            "rgba(15,20,36,0.6)",
            "rgba(201,150,43,0.9)",
            "rgba(62,221,143,0.9)",
        ])(t),
    );

    return (
        <div className="radar-chart">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="radar-eyebrow">Sensitivity Surface</p>
                    <p className="mt-1 font-mono text-[12px] text-slate-400">
                        Incremental lift across elasticity × competitor reactivity
                    </p>
                </div>
                <p className="font-mono text-[13px]" style={{ color: "var(--radar-amber)" }}>
                    {hovered
                        ? `ε=${hovered.elasticity.toFixed(1)} · r=${hovered.competitorReactivity.toFixed(1)} · ${formatUSD(hovered.incrementalRevenue)}`
                        : `${grid.length} grid points`}
                </p>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-auto w-full">
                {/* Y-axis labels */}
                {elasticities.map((e) => (
                    <text
                        key={`y-${e}`}
                        x={margin.left - 12}
                        y={(y(e) ?? margin.top) + y.bandwidth() / 2 + 4}
                        textAnchor="end"
                        fontSize={11}
                        fill="rgba(148,163,184,0.8)"
                        fontFamily="JetBrains Mono, monospace"
                    >
                        ε {e.toFixed(1)}
                    </text>
                ))}

                {/* X-axis labels */}
                {reactivities.map((r) => (
                    <text
                        key={`x-${r}`}
                        x={(x(r) ?? margin.left) + x.bandwidth() / 2}
                        y={height - margin.bottom + 22}
                        textAnchor="middle"
                        fontSize={11}
                        fill="rgba(148,163,184,0.8)"
                        fontFamily="JetBrains Mono, monospace"
                    >
                        {r.toFixed(1)}
                    </text>
                ))}

                {/* Axis titles */}
                <text
                    x={width / 2}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fill="rgba(148,163,184,0.55)"
                    style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
                >
                    Competitor Reactivity
                </text>
                <text
                    x={14}
                    y={height / 2}
                    textAnchor="middle"
                    fontSize={10}
                    fill="rgba(148,163,184,0.55)"
                    style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
                    transform={`rotate(-90, 14, ${height / 2})`}
                >
                    Elasticity
                </text>

                {/* Heat cells */}
                {grid.map((point) => {
                    const xx = x(point.competitorReactivity) ?? margin.left;
                    const yy = y(point.elasticity) ?? margin.top;
                    const isBest = bestCase && point.elasticity === bestCase.elasticity && point.competitorReactivity === bestCase.competitorReactivity;
                    const isWorst = worstCase && point.elasticity === worstCase.elasticity && point.competitorReactivity === worstCase.competitorReactivity;
                    const isHovered = hovered?.elasticity === point.elasticity && hovered?.competitorReactivity === point.competitorReactivity;

                    return (
                        <g key={`${point.elasticity}-${point.competitorReactivity}`}>
                            <rect
                                x={xx}
                                y={yy}
                                width={x.bandwidth()}
                                height={y.bandwidth()}
                                rx={6}
                                fill={color(point.incrementalRevenue)}
                                stroke={
                                    isHovered
                                        ? "rgba(226,232,240,0.9)"
                                        : isBest
                                            ? "var(--radar-green)"
                                            : isWorst
                                                ? "var(--radar-crimson)"
                                                : "rgba(255,255,255,0.04)"
                                }
                                strokeWidth={isHovered || isBest || isWorst ? 2 : 0.5}
                                onMouseEnter={() => setHovered(point)}
                                onMouseLeave={() => setHovered(null)}
                                style={{ cursor: "crosshair" }}
                            />
                            {/* Value label inside cells */}
                            <text
                                x={xx + x.bandwidth() / 2}
                                y={yy + y.bandwidth() / 2 + 4}
                                textAnchor="middle"
                                fontSize={10}
                                fill="rgba(226,232,240,0.7)"
                                fontFamily="JetBrains Mono, monospace"
                                pointerEvents="none"
                            >
                                {formatUSD(point.incrementalRevenue)}
                            </text>
                            {/* Best/worst markers */}
                            {isBest && (
                                <text
                                    x={xx + x.bandwidth() / 2}
                                    y={yy + 14}
                                    textAnchor="middle"
                                    fontSize={8}
                                    fill="var(--radar-green)"
                                    fontFamily="JetBrains Mono, monospace"
                                    pointerEvents="none"
                                >
                                    ▲ BEST
                                </text>
                            )}
                            {isWorst && (
                                <text
                                    x={xx + x.bandwidth() / 2}
                                    y={yy + 14}
                                    textAnchor="middle"
                                    fontSize={8}
                                    fill="var(--radar-crimson)"
                                    fontFamily="JetBrains Mono, monospace"
                                    pointerEvents="none"
                                >
                                    ▼ WORST
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-3">
                <div
                    className="h-2.5 w-32 rounded-full"
                    style={{
                        background: `linear-gradient(90deg, rgba(224,69,58,0.85), rgba(15,20,36,0.6), rgba(201,150,43,0.9), rgba(62,221,143,0.9))`,
                    }}
                />
                <p className="font-mono text-[10px] text-slate-500">
                    {formatUSD(lo)} → {formatUSD(hi)} incremental revenue
                </p>
            </div>
        </div>
    );
}
