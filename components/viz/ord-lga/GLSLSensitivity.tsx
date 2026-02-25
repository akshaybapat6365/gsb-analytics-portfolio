"use client";

import { useEffect, useRef } from "react";
import { NeuralEyebrow } from "./Typography";

/**
 * Canvas2D sensitivity contour surface.
 * Renders elasticity × competitor reactivity surface with contour lines.
 */
export function GLSLSensitivity() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = 400;
        const H = 300;
        canvas.width = W;
        canvas.height = H;

        // Generate sensitivity surface
        const GRID = 40;
        const data: number[][] = [];
        for (let y = 0; y < GRID; y++) {
            const row: number[] = [];
            for (let x = 0; x < GRID; x++) {
                const elasticity = (x / GRID) * 2;       // 0 to 2
                const reactivity = (y / GRID) * 1;       // 0 to 1
                // Revenue lift = f(elasticity, reactivity) — nonlinear surface
                const lift = Math.exp(-0.5 * (elasticity - 0.8) ** 2 / 0.3)
                    * (1 - reactivity * 0.7)
                    + 0.1 * Math.sin(elasticity * 3) * Math.cos(reactivity * 4);
                row.push(lift);
            }
            data.push(row);
        }

        // Normalize
        let min = Infinity, max = -Infinity;
        for (const row of data) for (const v of row) {
            if (v < min) min = v;
            if (v > max) max = v;
        }
        const range = max - min || 1;

        // Color ramp
        const colors: [number, number, number][] = [
            [199, 91, 91],      // rose (worst)
            [212, 167, 107],    // sand (neutral)
            [76, 175, 125],     // sage (best)
        ];

        function getColor(t: number): [number, number, number] {
            const seg = t * (colors.length - 1);
            const idx = Math.floor(seg);
            const frac = seg - idx;
            if (idx >= colors.length - 1) return colors[colors.length - 1]!;
            const a = colors[idx]!;
            const b = colors[idx + 1]!;
            return [
                Math.round(a[0] + (b[0] - a[0]) * frac),
                Math.round(a[1] + (b[1] - a[1]) * frac),
                Math.round(a[2] + (b[2] - a[2]) * frac),
            ];
        }

        // Render surface
        const imageData = ctx.createImageData(W, H);
        const pixels = imageData.data;

        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                const gx = (px / W) * (GRID - 1);
                const gy = (py / H) * (GRID - 1);
                const x0 = Math.floor(gx);
                const y0 = Math.floor(gy);
                const x1 = Math.min(x0 + 1, GRID - 1);
                const y1 = Math.min(y0 + 1, GRID - 1);
                const fx = gx - x0;
                const fy = gy - y0;

                const v = data[y0]![x0]! * (1 - fx) * (1 - fy)
                    + data[y0]![x1]! * fx * (1 - fy)
                    + data[y1]![x0]! * (1 - fx) * fy
                    + data[y1]![x1]! * fx * fy;

                const normalized = (v - min) / range;
                const [r, g, b] = getColor(normalized);
                const idx = (py * W + px) * 4;
                pixels[idx] = r;
                pixels[idx + 1] = g;
                pixels[idx + 2] = b;
                pixels[idx + 3] = 180;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Draw contour lines
        const CONTOUR_LEVELS = 8;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 0.5;
        for (let level = 0; level < CONTOUR_LEVELS; level++) {
            const threshold = min + (range * level) / CONTOUR_LEVELS;
            for (let py = 0; py < H - 1; py++) {
                for (let px = 0; px < W - 1; px++) {
                    const gx = (px / W) * (GRID - 1);
                    const gy = (py / H) * (GRID - 1);
                    const x0 = Math.min(Math.floor(gx), GRID - 1);
                    const y0 = Math.min(Math.floor(gy), GRID - 1);

                    const v = data[y0]?.[x0] ?? 0;
                    const vr = data[y0]?.[Math.min(x0 + 1, GRID - 1)] ?? 0;
                    const vb = data[Math.min(y0 + 1, GRID - 1)]?.[x0] ?? 0;

                    if ((v < threshold && vr >= threshold) || (v >= threshold && vr < threshold)) {
                        ctx.fillRect(px, py, 1, 1);
                    }
                    if ((v < threshold && vb >= threshold) || (v >= threshold && vb < threshold)) {
                        ctx.fillRect(px, py, 1, 1);
                    }
                }
            }
        }

        // Smooth
        ctx.filter = "blur(1px)";
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";
    }, []);

    return (
        <div className="w-full neural-glass-panel p-4 border-plasma-cyan/20">
            <NeuralEyebrow className="text-plasma-steel mb-4">SENSITIVITY_CONTOUR_SURFACE</NeuralEyebrow>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-2">
                <span>Elasticity →</span>
                <span>Revenue Lift</span>
            </div>
            <canvas
                ref={canvasRef}
                className="w-full rounded-lg"
                style={{ aspectRatio: "400/300", imageRendering: "auto" }}
            />
            <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
                <span>Low reactivity</span>
                <span>↓ Competitor reactivity</span>
                <span>High reactivity</span>
            </div>
        </div>
    );
}
