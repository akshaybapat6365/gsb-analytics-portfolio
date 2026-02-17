import { Tomorrow } from "next/font/google";

const feature = Tomorrow({
  variable: "--font-feature-tesla",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${feature.variable} relative`}
      data-project-theme="tesla-nacs"
      style={
        {
          // Tesla: cobalt / electric palette
          "--p-accent": "34 211 238",
          "--p-accent2": "34 197 94",
          "--p-ink": "148 163 184",
          "--font-feature": "var(--font-feature-tesla)",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_16%_16%,rgba(var(--p-accent),0.14),transparent_58%),radial-gradient(900px_520px_at_84%_18%,rgba(var(--p-accent2),0.10),transparent_62%)]" />
        <div className="absolute inset-0 opacity-50 [mask-image:radial-gradient(circle_at_40%_20%,rgba(0,0,0,1)_35%,rgba(0,0,0,0)_78%)]">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(250deg,rgba(34,211,238,0.06)_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>
      </div>

      {children}
    </div>
  );
}
