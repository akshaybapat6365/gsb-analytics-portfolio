import { Libre_Baskerville } from "next/font/google";

const feature = Libre_Baskerville({
  variable: "--font-feature-fraud",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${feature.variable} relative`}
      data-project-theme="fraud-radar"
      style={
        {
          // Crimson / amber forensic palette
          "--p-accent": "251 113 133",
          "--p-accent2": "251 191 36",
          "--p-ink": "148 163 184",
          "--font-feature": "var(--font-feature-fraud)",
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_18%_18%,rgba(var(--p-accent),0.12),transparent_62%),radial-gradient(860px_520px_at_82%_22%,rgba(var(--p-accent2),0.10),transparent_60%),linear-gradient(180deg,rgba(2,6,23,0.25),rgba(2,6,23,0.05))]" />
        <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(circle_at_35%_15%,rgba(0,0,0,1)_35%,rgba(0,0,0,0)_70%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>
      </div>

      {children}
    </div>
  );
}
