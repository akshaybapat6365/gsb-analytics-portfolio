import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./neural-theme.css";
import { WebGLBackground } from "@/components/viz/ord-lga/WebGLBackground";
import { TelemetryBar } from "@/components/viz/ord-lga/TelemetryBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider slug="ord-lga-price-war">
      <div className="neural-page mix-blend-add">
        {/* Render WebGL background particle system across the entire route */}
        <WebGLBackground />

        {/* Render React DOM strictly layered above WebGL canvas */}
        <div className="neural-html-layer min-h-screen relative z-10 antialiased selection:bg-plasma-cyan selection:text-neural-bg mb-10">
          {children}
        </div>

        {/* Global HUD fixed to window bottom */}
        <TelemetryBar />
      </div>
    </ThemeProvider>
  );
}
