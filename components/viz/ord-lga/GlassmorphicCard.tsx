"use client";

import { cn } from "@/lib/utils";
import { NeuralEyebrow } from "./Typography";

/**
 * Phase 5/6: Aerospace Glassmorphic Card
 * The primary text/narrative container. It provides deep frosted glass,
 * a 1px inner glow border, and neon drop-shadows on hover.
 */

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    eyebrow?: string;
    glowColor?: "cyan" | "magenta" | "purple" | "none";
}

export function GlassmorphicCard({
    children,
    className,
    eyebrow,
    glowColor = "cyan",
    ...props
}: GlassmorphicCardProps) {

    const glowClass = {
        cyan: "hover:border-plasma-cyan hover:shadow-[0_0_30px_-5px_var(--plasma-cyan-intense)]",
        magenta: "hover:border-plasma-magenta hover:shadow-[0_0_30px_-5px_var(--plasma-magenta-intense)]",
        purple: "hover:border-plasma-purple hover:shadow-[0_0_30px_-5px_var(--plasma-purple-intense)]",
        none: "",
    }[glowColor];

    return (
        <div
            className={cn(
                "neural-glass-panel p-6 sm:p-8 rounded-xl relative overflow-hidden transition-all duration-700 ease-out group",
                glowClass,
                className
            )}
            {...props}
        >
            {/* Dynamic ambient background flare */}
            {glowColor !== "none" && (
                <div
                    className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none mix-blend-screen",
                        glowColor === "cyan" ? "bg-plasma-cyan" : glowColor === "magenta" ? "bg-plasma-magenta" : "bg-plasma-purple"
                    )}
                />
            )}

            <div className="relative z-10 flex flex-col space-y-4">
                {eyebrow && <NeuralEyebrow>{eyebrow}</NeuralEyebrow>}
                {children}
            </div>
        </div>
    );
}
