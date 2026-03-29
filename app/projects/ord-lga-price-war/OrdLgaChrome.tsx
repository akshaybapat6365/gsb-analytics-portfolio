"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { WebGLBackground } from "@/components/viz/ord-lga/WebGLBackground";
import { TelemetryBar } from "@/components/viz/ord-lga/TelemetryBar";

type OrdLgaChromeProps = {
  children: ReactNode;
  suppressAmbientDecor?: boolean;
};

export function OrdLgaChrome({ children, suppressAmbientDecor = false }: OrdLgaChromeProps) {
  return (
    <ThemeProvider slug="ord-lga-price-war">
      <div className="neural-page">
        {!suppressAmbientDecor ? <WebGLBackground /> : null}
        <div className="neural-html-layer relative z-10 mb-10 min-h-screen antialiased">{children}</div>
        {!suppressAmbientDecor ? <TelemetryBar /> : null}
      </div>
    </ThemeProvider>
  );
}
