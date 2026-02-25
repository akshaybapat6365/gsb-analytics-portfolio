import React from "react";

/**
 * Typography System — Outfit (Display), Inter (Body), JetBrains Mono (Data)
 * No card nesting. Pure type hierarchy.
 */

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    as?: React.ElementType;
}

export function NeuralTitle({ children, className = "", as: Component = "h2", ...props }: TypographyProps) {
    return (
        <Component
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-white ${className}`}
            style={{ fontFamily: "var(--font-display)" }}
            {...props}
        >
            {children}
        </Component>
    );
}

export function NeuralSubtitle({ children, className = "", as: Component = "h3", ...props }: TypographyProps) {
    return (
        <Component
            className={`text-base sm:text-lg font-normal leading-relaxed text-white/50 ${className}`}
            style={{ fontFamily: "var(--font-body)", letterSpacing: "0.01em" }}
            {...props}
        >
            {children}
        </Component>
    );
}

export function NeuralDataLabel({ children, className = "", as: Component = "span", ...props }: TypographyProps) {
    return (
        <Component
            className={`text-plasma-cyan font-semibold ${className}`}
            style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}
            {...props}
        >
            {children}
        </Component>
    );
}

export function NeuralEyebrow({ children, className = "", as: Component = "span", ...props }: TypographyProps) {
    return (
        <Component
            className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${className}`}
            style={{ fontFamily: "var(--font-mono)", color: "rgba(0, 240, 255, 0.5)" }}
            {...props}
        >
            {children}
        </Component>
    );
}

export function NeuralBody({ children, className = "", as: Component = "p", ...props }: TypographyProps) {
    return (
        <Component
            className={`text-[15px] font-normal leading-[1.7] text-white/60 ${className}`}
            style={{ fontFamily: "var(--font-body)", letterSpacing: "0.01em" }}
            {...props}
        >
            {children}
        </Component>
    );
}
