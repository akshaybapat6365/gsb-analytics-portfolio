import type { CSSProperties } from "react";
import type { ProjectSlug } from "@/lib/projects/catalog";
import type { ThemePack } from "@/lib/theme/theme-pack";

function hexToTriplet(hex: string): string {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => `${ch}${ch}`)
          .join("")
      : clean;

  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r} ${g} ${b}`;
}

function patternCss(theme: ThemePack): string {
  const cell = theme.pattern.params?.cell ?? 64;
  const opacity = theme.pattern.params?.opacity ?? 0.2;
  const dot = theme.pattern.params?.dot ?? 2;
  const angle = theme.pattern.params?.angle ?? 35;

  switch (theme.pattern.type) {
    case "runway":
      return `linear-gradient(${angle}deg, rgba(255,255,255,${opacity * 0.45}) 0 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,${opacity * 0.34}) 0 1px, transparent 1px)`;
    case "radar":
      return `radial-gradient(circle at 20% 24%, rgba(255,255,255,${opacity}) 0 ${dot}px, transparent ${dot}px), linear-gradient(to right, rgba(255,255,255,${opacity * 0.5}) 1px, transparent 1px)`;
    case "hazard":
      return `repeating-linear-gradient(${angle}deg, rgba(255,255,255,${opacity * 0.75}) 0 1px, transparent 1px ${Math.max(8, cell / 3)}px)`;
    case "topo":
      return `repeating-radial-gradient(circle at 18% 24%, rgba(255,255,255,${opacity * 0.58}) 0 1px, transparent 1px ${Math.max(9, cell / 4)}px)`;
    case "circuit":
      return `linear-gradient(to right, rgba(255,255,255,${opacity * 0.52}) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,${opacity * 0.33}) 1px, transparent 1px)`;
    case "film":
      return `radial-gradient(circle at 8% 12%, rgba(255,255,255,${opacity * 0.72}) 0 ${dot}px, transparent ${dot}px), repeating-linear-gradient(to bottom, rgba(255,255,255,${opacity * 0.38}) 0 1px, transparent 1px 16px)`;
    case "grid":
    default:
      return `linear-gradient(to right, rgba(255,255,255,${opacity * 0.58}) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,${opacity * 0.45}) 1px, transparent 1px)`;
  }
}

const displayStack = {
  ord: '"PP Editorial New", "S\u00f6hne", "Instrument Serif", serif',
  fraud: '"Freigeist", "S\u00f6hne", "Instrument Serif", serif',
  shrink: '"FK Grotesk Neue", "S\u00f6hne", "Instrument Sans", sans-serif',
  starbucks: '"PP Editorial New", "Graphik", "Instrument Serif", serif',
  tesla: '"Neue Haas Grotesk", "GT America", "Instrument Sans", sans-serif',
  netflix: '"Times Now", "Messina Sans", "Instrument Serif", serif',
} as const;

const uiStack = {
  ord: '"S\u00f6hne", "Graphik", "Instrument Sans", sans-serif',
  fraud: '"Diatype", "Untitled Sans", "Instrument Sans", sans-serif',
  shrink: '"FK Grotesk Neue", "Switzer", "Instrument Sans", sans-serif',
  starbucks: '"Messina Sans", "Basel Grotesk", "Instrument Sans", sans-serif',
  tesla: '"GT America", "Aeonik", "Instrument Sans", sans-serif',
  netflix: '"Suisse Int\'l", "TWK Lausanne", "Instrument Sans", sans-serif',
} as const;

const monoStack = '"GT America Mono", "Geist Mono", "IBM Plex Mono", monospace';

export const themePacks: Record<ProjectSlug, ThemePack> = {
  "ord-lga-price-war": {
    id: "ord-lga-price-war",
    palette: {
      bg: "#070B12",
      surface1: "#0E1422",
      surface2: "#121B2D",
      text1: "#E6E8EE",
      text2: "#AAB0C0",
      accent1: "#F6B24A",
      accent2: "#34D399",
      danger: "#FF4D4D",
      success: "#34D399",
    },
    pattern: { type: "runway", params: { cell: 44, opacity: 0.22, angle: 32 } },
    shader: { variant: "sweep", intensity: 0.18, speed: 0.22 },
    typeMode: { display: displayStack.ord, ui: uiStack.ord, mono: monoStack, tracking: "tight", headingCase: "title" },
    chartSkin: { gridAlpha: 0.2, axisAlpha: 0.52, lineWidth: 2.8, markerStyle: "diamond", highlightGlow: 0.35 },
    motion: { motif: "sweep", durations: { fast: 140, medium: 260, slow: 520 }, easing: "cubic-bezier(0.22,1,0.36,1)", maxLooping: "state-only" },
    iconGlyphs: { primary: "runway", secondary: "telemetry", risk: "shock" },
    layoutMode: "war-board",
  },
  "fraud-radar": {
    id: "fraud-radar",
    palette: {
      bg: "#07080C",
      surface1: "#0F1118",
      surface2: "#141823",
      text1: "#E9ECF3",
      text2: "#A7AEC2",
      accent1: "#FF2DAA",
      accent2: "#FFC247",
      danger: "#FF2DAA",
      success: "#61F2C2",
    },
    pattern: { type: "radar", params: { cell: 72, opacity: 0.22, dot: 2 } },
    shader: { variant: "sweep", intensity: 0.14, speed: 0.16 },
    typeMode: { display: displayStack.fraud, ui: uiStack.fraud, mono: monoStack, tracking: "normal", headingCase: "upper" },
    chartSkin: { gridAlpha: 0.17, axisAlpha: 0.54, lineWidth: 2.6, markerStyle: "ring", highlightGlow: 0.4 },
    motion: { motif: "ping", durations: { fast: 120, medium: 240, slow: 460 }, easing: "cubic-bezier(0.2,0.8,0.2,1)", maxLooping: "state-only" },
    iconGlyphs: { primary: "radar", secondary: "cluster", risk: "anomaly" },
    layoutMode: "dossier",
  },
  "target-shrink": {
    id: "target-shrink",
    palette: {
      bg: "#090707",
      surface1: "#141010",
      surface2: "#1B1515",
      text1: "#F2EFEA",
      text2: "#BEB7AE",
      accent1: "#F5C84B",
      accent2: "#58C4DD",
      danger: "#E24A4A",
      success: "#58C4DD",
    },
    pattern: { type: "hazard", params: { cell: 32, opacity: 0.12, angle: 18 } },
    typeMode: { display: displayStack.shrink, ui: uiStack.shrink, mono: monoStack, tracking: "normal", headingCase: "sentence" },
    chartSkin: { gridAlpha: 0.15, axisAlpha: 0.58, lineWidth: 2.5, markerStyle: "dot", highlightGlow: 0.25 },
    motion: { motif: "snap", durations: { fast: 110, medium: 190, slow: 380 }, easing: "cubic-bezier(0.2,0.9,0.25,1)", maxLooping: "none" },
    iconGlyphs: { primary: "ops", secondary: "threshold", risk: "loss" },
    layoutMode: "ops-console",
  },
  "starbucks-pivot": {
    id: "starbucks-pivot",
    palette: {
      bg: "#070B0A",
      surface1: "#0E1512",
      surface2: "#122019",
      text1: "#E7F0EA",
      text2: "#B2C3B7",
      accent1: "#2FBF71",
      accent2: "#F2C26B",
      danger: "#7A4E2D",
      success: "#2FBF71",
    },
    pattern: { type: "topo", params: { cell: 54, opacity: 0.16 } },
    shader: { variant: "ambient", intensity: 0.08, speed: 0.1 },
    typeMode: { display: displayStack.starbucks, ui: uiStack.starbucks, mono: monoStack, tracking: "normal", headingCase: "title" },
    chartSkin: { gridAlpha: 0.15, axisAlpha: 0.5, lineWidth: 2.4, markerStyle: "ring", highlightGlow: 0.28 },
    motion: { motif: "drift", durations: { fast: 140, medium: 260, slow: 520 }, easing: "cubic-bezier(0.16,1,0.3,1)", maxLooping: "state-only" },
    iconGlyphs: { primary: "atlas", secondary: "store", risk: "delta" },
    layoutMode: "map",
  },
  "tesla-nacs": {
    id: "tesla-nacs",
    palette: {
      bg: "#05070B",
      surface1: "#0B111A",
      surface2: "#111A28",
      text1: "#EAF2FF",
      text2: "#A8B6CC",
      accent1: "#00E5FF",
      accent2: "#A6FF00",
      danger: "#FF2D2D",
      success: "#A6FF00",
    },
    pattern: { type: "circuit", params: { cell: 48, opacity: 0.18 } },
    shader: { variant: "current", intensity: 0.16, speed: 0.2 },
    typeMode: { display: displayStack.tesla, ui: uiStack.tesla, mono: monoStack, tracking: "wide", headingCase: "upper" },
    chartSkin: { gridAlpha: 0.17, axisAlpha: 0.56, lineWidth: 2.5, markerStyle: "ring", highlightGlow: 0.33 },
    motion: { motif: "flow", durations: { fast: 120, medium: 220, slow: 420 }, easing: "cubic-bezier(0.25,0.9,0.28,1)", maxLooping: "state-only" },
    iconGlyphs: { primary: "node", secondary: "corridor", risk: "cannibalization" },
    layoutMode: "war-board",
  },
  "netflix-roi": {
    id: "netflix-roi",
    palette: {
      bg: "#050505",
      surface1: "#101014",
      surface2: "#171821",
      text1: "#F0F2F7",
      text2: "#B2B7C4",
      accent1: "#E50914",
      accent2: "#D4AF37",
      danger: "#E50914",
      success: "#4E5566",
    },
    pattern: { type: "film", params: { cell: 18, opacity: 0.1, dot: 1 } },
    shader: { variant: "projector", intensity: 0.1, speed: 0.08 },
    typeMode: { display: displayStack.netflix, ui: uiStack.netflix, mono: monoStack, tracking: "tight", headingCase: "title" },
    chartSkin: { gridAlpha: 0.15, axisAlpha: 0.54, lineWidth: 2.4, markerStyle: "dot", highlightGlow: 0.28 },
    motion: { motif: "slide", durations: { fast: 130, medium: 240, slow: 500 }, easing: "cubic-bezier(0.22,1,0.36,1)", maxLooping: "none" },
    iconGlyphs: { primary: "committee", secondary: "frontier", risk: "burn" },
    layoutMode: "deck",
  },
};

export function getThemePack(slug: ProjectSlug): ThemePack {
  const theme = themePacks[slug];
  if (!theme) {
    throw new Error(`Missing ThemePack for project slug: ${slug}`);
  }
  return theme;
}

export function themeToStyleVars(theme: ThemePack): CSSProperties {
  const pattern = patternCss(theme);
  const surfaceTint = theme.palette.surface2;

  return {
    "--canvas": hexToTriplet(theme.palette.bg),
    "--surface-1": hexToTriplet(theme.palette.surface1),
    "--surface-2": hexToTriplet(theme.palette.surface2),
    "--text-1": hexToTriplet(theme.palette.text1),
    "--text-2": hexToTriplet(theme.palette.text2),
    "--accent-1": hexToTriplet(theme.palette.accent1),
    "--accent-2": hexToTriplet(theme.palette.accent2),
    "--success": hexToTriplet(theme.palette.success),
    "--risk": hexToTriplet(theme.palette.danger),
    "--p-accent": hexToTriplet(theme.palette.accent1),
    "--p-accent2": hexToTriplet(theme.palette.accent2),
    "--p-danger": hexToTriplet(theme.palette.danger),
    "--p-warn": hexToTriplet(theme.palette.accent2),
    "--p-surface-tint": hexToTriplet(surfaceTint),
    "--p-glow": String(theme.chartSkin.highlightGlow),
    "--p-pattern-opacity": String(theme.pattern.params?.opacity ?? 0.2),
    "--p-chart-grid-alpha": String(theme.chartSkin.gridAlpha),
    "--p-chart-axis-alpha": String(theme.chartSkin.axisAlpha),
    "--p-chart-line-width": String(theme.chartSkin.lineWidth),
    "--p-motion-ease": theme.motion.easing,
    "--p-motion-fast": `${theme.motion.durations.fast}ms`,
    "--p-motion-med": `${theme.motion.durations.medium}ms`,
    "--p-motion-slow": `${theme.motion.durations.slow}ms`,
    "--font-feature": theme.typeMode.display,
    "--font-ui": theme.typeMode.ui,
    "--font-mono-theme": theme.typeMode.mono,
    "--project-pattern": pattern,
    "--project-grid-size": `${theme.pattern.params?.cell ?? 64}px ${theme.pattern.params?.cell ?? 64}px`,
  } as CSSProperties;
}
