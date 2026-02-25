"use client";

import { useRef, useCallback } from "react";

/**
 * Hook for loading and compiling GLSL-like fragments for heatmaps.
 *
 * When WebGL is available (i.e., `three` is installed), this would compile
 * actual GLSL shader programs. As a Canvas2D fallback, it provides equivalent
 * color mapping functions that can be applied to pixel data.
 *
 * Usage:
 *   const { colorize, renderToCanvas } = useGLSLFragments();
 *   renderToCanvas(canvasRef, data, width, height);
 */

type ColorRGBA = [number, number, number, number];

// ── Color palette (matching the new subtle aerospace theme) ──
const PALETTE: ColorRGBA[] = [
    [10, 22, 40, 255],      // deep space (cold)
    [107, 159, 212, 255],    // steel blue
    [76, 175, 125, 255],     // sage green
    [212, 167, 107, 255],    // warm sand
    [199, 91, 91, 255],      // dusty rose (hot)
];

function lerpColor(a: ColorRGBA, b: ColorRGBA, t: number): ColorRGBA {
    return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t),
        Math.round(a[3] + (b[3] - a[3]) * t),
    ];
}

/**
 * Map a normalized value (0-1) to a color via multi-stop gradient.
 */
function valueToColor(value: number): ColorRGBA {
    const clamped = Math.max(0, Math.min(1, value));
    const segment = clamped * (PALETTE.length - 1);
    const idx = Math.floor(segment);
    const frac = segment - idx;

    if (idx >= PALETTE.length - 1) return PALETTE[PALETTE.length - 1]!;
    return lerpColor(PALETTE[idx]!, PALETTE[idx + 1]!, frac);
}

/**
 * Bilinear interpolation for smooth heatmap rendering.
 */
function bilinearSample(
    data: number[][],
    x: number,
    y: number,
    width: number,
    height: number,
): number {
    const gx = (x / width) * (data[0]?.length ?? 1 - 1);
    const gy = (y / height) * (data.length - 1);

    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const x1 = Math.min(x0 + 1, (data[0]?.length ?? 1) - 1);
    const y1 = Math.min(y0 + 1, data.length - 1);

    const fx = gx - x0;
    const fy = gy - y0;

    const v00 = data[y0]?.[x0] ?? 0;
    const v10 = data[y0]?.[x1] ?? 0;
    const v01 = data[y1]?.[x0] ?? 0;
    const v11 = data[y1]?.[x1] ?? 0;

    return (
        v00 * (1 - fx) * (1 - fy) +
        v10 * fx * (1 - fy) +
        v01 * (1 - fx) * fy +
        v11 * fx * fy
    );
}

export function useGLSLFragments() {
    const frameRef = useRef<number>(0);

    /**
     * Convert a single normalized value to an RGBA color.
     */
    const colorize = useCallback((value: number): ColorRGBA => {
        return valueToColor(value);
    }, []);

    /**
     * Render a 2D data grid onto an HTML canvas element using bilinear interpolation.
     * This is the Canvas2D fallback for what would be a GLSL shader in the WebGL path.
     *
     * @param canvas - Ref to the canvas element
     * @param data - 2D array of values (will be normalized to 0-1 range)
     * @param options - Rendering options
     */
    const renderToCanvas = useCallback(
        (
            canvas: HTMLCanvasElement | null,
            data: number[][],
            options?: {
                minValue?: number;
                maxValue?: number;
                opacity?: number;
                blur?: number;
            },
        ) => {
            if (!canvas || !data.length) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const w = canvas.width;
            const h = canvas.height;

            // Find data range for normalization
            let min = options?.minValue ?? Infinity;
            let max = options?.maxValue ?? -Infinity;
            if (min === Infinity || max === -Infinity) {
                for (const row of data) {
                    for (const v of row) {
                        if (v < min) min = v;
                        if (v > max) max = v;
                    }
                }
            }
            const range = max - min || 1;

            // Create ImageData for direct pixel manipulation
            const imageData = ctx.createImageData(w, h);
            const pixels = imageData.data;

            for (let py = 0; py < h; py++) {
                for (let px = 0; px < w; px++) {
                    const sample = bilinearSample(data, px, py, w, h);
                    const normalized = (sample - min) / range;
                    const color = valueToColor(normalized);
                    const idx = (py * w + px) * 4;
                    pixels[idx] = color[0];
                    pixels[idx + 1] = color[1];
                    pixels[idx + 2] = color[2];
                    pixels[idx + 3] = Math.round(color[3] * (options?.opacity ?? 1));
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Optional blur pass for smooth contours
            if (options?.blur && options.blur > 0) {
                ctx.filter = `blur(${options.blur}px)`;
                ctx.drawImage(canvas, 0, 0);
                ctx.filter = "none";
            }
        },
        [],
    );

    /**
     * Render a scatter plot of points onto a canvas.
     * Optimized for 50K+ points using requestAnimationFrame batching.
     */
    const renderScatter = useCallback(
        (
            canvas: HTMLCanvasElement | null,
            points: Array<{ x: number; y: number; value: number }>,
            options?: {
                pointSize?: number;
                minValue?: number;
                maxValue?: number;
                bloom?: boolean;
            },
        ) => {
            if (!canvas || !points.length) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const w = canvas.width;
            const h = canvas.height;
            const size = options?.pointSize ?? 2;

            // Cancel previous animation frame
            if (frameRef.current) cancelAnimationFrame(frameRef.current);

            // Find range
            let min = options?.minValue ?? Infinity;
            let max = options?.maxValue ?? -Infinity;
            if (min === Infinity || max === -Infinity) {
                for (const p of points) {
                    if (p.value < min) min = p.value;
                    if (p.value > max) max = p.value;
                }
            }
            const range = max - min || 1;

            // Clear canvas
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = "screen";

            // Batch render for performance (10K points per frame)
            const BATCH = 10000;
            let offset = 0;

            function renderBatch() {
                const end = Math.min(offset + BATCH, points.length);
                for (let i = offset; i < end; i++) {
                    const p = points[i]!;
                    const normalized = (p.value - min) / range;
                    const [r, g, b] = valueToColor(normalized);
                    ctx!.fillStyle = `rgba(${r},${g},${b},0.6)`;
                    ctx!.fillRect(p.x * w, p.y * h, size, size);
                }
                offset = end;
                if (offset < points.length) {
                    frameRef.current = requestAnimationFrame(renderBatch);
                } else if (options?.bloom) {
                    // Simulated bloom: draw blurred copy on top
                    ctx!.globalCompositeOperation = "lighter";
                    ctx!.filter = "blur(3px)";
                    ctx!.globalAlpha = 0.3;
                    ctx!.drawImage(canvas!, 0, 0);
                    ctx!.globalAlpha = 1;
                    ctx!.filter = "none";
                    ctx!.globalCompositeOperation = "source-over";
                }
            }

            frameRef.current = requestAnimationFrame(renderBatch);
        },
        [],
    );

    return { colorize, renderToCanvas, renderScatter };
}
