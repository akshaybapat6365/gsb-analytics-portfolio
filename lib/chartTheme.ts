/**
 * Shared chart theme — single source of truth for the curated
 * desaturated palette and dark-mode design tokens.
 *
 * Used by: homepage CardMiniViz, projects page cards, project detail pages.
 */

import type { ProjectSlug } from "@/lib/projects/catalog";

/* ── Curated accent palette ───────────────────────────── */
/* All within a similar luminance band for cohesion on dark backgrounds. */

export const ACCENT_BY_SLUG: Record<ProjectSlug, string> = {
    "ord-lga-price-war": "160,175,220", /* dusty blue   */
    "fraud-radar": "180,155,210",       /* soft lavender */
    "target-shrink": "155,190,170",     /* sage          */
    "starbucks-pivot": "190,178,150",   /* warm stone    */
    "tesla-nacs": "140,195,210",        /* steel teal    */
    "netflix-roi": "200,160,168",       /* dusty rose    */
};

export const DOMAIN_BY_SLUG: Record<ProjectSlug, string> = {
    "ord-lga-price-war": "Pricing Strategy",
    "fraud-radar": "Forensic Risk",
    "target-shrink": "Retail Operations",
    "starbucks-pivot": "Geospatial Strategy",
    "tesla-nacs": "Infrastructure",
    "netflix-roi": "Capital Allocation",
};

/* ── Dark theme tokens ───────────────────────────────── */

export const CHART_THEME = {
    bg: "transparent",
    surface: "#111116",
    text: {
        primary: "rgba(255,255,255,0.85)",
        secondary: "rgba(148,163,184,0.7)",
        muted: "rgba(100,116,139,0.5)",
    },
    grid: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.06)",
    font: {
        display: "var(--font-display)",
        mono: "var(--font-mono)",
        body: "var(--font-body)",
    },
} as const;

/* ── Gradient tints for card backdrops (desaturated) ─── */

export const BACKDROP_TINT_BY_SLUG: Record<ProjectSlug, string> = {
    "ord-lga-price-war": "from-[rgba(160,175,220,0.22)] via-transparent to-[rgba(140,195,210,0.14)]",
    "fraud-radar": "from-[rgba(180,155,210,0.22)] via-transparent to-[rgba(200,160,168,0.14)]",
    "target-shrink": "from-[rgba(155,190,170,0.22)] via-transparent to-[rgba(190,178,150,0.14)]",
    "starbucks-pivot": "from-[rgba(190,178,150,0.22)] via-transparent to-[rgba(155,190,170,0.14)]",
    "tesla-nacs": "from-[rgba(140,195,210,0.22)] via-transparent to-[rgba(160,175,220,0.14)]",
    "netflix-roi": "from-[rgba(200,160,168,0.22)] via-transparent to-[rgba(180,155,210,0.14)]",
};
