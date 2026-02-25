"use client";

import { useEffect, useRef } from "react";

/**
 * 3D-like isometric fare scatter visualization using Canvas2D.
 * Replaces @react-three/fiber Canvas with a perspective-projected scatter.
 */
export function PrologueCanvas3D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf: number;
        let time = 0;

        function resize() {
            canvas!.width = canvas!.clientWidth * window.devicePixelRatio;
            canvas!.height = canvas!.clientHeight * window.devicePixelRatio;
        }

        resize();
        window.addEventListener("resize", resize);

        // Generate flight path points (Great circle approximation ORD→LGA)
        const N_POINTS = 200;
        const flightPath: Array<{ x: number; y: number; z: number }> = [];
        for (let i = 0; i < N_POINTS; i++) {
            const t = i / (N_POINTS - 1);
            // Parabolic arc
            const x = t;
            const y = -4 * t * (t - 1) * 0.3; // arc height
            const z = Math.sin(t * Math.PI) * 0.1; // slight wobble
            flightPath.push({ x, y, z });
        }

        // Fare scatter data
        const farePoints: Array<{ x: number; y: number; z: number; value: number }> = [];
        for (let i = 0; i < 300; i++) {
            farePoints.push({
                x: Math.random(),
                y: Math.random() * 0.6 - 0.1,
                z: Math.random() * 0.4 - 0.2,
                value: Math.random(),
            });
        }

        function project(x: number, y: number, z: number, w: number, h: number, t: number) {
            // Isometric-like projection with slow rotation
            const angle = t * 0.0003;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const rx = x * cos - z * sin;
            const rz = x * sin + z * cos;

            const scale = 1 / (1 + rz * 0.3);
            const px = w * 0.5 + (rx - 0.5) * w * 0.6 * scale;
            const py = h * 0.6 - y * h * 0.5 * scale;

            return { px, py, scale };
        }

        function animate() {
            if (!ctx || !canvas) return;
            const w = canvas.width;
            const h = canvas.height;
            time++;

            ctx.clearRect(0, 0, w, h);

            // Background gradient
            const bg = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, h * 0.8);
            bg.addColorStop(0, "rgba(12, 29, 53, 0.6)");
            bg.addColorStop(1, "rgba(5, 10, 18, 0)");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            // Draw grid floor
            ctx.strokeStyle = "rgba(107, 159, 212, 0.04)";
            ctx.lineWidth = 1;
            for (let i = 0; i <= 10; i++) {
                const t1 = i / 10;
                const a = project(t1, 0, -0.2, w, h, time);
                const b = project(t1, 0, 0.2, w, h, time);
                ctx.beginPath();
                ctx.moveTo(a.px, a.py);
                ctx.lineTo(b.px, b.py);
                ctx.stroke();

                const c = project(0, 0, -0.2 + t1 * 0.4, w, h, time);
                const d = project(1, 0, -0.2 + t1 * 0.4, w, h, time);
                ctx.beginPath();
                ctx.moveTo(c.px, c.py);
                ctx.lineTo(d.px, d.py);
                ctx.stroke();
            }

            // Draw fare scatter
            for (const fp of farePoints) {
                const { px, py, scale } = project(fp.x, fp.y, fp.z, w, h, time);
                const size = (1 + fp.value * 2) * scale;
                const alpha = (0.15 + fp.value * 0.25) * scale;

                // Color based on value
                const r = Math.round(107 + fp.value * 92);  // steel → rose
                const g = Math.round(159 - fp.value * 68);
                const b = Math.round(212 - fp.value * 121);

                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fill();
            }

            // Draw flight path
            ctx.beginPath();
            ctx.strokeStyle = "rgba(212, 167, 107, 0.5)";
            ctx.lineWidth = 2;
            for (let i = 0; i < flightPath.length; i++) {
                const p = flightPath[i]!;
                const { px, py } = project(p.x, p.y, p.z, w, h, time);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Draw endpoints
            const ordProj = project(0, 0, 0, w, h, time);
            const lgaProj = project(1, 0, 0, w, h, time);

            ctx.fillStyle = "#D4A76B";
            ctx.beginPath(); ctx.arc(ordProj.px, ordProj.py, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(lgaProj.px, lgaProj.py, 4, 0, Math.PI * 2); ctx.fill();

            // Labels
            ctx.fillStyle = "rgba(212, 167, 107, 0.7)";
            ctx.font = `${12 * window.devicePixelRatio}px 'JetBrains Mono', monospace`;
            ctx.fillText("ORD", ordProj.px - 12, ordProj.py + 20);
            ctx.fillText("LGA", lgaProj.px - 12, lgaProj.py + 20);

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
            className="absolute inset-0 z-0 pointer-events-none w-full h-full"
            style={{ opacity: 0.8 }}
        />
    );
}
