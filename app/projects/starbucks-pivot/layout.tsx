import { Fraunces } from "next/font/google";

const feature = Fraunces({
  variable: "--font-feature-sbux",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${feature.variable} relative`}
      data-project-theme="starbucks-pivot"
      style={
        {
          // Emerald / cyan geo palette
          "--p-accent": "52 211 153",
          "--p-accent2": "34 211 238",
          "--p-ink": "148 163 184",
          "--font-feature": "var(--font-feature-sbux)",
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(860px_520px_at_22%_16%,rgba(var(--p-accent),0.12),transparent_62%),radial-gradient(860px_520px_at_82%_18%,rgba(var(--p-accent2),0.10),transparent_62%)]" />
        <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_40%_15%,rgba(0,0,0,1)_35%,rgba(0,0,0,0)_75%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>
      </div>

      {children}
    </div>
  );
}
