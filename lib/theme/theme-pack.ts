export type ThemePatternType =
  | "grid"
  | "topo"
  | "circuit"
  | "radar"
  | "film"
  | "hazard"
  | "runway";

export type ThemeLayoutMode =
  | "deck"
  | "war-board"
  | "map"
  | "dossier"
  | "ops-console";

export type ThemeMotionMotif =
  | "sweep"
  | "ping"
  | "snap"
  | "drift"
  | "flow"
  | "slide";

export type ThemePack = {
  id: string;
  palette: {
    bg: string;
    surface1: string;
    surface2: string;
    text1: string;
    text2: string;
    accent1: string;
    accent2: string;
    danger: string;
    success: string;
  };
  pattern: {
    type: ThemePatternType;
    params?: {
      cell?: number;
      opacity?: number;
      dot?: number;
      angle?: number;
    };
  };
  shader?: {
    variant: "ambient" | "sweep" | "projector" | "current";
    intensity: number;
    speed: number;
  };
  typeMode: {
    display: string;
    ui: string;
    mono: string;
    tracking: "tight" | "normal" | "wide";
    headingCase: "title" | "upper" | "sentence";
  };
  chartSkin: {
    gridAlpha: number;
    axisAlpha: number;
    lineWidth: number;
    markerStyle: "dot" | "ring" | "diamond";
    highlightGlow: number;
  };
  motion: {
    motif: ThemeMotionMotif;
    durations: {
      fast: number;
      medium: number;
      slow: number;
    };
    easing: string;
    maxLooping: "none" | "state-only";
  };
  iconGlyphs: {
    primary: string;
    secondary: string;
    risk: string;
  };
  layoutMode: ThemeLayoutMode;
};
