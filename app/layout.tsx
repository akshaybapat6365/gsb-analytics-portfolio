import type { Metadata } from "next";
import {
  Crimson_Pro,
  DM_Sans,
  IBM_Plex_Mono,
  Inter,
  Lora,
  Merriweather,
  Nunito_Sans,
  Oswald,
  Outfit,
  Playfair_Display,
  Rajdhani,
  Source_Sans_3,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { TopNav } from "@/components/ui/TopNav";
import { DevEnvBanner } from "@/components/ui/DevEnvBanner";
import { PerfDiagnosticsBoundary } from "@/components/perf/PerfDiagnosticsBoundary";
import { PageTransitionShell } from "@/components/motion/PageTransitionShell";
import { site } from "@/lib/site";

const ordDisplay = Playfair_Display({
  variable: "--font-display-ord",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ordUi = DM_Sans({
  variable: "--font-ui-ord",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const fraudDisplay = Crimson_Pro({
  variable: "--font-display-fraud",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraudUi = Space_Grotesk({
  variable: "--font-ui-fraud",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const shrinkDisplay = Oswald({
  variable: "--font-display-shrink",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const shrinkUi = Inter({
  variable: "--font-ui-shrink",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const starbucksDisplay = Lora({
  variable: "--font-display-starbucks",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const starbucksUi = Source_Sans_3({
  variable: "--font-ui-starbucks",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const teslaDisplay = Rajdhani({
  variable: "--font-display-tesla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const teslaUi = Outfit({
  variable: "--font-ui-tesla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const netflixDisplay = Merriweather({
  variable: "--font-display-netflix",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const netflixUi = Nunito_Sans({
  variable: "--font-ui-netflix",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-core",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Vaibhav Bapat | Decision Intelligence Portfolio",
    template: "%s | Vaibhav Bapat",
  },
  description:
    "Visual-first business analytics portfolio with interactive decision simulators across pricing, fraud, geospatial strategy, and portfolio optimization.",
  openGraph: {
    title: "Vaibhav Bapat | Decision Intelligence Portfolio",
    description:
      "Interactive decision simulators across pricing, fraud, geospatial strategy, and portfolio optimization.",
    url: site.url,
    siteName: "VB Labs",
    type: "website",
    images: [
      {
        url: `${site.url}/api/og?title=${encodeURIComponent("Vaibhav Bapat | Decision Intelligence Portfolio")}&theme=ord-lga-price-war`,
        width: 1200,
        height: 630,
        alt: "Decision Intelligence Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaibhav Bapat | Decision Intelligence Portfolio",
    description:
      "Interactive decision simulators across pricing, fraud, geospatial strategy, and portfolio optimization.",
    images: [
      `${site.url}/api/og?title=${encodeURIComponent("Vaibhav Bapat | Decision Intelligence Portfolio")}&theme=ord-lga-price-war`,
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ordDisplay.variable} ${ordUi.variable} ${fraudDisplay.variable} ${fraudUi.variable} ${shrinkDisplay.variable} ${shrinkUi.variable} ${starbucksDisplay.variable} ${starbucksUi.variable} ${teslaDisplay.variable} ${teslaUi.variable} ${netflixDisplay.variable} ${netflixUi.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <div className="site-shell min-h-screen">
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <TopNav />
          <DevEnvBanner />
          <PerfDiagnosticsBoundary />
          <main
            id="main-content"
            className="mx-auto w-full max-w-[1420px] px-5 pb-16 pt-6 sm:px-7 sm:pt-8 lg:px-10"
          >
            <PageTransitionShell>{children}</PageTransitionShell>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
