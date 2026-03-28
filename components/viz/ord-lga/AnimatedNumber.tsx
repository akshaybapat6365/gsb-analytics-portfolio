"use client";

import { useEffect, useRef, useState } from "react";

// Steps 28–29: Spring-physics animated number counter
export type AnimatedNumberFormat = "usd" | "usdK" | "pct" | "number" | "bps";

function formatValue(v: number, fmt: AnimatedNumberFormat): string {
    switch (fmt) {
        case "usd":
            return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
        case "usdK":
            return `$${Math.round(v / 1000).toLocaleString("en-US")}K`;
        case "pct":
            return `${(v * 100).toFixed(1)}%`;
        case "bps":
            return `${Math.round(v * 10000)} bps`;
        case "number":
        default:
            return v.toLocaleString("en-US", { maximumFractionDigits: 1 });
    }
}

interface AnimatedNumberProps {
    value: number;
    format?: AnimatedNumberFormat;
    duration?: number;
    className?: string;
    showDelta?: boolean;
    prefix?: string;
    suffix?: string;
}

export default function AnimatedNumber({
    value,
    format = "number",
    duration = 600,
    className = "",
    showDelta = false,
    prefix = "",
    suffix = "",
}: AnimatedNumberProps) {
    const [display, setDisplay] = useState(value);
    const prevRef = useRef(value);
    const deltaTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [deltaDirection, setDeltaDirection] = useState<"up" | "down" | null>(null);
    const [showDeltaArrow, setShowDeltaArrow] = useState(false);

    useEffect(() => {
        const from = prevRef.current;
        const to = value;
        if (showDelta && from !== to) {
            const nextDirection = to > from ? "up" : "down";
            requestAnimationFrame(() => {
                setDeltaDirection(nextDirection);
                setShowDeltaArrow(true);
                if (deltaTimer.current) clearTimeout(deltaTimer.current);
                deltaTimer.current = setTimeout(() => setShowDeltaArrow(false), 1200);
            });
        }
        if (from === to) return;

        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            // Cubic ease-out
            const ease = 1 - Math.pow(1 - t, 3);
            setDisplay(from + (to - from) * ease);
            if (t < 1) requestAnimationFrame(tick);
            else prevRef.current = to;
        };
        requestAnimationFrame(tick);

        return () => {
            if (deltaTimer.current) clearTimeout(deltaTimer.current);
        };
    }, [value, duration, showDelta]);

    return (
        <span
            className={`animated-number ${className}`}
            style={{ fontVariantNumeric: "tabular-nums", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
            {prefix}{formatValue(display, format)}{suffix}
            {showDeltaArrow && deltaDirection && (
                <span
                    className={`animated-number-delta ${deltaDirection}`}
                    style={{
                        fontSize: "0.65em",
                        color: deltaDirection === "up" ? "var(--radar-green, #3edd8f)" : "var(--radar-crimson, #e0453a)",
                        animation: "deltaFade 1.2s ease-out forwards",
                    }}
                >
                    {deltaDirection === "up" ? "↑" : "↓"}
                </span>
            )}
        </span>
    );
}
