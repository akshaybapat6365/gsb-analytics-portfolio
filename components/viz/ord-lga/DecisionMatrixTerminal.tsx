"use client";

import { useMemo, useEffect, useState } from "react";
import { NeuralEyebrow } from "./Typography";
import { cn } from "@/lib/utils";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";

/**
 * Phase 5 (Step 67): DecisionMatrixTerminal
 * A cyberpunk terminal executing the final business decision in a typing effect format,
 * replacing the static DecisionMemoPanel.
 */

interface TerminalProps {
    decision: DecisionEngineResult;
}

export function DecisionMatrixTerminal({ decision }: TerminalProps) {
    const [typedChars, setTypedChars] = useState(0);

    const rawText = useMemo(() => {
        return [
            `> SYSTEM DIAGNOSTICS: ALGORITHMIC ADVANTAGE VALIDATED`,
            `> TIER: [${(decision.recommendationTier || "BALANCED").toUpperCase()}]`,
            `> ----------------------------------------------------`,
            `> NARRATIVE_ANALYSIS:`,
            ...(decision.drivers || ["Baseline trajectory acquired."]).map(d => `  * ${d}`),
            `> ----------------------------------------------------`,
            `> EXECUTING PROTOCOL COMMANDS:`,
            ...(decision.policyGuardrails || ["Engage default rate bounds."]).map((item, i) => `  [0${i + 1}] ${item}`),
            `>`,
            `> _AWAITING_FURTHER_INPUT_`
        ].join('\n');
    }, [decision]);

    useEffect(() => {
        // Typewriter effect
        const interval = setInterval(() => {
            setTypedChars(prev => {
                if (prev >= rawText.length) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1; // typed speed chunks
            });
        }, 15);
        return () => clearInterval(interval);
    }, [rawText]);

    const outputText = rawText.substring(0, typedChars);

    return (
        <div className="w-full relative neural-glass-panel border-plasma-cyan/40 p-6 sm:p-8 bg-black/50 overflow-hidden font-mono text-xs sm:text-sm shadow-[0_0_30px_-5px_var(--plasma-cyan)]">
            {/* Background Grid Scanline */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #6B9FD4 2px, #6B9FD4 4px)' }}>
            </div>

            <NeuralEyebrow className="text-plasma-cyan mb-6">EXECUTION_TERMINAL_V2.0</NeuralEyebrow>

            <pre className="whitespace-pre-wrap text-[#6B9FD4] leading-relaxed drop-shadow-[0_0_4px_#6B9FD4]">
                {outputText}
                <span className="animate-pulse">_</span>
            </pre>

            {/* Optical corner markers */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-plasma-cyan"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-plasma-cyan"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-plasma-cyan"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-plasma-cyan"></div>
        </div>
    );
}
