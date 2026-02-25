"use client";

import { useEffect, useRef } from "react";

/**
 * CSS + Canvas2D animated particle background.
 * Replaces the Three.js particle system with a lightweight 2D alternative.
 */
export function WebGLBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf: number;
        const particles: Array<{
            x: number; y: number; vx: number; vy: number;
            size: number; alpha: number; color: string;
        }> = [];

        // Initialize particles
        const PARTICLE_COUNT = 120;
        const colors = [
            "107, 159, 212",  // steel blue
            "139, 143, 174",  // pewter
            "76, 175, 125",   // sage
        ];

        function resize() {
            canvas!.width = window.innerWidth;
            canvas!.height = window.innerHeight;
        }

        resize();
        window.addEventListener("resize", resize);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.15 - 0.1,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.15 + 0.03,
                color: colors[Math.floor(Math.random() * colors.length)]!,
            });
        }

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw ambient gradient base
            const grad = ctx.createRadialGradient(
                canvas.width * 0.5, 0, 0,
                canvas.width * 0.5, 0, canvas.height * 0.7,
            );
            grad.addColorStop(0, "rgba(12, 29, 53, 0.4)");
            grad.addColorStop(1, "rgba(5, 10, 18, 0)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw and update particles
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
                ctx.fill();

                // Subtle glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${p.alpha * 0.15})`;
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;
            }

            // Draw connection lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i]!.x - particles[j]!.x;
                    const dy = particles[i]!.y - particles[j]!.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i]!.x, particles[i]!.y);
                        ctx.lineTo(particles[j]!.x, particles[j]!.y);
                        ctx.strokeStyle = `rgba(107, 159, 212, ${0.03 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            raf = requestAnimationFrame(animate);
        }

        raf = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity: 0.7 }}
        />
    );
}
