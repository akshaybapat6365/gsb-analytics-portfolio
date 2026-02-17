import { Merriweather } from "next/font/google";

const feature = Merriweather({
  variable: "--font-feature-netflix",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${feature.variable} relative`}
      data-project-theme="netflix-roi"
      style={
        {
          // Studio palette with cinematic purple replaced by warm slate/amber accents
          "--p-accent": "148 163 184",
          "--p-accent2": "251 191 36",
          "--p-ink": "226 232 240",
          "--font-feature": "var(--font-feature-netflix)",
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(940px_520px_at_18%_12%,rgba(var(--p-accent),0.13),transparent_58%),radial-gradient(900px_520px_at_84%_16%,rgba(var(--p-accent2),0.10),transparent_62%)]" />
        <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_40%_18%,rgba(0,0,0,1)_35%,rgba(0,0,0,0)_76%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] [background-size:55px_55px]" />
        </div>
      </div>

      {children}
    </div>
  );
}
