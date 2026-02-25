"use client";

/**
 * AblationWaterfall — Waterfall chart showing the incremental
 * contribution of each model component vs baseline.
 * Data source: payload.ablationSummary
 */

import { scaleLinear, scaleBand, max } from "d3";
import { formatUSD, formatPct } from "@/lib/metrics/format";

type AblationRow = {
    scenario: string;
    incrementalRevenue: number;
    actualRevenue: number;
    simRevenue: number;
    liftPct: number;
    meanRegret: number;
};

type Props = {
    rows: AblationRow[];
};

const SCENARIO_LABELS: Record<string, string> = {
    full_policy: "Full Policy",
    no_competitor_response: "No Competitor Response",
    no_shock_adjustment: "No Shock Adjustment",
    static_elasticity_soft: "Static Elasticity (Soft)",
    static_baseline: "Static Baseline",
};

export function AblationWaterfall({ rows }: Props) {
    if (rows.length === 0) return null;

    const width = 720;
    const height = 380;
    const margin = { top: 28, right: 28, bottom: 68, left: 80 };

    const sorted = [...rows].sort((a, b) => b.incrementalRevenue - a.incrementalRevenue);
    const scenarios = sorted.map((r) => r.scenario);
    const maxVal = (max(sorted, (d) => d.incrementalRevenue) ?? 1) * 1.15;

    const x = scaleBand<string>()
        .domain(scenarios)
        .range([margin.left, width - margin.right])
        .padding(0.28);
    const y = scaleLinear()
        .domain([0, maxVal])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const barColor = (row: AblationRow) => {
        if (row.scenario === "full_policy") return "var(--radar-green)";
        if (row.incrementalRevenue < sorted[sorted.length - 1].incrementalRevenue * 1.5)
            return "var(--radar-crimson)";
        return "var(--radar-amber)";
    };

    return (
        <div className="radar-chart">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="radar-eyebrow">Model Ablation Study</p>
                    <p className="mt-1 font-mono text-[12px] text-slate-400">
                        Component-level contribution to incremental revenue
                    </p>
                </div>
                <p className="font-mono text-[12px] text-slate-500">
                    {rows.length} scenarios
                </p>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-auto w-full">
                {/* Horizontal grid lines */}
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
                            fill="rgba(148,163,184,0.6)"
                            fontFamily="JetBrains Mono, monospace"
                        >
                            {formatUSD(tick)}
                        </text>
                    </g>
                ))}

                {/* Bars */}
                {sorted.map((row) => {
                    const xx = x(row.scenario) ?? margin.left;
                    const barHeight = Math.max(2, height - margin.bottom - y(row.incrementalRevenue));
                    const yy = y(row.incrementalRevenue);

                    return (
                        <g key={row.scenario}>
                            {/* Bar */}
                            <rect
                                x={xx}
                                y={yy}
                                width={x.bandwidth()}
                                height={barHeight}
                                rx={4}
                                fill={barColor(row)}
                                opacity={0.85}
                            />

                            {/* Value on top */}
                            <text
                                x={xx + x.bandwidth() / 2}
                                y={yy - 8}
                                textAnchor="middle"
                                fontSize={11}
                                fill="rgba(226,232,240,0.85)"
                                fontFamily="JetBrains Mono, monospace"
                            >
                                {formatUSD(row.incrementalRevenue)}
                            </text>

                            {/* Lift % below value */}
                            <text
                                x={xx + x.bandwidth() / 2}
                                y={yy - 22}
                                textAnchor="middle"
                                fontSize={9}
                                fill="rgba(148,163,184,0.6)"
                                fontFamily="JetBrains Mono, monospace"
                            >
                                +{formatPct(row.liftPct, { digits: 1 })}
                            </text>

                            {/* Scenario label */}
                            <text
                                x={xx + x.bandwidth() / 2}
                                y={height - margin.bottom + 16}
                                textAnchor="middle"
                                fontSize={9}
                                fill="rgba(148,163,184,0.75)"
                                fontFamily="JetBrains Mono, monospace"
                                style={{ letterSpacing: "0.04em" }}
                            >
                                {(SCENARIO_LABELS[row.scenario] ?? row.scenario).split(" ").map((word, i) => (
                                    <tspan key={i} x={xx + x.bandwidth() / 2} dy={i === 0 ? 0 : 12}>
                                        {word}
                                    </tspan>
                                ))}
                            </text>
                        </g>
                    );
                })}

                {/* Full-policy reference line */}
                {sorted[0] && (
                    <line
                        x1={margin.left}
                        x2={width - margin.right}
                        y1={y(sorted[0].incrementalRevenue)}
                        y2={y(sorted[0].incrementalRevenue)}
                        stroke="var(--radar-green)"
                        strokeWidth={1}
                        strokeDasharray="6 4"
                        opacity={0.4}
                    />
                )}
            </svg>
        </div>
    );
}
