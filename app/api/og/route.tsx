import { ImageResponse } from "next/og";

export const runtime = "edge";

const palettes = {
  "ord-lga-price-war": {
    bg0: "#05080f",
    bg1: "#122033",
    accent: "#f6b24a",
    accent2: "#34d399",
  },
  "fraud-radar": {
    bg0: "#0a0a10",
    bg1: "#1e0f1f",
    accent: "#ff2daa",
    accent2: "#ffc247",
  },
  "target-shrink": {
    bg0: "#090707",
    bg1: "#1e1412",
    accent: "#f5c84b",
    accent2: "#58c4dd",
  },
  "starbucks-pivot": {
    bg0: "#070b0a",
    bg1: "#112117",
    accent: "#2fbf71",
    accent2: "#f2c26b",
  },
  "tesla-nacs": {
    bg0: "#05070b",
    bg1: "#071827",
    accent: "#00e5ff",
    accent2: "#a6ff00",
  },
  "netflix-roi": {
    bg0: "#060606",
    bg1: "#230b0d",
    accent: "#e50914",
    accent2: "#d4af37",
  },
} as const;

type ThemeKey = keyof typeof palettes;

function themeFor(value: string | null): ThemeKey {
  if (!value) return "ord-lga-price-war";
  if (value in palettes) return value as ThemeKey;
  return "ord-lga-price-war";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "VB Labs").slice(0, 96);
  const theme = themeFor(searchParams.get("theme"));
  const palette = palettes[theme];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          background: `linear-gradient(145deg, ${palette.bg0} 0%, ${palette.bg1} 100%)`,
          color: "#f4f4f5",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "48px",
            borderRadius: "28px",
            border: `1px solid ${palette.accent}55`,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: `${palette.accent2}`,
            }}
          >
            VB Labs
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <p
              style={{
                margin: 0,
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.05,
                maxWidth: "980px",
              }}
            >
              {title}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 28,
                color: "#d4d4d8",
              }}
            >
              Interactive decision simulators with evidence framing
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 24,
              color: "#d4d4d8",
            }}
          >
            <span>Pricing · Fraud · Ops · Geo · Infrastructure · Portfolio</span>
            <span style={{ color: palette.accent }}>{theme.replaceAll("-", " ")}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
