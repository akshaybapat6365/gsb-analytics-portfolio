"use client";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./neural-theme.css";
import { WebGLBackground } from "@/components/viz/ord-lga/WebGLBackground";
import { TelemetryBar } from "@/components/viz/ord-lga/TelemetryBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider slug="ord-lga-price-war">
      <div className="neural-page">
        <WebGLBackground />
        <div className="neural-html-layer min-h-screen relative z-10 antialiased mb-10">
          {children}
        </div>
        <TelemetryBar />
      </div>
    </ThemeProvider>
  );
}
