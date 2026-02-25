"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useIsomorphicLayoutEffect } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Phase 2: Animated Neon Counter
 * High-performance Framer Motion physics counter with glowing Magenta/Cyan states.
 */

interface AnimatedNeonCounterProps {
    value: number;
    format?: "usd" | "pct" | "number" | "compact";
    className?: string;
    glow?: "cyan" | "magenta" | "purple" | "none";
    showDelta?: boolean;
    suffix?: string;
    duration?: number; // legacy prop ignored
}

export function AnimatedNeonCounter({
    value,
    format = "usd",
    className,
    glow = "none",
    showDelta = false,
    suffix = "",
}: AnimatedNeonCounterProps) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const [prev, setPrev] = useState(value);

    useIsomorphicLayoutEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(prev, value, {
            type: "spring",
            stiffness: 70,
            damping: 15,
            mass: 1,
            onUpdate: (latest) => {
                let formatted = "";

                switch (format) {
                    case "usd":
                        formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.abs(latest));
                        break;
                    case "pct":
                        formatted = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(Math.abs(latest) / 100);
                        break;
                    case "compact":
                        formatted = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Math.abs(latest));
                        break;
                    case "number":
                        formatted = Math.round(Math.abs(latest)).toLocaleString();
                        break;
                }

                if (showDelta && latest !== 0) {
                    formatted = (latest >= 0 ? "+" : "-") + formatted;
                } else if (latest < 0) {
                    formatted = "-" + formatted;
                }

                node.textContent = formatted + suffix;
            },
        });

        return () => controls.stop();
    }, [value, format, prev, showDelta, suffix]);

    useEffect(() => {
        setPrev(value);
    }, [value]);

    const glowClass = {
        cyan: "text-plasma-cyan text-glow-cyan",
        magenta: "text-plasma-magenta text-glow-magenta",
        purple: "text-plasma-purple text-glow-purple",
        none: "text-frost-white",
    }[glow];

    return (
        <span
            ref={nodeRef}
            className={cn("neural-mono-data tabular-nums", glowClass, className)}
        />
    );
}
