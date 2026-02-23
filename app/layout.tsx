import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Instrument_Sans,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { TopNav } from "@/components/ui/TopNav";
import { DevEnvBanner } from "@/components/ui/DevEnvBanner";
import { PerfDiagnosticsBoundary } from "@/components/perf/PerfDiagnosticsBoundary";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vaibhav Bapat | Decision Intelligence Portfolio",
    template: "%s | Vaibhav Bapat",
  },
  description:
    "Visual-first business analytics portfolio with interactive decision simulators across pricing, fraud, geospatial strategy, and portfolio optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${instrumentSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <div className="site-shell min-h-screen">
          <TopNav />
          <DevEnvBanner />
          <PerfDiagnosticsBoundary />
          <main className="mx-auto w-full max-w-[1420px] px-5 pb-16 pt-6 sm:px-7 sm:pt-8 lg:px-10">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
