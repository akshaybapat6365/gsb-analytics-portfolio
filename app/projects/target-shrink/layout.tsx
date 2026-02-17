import { Sora } from "next/font/google";

const feature = Sora({
  variable: "--font-feature-shrink",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${feature.variable} relative`}
      data-project-theme="target-shrink"
      style={
        {
          // Amber / industrial palette
          "--p-accent": "251 191 36",
          "--p-accent2": "148 163 184",
          "--p-danger": "251 113 133",
          "--font-feature": "var(--font-feature-shrink)",
        } as React.CSSProperties
      }
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(820px_420px_at_18%_12%,rgba(var(--p-accent),0.14),transparent_62%),radial-gradient(980px_540px_at_85%_25%,rgba(var(--p-danger),0.08),transparent_65%)]" />
        <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_40%_15%,rgba(0,0,0,1)_30%,rgba(0,0,0,0)_72%)]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(251,191,36,0.08)_0px,rgba(251,191,36,0.08)_10px,transparent_10px,transparent_20px)]" />
        </div>
      </div>

      {children}
    </div>
  );
}
