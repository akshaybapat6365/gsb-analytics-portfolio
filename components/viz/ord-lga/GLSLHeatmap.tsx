"use client";

import { useEffect, useRef } from "react";
import { NeuralEyebrow } from "./Typography";

/**
 * Canvas2D heatmap with bilinear interpolation.
 * Replaces GLSL shader heatmap with equivalent pixel-level rendering.
 */
export function GLSLHeatmap() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = 400;
        const H = 280;
        canvas.width = W;
        canvas.height = H;

        // Generate synthetic heatmap data (booking window × day-of-week)
        const ROWS = 7;  // days of week
        const COLS = 12;  // booking windows
        const data: number[][] = [];
        for (let r = 0; r < ROWS; r++) {
            const row: number[] = [];
            for (let c = 0; c < COLS; c++) {
                // Higher values for mid-week, near-departure bookings
                const dowFactor = 1 - Math.abs(r - 3) / 4;
                const windowFactor = Math.exp(-c / 4);
                row.push(dowFactor * windowFactor + Math.random() * 0.15);
            }
            data.push(row);
        }

        // Find range
        let min = Infinity, max = -Infinity;
        for (const row of data) {
            for (const v of row) {
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }
        const range = max - min || 1;

        // Color palette (cold → warm)
        const colors: [number, number, number][] = [
            [10, 22, 40],       // deep space
            [107, 159, 212],    // steel blue
            [76, 175, 125],     // sage
            [212, 167, 107],    // sand
            [199, 91, 91],      // rose
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

        // Render with bilinear interpolation
        const imageData = ctx.createImageData(W, H);
        const pixels = imageData.data;

        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                const gx = (px / W) * (COLS - 1);
                const gy = (py / H) * (ROWS - 1);
                const x0 = Math.floor(gx);
                const y0 = Math.floor(gy);
                const x1 = Math.min(x0 + 1, COLS - 1);
                const y1 = Math.min(y0 + 1, ROWS - 1);
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
                pixels[idx + 3] = 200;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Apply blur for smoothness
        ctx.filter = "blur(2px)";
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";
    }, []);

    return (
        <div className="w-full neural-glass-panel p-4 border-plasma-cyan/20">
            <NeuralEyebrow className="text-plasma-steel mb-4">BOOKING_WINDOW_HEATMAP</NeuralEyebrow>
            <div className="flex gap-2 text-[9px] font-mono text-slate-500 mb-2">
                <span>← Near departure</span>
                <span className="ml-auto">Far out →</span>
            </div>
            <canvas
                ref={canvasRef}
                className="w-full rounded-lg"
                style={{ aspectRatio: "400/280", imageRendering: "auto" }}
            />
            <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
                <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
            </div>
        </div>
    );
}
