import { Rajdhani } from "next/font/google";

const feature = Rajdhani({
  variable: "--font-feature-ord",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${feature.variable} relative`}
      data-project-theme="ord-lga-price-war"
      style={
        {
          "--p-accent": "34 211 238",
          "--p-accent2": "56 189 248",
          "--p-warn": "251 113 133",
          "--p-steel": "148 163 184",
          "--font-feature": "var(--font-feature-ord)",
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(860px_540px_at_14%_14%,rgba(var(--p-accent),0.18),transparent_60%),radial-gradient(980px_620px_at_84%_12%,rgba(var(--p-accent2),0.16),transparent_62%),radial-gradient(900px_620px_at_46%_92%,rgba(var(--p-warn),0.08),transparent_64%)]" />
        <div className="absolute inset-0 opacity-65 [mask-image:radial-gradient(circle_at_40%_16%,rgba(0,0,0,1)_37%,rgba(0,0,0,0)_76%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] [background-size:56px_56px]" />
        </div>
        <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_60%_20%,rgba(0,0,0,1)_34%,rgba(0,0,0,0)_80%)]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(110deg,rgba(34,211,238,0.06)_0px,rgba(34,211,238,0.06)_1px,transparent_1px,transparent_28px)]" />
        </div>
      </div>

      {children}
    </div>
  );
}
