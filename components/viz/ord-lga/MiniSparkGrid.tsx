"use client";

import { useMemo } from "react";
import type { OrdDerivedDay } from "./transforms";
import { buildPriceSpreadSeries, buildShareOscillation, buildCumulativeRegret } from "./transforms";
import type { AirlinePayload } from "@/lib/schemas/airline";

// Steps 23–27: 4×2 sparkline mini-grid for hero section

interface SparklineData {
    label: string;
    values: number[];
    endValue: string;
    color: string;
}

function downsampleLTTB(values: number[], targetCount: number): number[] {
    if (values.length <= targetCount) return values;
    const bucket = values.length / targetCount;
    const sampled: number[] = [values[0]!];
    for (let i = 1; i < targetCount - 1; i++) {
        const start = Math.floor(i * bucket);
        const end = Math.floor((i + 1) * bucket);
        let maxArea = -1;
        let maxIdx = start;
        const prev = sampled[sampled.length - 1]!;
        const nextAvg = values.slice(end, Math.floor((i + 2) * bucket)).reduce((a, b) => a + b, 0) /
            Math.max(1, Math.floor((i + 2) * bucket) - end);
        for (let j = start; j < end && j < values.length; j++) {
            const area = Math.abs((j - (i - 1)) * (nextAvg - prev) - (values[j]! - prev) * (end - (i - 1)));
            if (area > maxArea) { maxArea = area; maxIdx = j; }
        }
        sampled.push(values[maxIdx]!);
    }
    sampled.push(values[values.length - 1]!);
    return sampled;
}

function Sparkline({ values, color, width = 120, height = 34 }: {
    values: number[];
    color: string;
    width?: number;
    height?: number;
}) {
    const points = useMemo(() => {
        const ds = downsampleLTTB(values, 30);
        const min = Math.min(...ds);
        const max = Math.max(...ds);
        const range = max - min || 1;
        return ds.map((v, i) => {
            const x = (i / (ds.length - 1)) * width;
            const y = height - 4 - ((v - min) / range) * (height - 8);
            return `${x},${y}`;
        }).join(" ");
    }, [values, width, height]);

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function MiniSparkGrid({
    rows,
    payload,
}: {
    rows: OrdDerivedDay[];
    payload: AirlinePayload;
}) {
    const sparks: SparklineData[] = useMemo(() => {
        if (!rows.length) return [];

        const totalRevenue = rows.reduce((a, r) => a + r.actualRevenue, 0);
        const cumRegret = buildCumulativeRegret(rows, payload.uncertainty);
        const spreads = buildPriceSpreadSeries(rows);
        const shares = buildShareOscillation(rows);
        const nashStates = payload.nashSim?.states ?? [];

        // Sensitivity range from grid
        const sensGrid = payload.sensitivitySummary?.grid ?? [];
        const sensValues = sensGrid.map(g => g.incrementalRevenue);

        return [
            // Sparkline 1: Revenue trajectory
            {
                label: "REVENUE",
                values: rows.map(r => r.actualRevenue),
                endValue: `$${(totalRevenue / 1e6).toFixed(1)}M`,
                color: "var(--radar-green, #3edd8f)",
            },
            // Sparkline 2: Price spread
            {
                label: "SPREAD",
                values: spreads.map(s => s.spread),
                endValue: `+$${Math.round(spreads.reduce((a, s) => a + s.spread, 0) / spreads.length)}`,
                color: "var(--radar-amber, #c9962b)",
            },
            // Sparkline 3: Market share
            {
                label: "UA SHARE",
                values: shares.map(s => s.uaShare),
                endValue: `${(shares[shares.length - 1]?.uaShare ?? 0.5 * 100).toFixed(1)}%`,
                color: "var(--radar-cyan, #22d3ee)",
            },
            // Sparkline 4: Cumulative regret
            {
                label: "CUM. LIFT",
                values: cumRegret.map(c => c.cumRegret),
                endValue: `$${Math.round((cumRegret[cumRegret.length - 1]?.cumRegret ?? 0) / 1000)}K`,
                color: "var(--radar-green, #3edd8f)",
            },
            // Sparkline 5: Shock intensity
            {
                label: "SHOCKS",
                values: rows.map(r => r.shock),
                endValue: `${rows.filter(r => r.shock > 0).length} events`,
                color: "var(--radar-crimson, #e0453a)",
            },
            // Sparkline 6: Pax (booking fill)
            {
                label: "PAX FILL",
                values: rows.map(r => r.actualPax / Math.max(1, r.algoPax)),
                endValue: `${Math.round(rows.reduce((a, r) => a + r.actualPax, 0) / rows.reduce((a, r) => a + r.algoPax, 0) * 100)}%`,
                color: "var(--radar-green, #3edd8f)",
            },
            // Sparkline 7: Nash convergence (price spread)
            {
                label: "NASH Δ",
                values: nashStates.length > 0
                    ? nashStates.map(s => Math.abs(s.uaPrice - s.dlPrice))
                    : [20, 15, 10, 7, 5, 3, 2],
                endValue: `Day ${payload.nashSim?.convergenceDay ?? "—"}`,
                color: "var(--radar-amber, #c9962b)",
            },
            // Sparkline 8: Sensitivity range
            {
                label: "SENS. RANGE",
                values: sensValues.length > 0 ? sensValues : [0],
                endValue: sensValues.length > 0
                    ? `$${Math.round(Math.min(...sensValues) / 1000)}K→$${Math.round(Math.max(...sensValues) / 1000)}K`
                    : "—",
                color: "#8b7cf7", // radar-violet
            },
        ];
    }, [rows, payload]);

    return (
        <div className="mini-spark-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
        }}>
            {sparks.map((spark, i) => (
                <div
                    key={spark.label}
                    className="mini-spark-cell"
                    style={{
                        background: "rgba(10,14,26,0.5)",
                        border: "1px solid var(--radar-border, rgba(201,150,43,0.08))",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        animation: `fadeSlideUp 0.4s ease-out ${i * 80}ms both`,
                    }}
                >
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                    }}>
                        <span style={{
                            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                            fontSize: "8px",
                            letterSpacing: "0.18em",
                            color: "var(--radar-text-2, #94a3b8)",
                            textTransform: "uppercase",
                        }}>
                            {spark.label}
                        </span>
                        <span style={{
                            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: spark.color,
                            fontVariantNumeric: "tabular-nums",
                        }}>
                            {spark.endValue}
                        </span>
                    </div>
                    <Sparkline values={spark.values} color={spark.color} />
                </div>
            ))}
        </div>
    );
}
