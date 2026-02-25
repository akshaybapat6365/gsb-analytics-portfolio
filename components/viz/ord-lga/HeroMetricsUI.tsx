"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Glassmorphic hero metrics overlay.
 * Animated KPI cards with the new subtle palette.
 */
export function HeroMetricsUI() {
    const kpis = useMemo(() => [
        { label: "Revenue at Risk", value: "$567K", sublabel: "Q2 2023 counterfactual", color: "#C75B5B" },
        { label: "Algo Lift", value: "+$1.03M", sublabel: "Policy vs observed", color: "#4CAF7D" },
        { label: "Model Confidence", value: "94.2%", sublabel: "Out-of-sample R²", color: "#6B9FD4" },
        { label: "Nash Convergence", value: "Day 47", sublabel: "Equilibrium found", color: "#D4A76B" },
    ], []);

    return (
        <div className="relative z-10 px-4 sm:px-6 py-8 space-y-6">
            {/* Main Hero Title */}
            <div className="space-y-3">
                <p
                    className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-mono)", color: "rgba(107, 159, 212, 0.5)" }}
                >
                    Route War Room
                </p>
                <h1
                    className="text-[32px] sm:text-[48px] lg:text-[56px] font-bold text-white leading-[1.05]"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}
                >
                    United vs. Delta:<br />
                    ORD–LGA price war simulator
                </h1>
                <p
                    className="max-w-xl text-[15px] leading-[1.7]"
                    style={{ fontFamily: "var(--font-body)", color: "rgba(226, 232, 240, 0.55)" }}
                >
                    Multi-agent pricing simulation with a DQN-style policy lens and inferred competitor
                    response. Explore day-by-day counterfactual pricing, booking-window leakage, and
                    equilibrium dynamics.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="space-y-3">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        className="rounded-xl border px-4 py-3"
                        style={{
                            borderColor: "rgba(255,255,255,0.06)",
                            background: "rgba(7, 21, 42, 0.4)",
                            backdropFilter: "blur(16px)",
                        }}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                    >
                        <p className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: kpi.color }}>
                            {kpi.label}
                        </p>
                        <p className="mt-1 text-[20px] font-mono font-semibold text-white">
                            {kpi.value}
                        </p>
                        <p className="text-[9px] font-mono text-slate-500">{kpi.sublabel}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
