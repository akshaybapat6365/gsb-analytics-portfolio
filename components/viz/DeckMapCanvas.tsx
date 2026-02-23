"use client";

import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { cn } from "@/lib/cn";
import { VizErrorBoundary } from "@/components/viz/VizErrorBoundary";
import type { DeckMapProps } from "@/components/viz/DeckMap";

const defaultStyle = "https://demotiles.maplibre.org/style.json";

function detectWebglSupport() {
  if (typeof window === "undefined") return true;

  try {
    const userAgent = window.navigator.userAgent ?? "";
    if (window.navigator.webdriver || userAgent.includes("HeadlessChrome")) {
      return false;
    }

    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return false;

    const maxTextureSize = gl.getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE);
    return Number.isFinite(maxTextureSize) && Number(maxTextureSize) > 0;
  } catch {
    return false;
  }
}

export function DeckMapCanvas({
  initialViewState,
  layers,
  className,
  height = 420,
  mapStyle = defaultStyle,
  getTooltip,
  dataTestId = "primary-chart",
}: DeckMapProps) {
  const resolvedHeight = Math.max(height, 560);
  const webglReady = detectWebglSupport();

  if (!webglReady) {
    return (
      <section
        className={cn("glass overflow-hidden rounded-2xl", className)}
        style={{ height: resolvedHeight }}
        data-testid={dataTestId}
      >
        <div className="flex h-full items-center justify-center px-6 text-center">
          <div className="max-w-lg space-y-2 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Map unavailable
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              WebGL is not available in this browser. Decision metrics and scenario outputs are still active.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("glass overflow-hidden rounded-2xl", className)}
      style={{ height: resolvedHeight }}
      data-testid={dataTestId}
    >
      <VizErrorBoundary
        fallbackTitle="Map rendering error"
        fallbackMessage="The interactive map could not mount. Use the surrounding KPIs/charts to continue the scenario analysis."
        height={resolvedHeight}
      >
        <DeckGL
          initialViewState={initialViewState}
          controller
          deviceProps={{ type: "webgl" }}
          layers={layers}
          getTooltip={
            getTooltip ??
            ((info) => {
              const obj = info.object as { tooltip?: string } | null;
              return obj?.tooltip ?? null;
            })
          }
        >
          <Map
            reuseMaps
            mapLib={maplibregl}
            mapStyle={mapStyle}
            attributionControl={false}
          />
        </DeckGL>
      </VizErrorBoundary>
    </section>
  );
}
