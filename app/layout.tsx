import type { Metadata } from "next";
import {
  Instrument_Sans,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { TopNav } from "@/components/ui/TopNav";
import { DevEnvBanner } from "@/components/ui/DevEnvBanner";

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

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${instrumentSerif.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} font-serif antialiased`}
      >
        <div className="site-shell min-h-screen">
          <TopNav />
          <DevEnvBanner />
          <main className="mx-auto w-full max-w-[1420px] px-5 pb-24 pt-8 sm:px-7 lg:px-10">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
