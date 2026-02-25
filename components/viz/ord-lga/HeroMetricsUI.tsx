"use client";

import { AnimatedNeonCounter } from "./AnimatedNeonCounter";
import { NeuralTitle, NeuralSubtitle, NeuralDataLabel, NeuralEyebrow } from "./Typography";
import { usePriceWarStore } from "./global-state";

/**
 * Phase 2: Hero Metrics UI
 * A glassmorphic overlay panel sitting aggressively on top of the 3D canvas
 */
export function HeroMetricsUI() {
    const aggressiveness = usePriceWarStore((s) => s.aggressiveness);

    return (
        <div className="relative z-10 space-y-8 pt-32 pb-16 w-full max-w-7xl mx-auto px-6 lg:px-12 pointer-events-auto">

            {/* Title & Narrative Left Column */}
            <div className="flex flex-col space-y-8">
                <div className="space-y-4">
                    <NeuralEyebrow>Declassified: Project Alpha-Tango</NeuralEyebrow>
                    <NeuralTitle className="text-5xl lg:text-7xl glow-cyan tracking-tighter">
                        ORD–LGA <br />
                        <span className="text-plasma-magenta text-glow-magenta">PRICE WAR</span>
                    </NeuralTitle>
                    <NeuralSubtitle className="max-w-xl text-lg mt-4">
                        Interactive reconstruction of the Q2 2023 pricing conflict between United and Delta.
                        91 days of neural-net decisions exposed via simulation.
                    </NeuralSubtitle>
                </div>

                <div className="neural-glass-panel p-6 max-w-md space-y-4 hover:border-plasma-cyan transition-colors duration-500">
                    <NeuralEyebrow>Simulation Link Established</NeuralEyebrow>
                    <p className="text-sm text-frost-white/60">
                        A WebGL matrix handles 8,700 hourly interpolations derived from the original 91-day payload.
                        Use the scrubber below to alter operational aggressiveness in real-time.
                    </p>
                </div>
            </div>

            {/* KPI Right Column */}
            <div className="flex flex-col justify-center items-end space-y-6">
                <div className="neural-glass-panel p-6 w-full max-w-sm flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-plasma-magenta-20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="flex flex-col relative z-10">
                        <NeuralEyebrow>Value at Risk</NeuralEyebrow>
                        <AnimatedNeonCounter value={567400} format="usd" glow="magenta" className="text-4xl mt-1" />
                    </div>
                    <div className="h-12 w-1bg-plasma-magenta rounded-full glow-magenta" />
                </div>

                <div className="neural-glass-panel p-6 w-full max-w-sm flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-plasma-cyan-20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="flex flex-col relative z-10">
                        <NeuralEyebrow>Algo Output Density</NeuralEyebrow>
                        <AnimatedNeonCounter value={8700} format="number" glow="cyan" className="text-4xl mt-1" />
                    </div>
                    <div className="h-12 w-1bg-plasma-cyan rounded-full glow-cyan" />
                </div>

                <div className="neural-glass-panel p-6 w-full max-w-sm flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-plasma-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="flex flex-col w-full relative z-10">
                        <div className="flex justify-between w-full">
                            <NeuralEyebrow>Aggressiveness Tuning</NeuralEyebrow>
                            <NeuralDataLabel>{aggressiveness}%</NeuralDataLabel>
                        </div>
                        {/* Minimal aerospace styled range slider */}
                        <input
                            type="range"
                            className="mt-4 w-full h-1 bg-neural-bg rounded-lg appearance-none cursor-pointer outline-none slider-thumb-cyan"
                            min="0" max="100"
                            defaultValue={aggressiveness}
                            onChange={(e) => usePriceWarStore.getState().setAggressiveness(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
