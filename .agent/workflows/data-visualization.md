---
description: Data visualization library selection and usage patterns for the gsb-analytics-portfolio
---

# Data Visualization Skill

## Current Stack (Already Installed)

| Library | Version | Use For |
|---------|---------|---------|
| **D3.js** | ^7.9.0 | Low-level custom SVG/Canvas (hero chart, card mini-vizs, bespoke animations) |
| **ECharts** | ^6.0.0 | Rich interactive charts with built-in theming, WebGL mode for large datasets |
| **echarts-for-react** | ^3.0.6 | React wrapper for ECharts — declarative usage in components |
| **deck.gl** | ^9.2.7 | GPU-powered geospatial layers (Starbucks map, Tesla charging network) |
| **Framer Motion** | ^12.34.0 | UI transitions, scroll-linked animations, layout animations |

## Recommended Additions

### Tier 1: Install Now (Immediate Value)

#### `@nivo/core` + chart packages
```bash
npm install @nivo/core @nivo/bar @nivo/line @nivo/heatmap @nivo/network @nivo/radar @nivo/waffle
```
**Why:** Server-renderable React chart components with beautiful defaults. Great for card thumbnails and project page mini-charts. Supports SSR (no hydration issues), dark themes, responsive sizing, and transitions built-in.

**Use in this project:**
- Card thumbnail visualizations (replace hand-coded D3 SVGs)
- Project page summary charts
- Any chart where you want beauty out-of-the-box without manual D3

**Example pattern:**
```tsx
import { ResponsiveHeatMap } from '@nivo/heatmap';

// Use inside a card or section — automatically responsive
<ResponsiveHeatMap
  data={heatmapData}
  colors={{ scheme: 'greys' }}
  theme={{ background: 'transparent', textColor: '#94a3b8' }}
  enableLabels={false}
  borderRadius={3}
/>
```

#### `@visx/visx` (or individual packages)
```bash
npm install @visx/group @visx/scale @visx/shape @visx/axis @visx/grid @visx/tooltip @visx/responsive
```
**Why:** Airbnb's low-level D3 primitives for React. Same flexibility as D3 but renders as React components (no `useRef`/`useEffect` needed). Best for when you need D3-level control but want React's component model.

**Use in this project:**
- Complex interactive project page visualizations
- Custom axes, grids, and annotations that need React event handling
- When ECharts is too opinionated and raw D3 is too imperative

### Tier 2: Consider Later

| Library | When to Add |
|---------|-------------|
| **recharts** | If you need quick declarative line/bar/area charts without customization |
| **Vega-Lite** | If you want a grammar-of-graphics approach for reproducible specs |
| **Plotly.js** | If you need 3D, scientific, or statistical chart types |

### Not Recommended for This Project

| Library | Why Not |
|---------|---------|
| **Chart.js** | Canvas-only, less customizable than what's already available |
| **Streamlit/Dash** | Python-based, not applicable to Next.js |
| **Superset/Metabase** | Full BI platforms, overkill for a portfolio site |

## Usage Patterns

### When to Use Which Library

```
Decision Tree:
├── Need a quick, beautiful chart with minimal code?
│   └── Use nivo (ResponsiveBar, ResponsiveLine, etc.)
├── Need full custom control over every SVG element?
│   ├── React-native approach → Use visx
│   └── Imperative approach → Use D3 with useRef + useEffect
├── Need a rich interactive chart with zoom/pan/tooltips?
│   └── Use ECharts (via echarts-for-react)
├── Need GPU-powered geospatial rendering?
│   └── Use deck.gl
└── Need animated UI transitions?
    └── Use Framer Motion
```

### Dark Theme Configuration

All charts in this project must use the cold/dark palette:

```ts
// Shared chart theme constants
export const CHART_THEME = {
  background: 'transparent',
  surface: '#111116',
  text: {
    primary: 'rgba(255,255,255,0.85)',
    secondary: 'rgba(148,163,184,0.7)',  // slate-400
    muted: 'rgba(100,116,139,0.5)',      // slate-500
  },
  grid: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.06)',
  font: {
    display: 'var(--font-display)',  // Playfair Display
    mono: 'var(--font-mono)',         // IBM Plex Mono
    body: 'var(--font-body)',         // DM Sans
  },
};

// Curated accent palette (desaturated, cohesive)
export const ACCENT_PALETTE = {
  dustyBlue:    '160,175,220',
  softLavender: '180,155,210',
  sage:         '155,190,170',
  warmStone:    '190,178,150',
  steelTeal:    '140,195,210',
  dustyRose:    '200,160,168',
};
```

### ECharts Dark Theme Setup

```tsx
import ReactECharts from 'echarts-for-react';

const option = {
  backgroundColor: 'transparent',
  textStyle: { color: 'rgba(148,163,184,0.7)', fontFamily: 'var(--font-mono)' },
  grid: { top: 20, right: 20, bottom: 30, left: 40 },
  xAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    splitLine: { show: false },
  },
  // ... chart-specific options
};

<ReactECharts option={option} style={{ height: 300 }} />;
```

### nivo Dark Theme

```tsx
const nivoTheme = {
  background: 'transparent',
  textColor: 'rgba(148,163,184,0.7)',
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  grid: { line: { stroke: 'rgba(255,255,255,0.04)' } },
  axis: {
    ticks: { text: { fill: 'rgba(100,116,139,0.5)' } },
    legend: { text: { fill: 'rgba(148,163,184,0.7)' } },
  },
  tooltip: {
    container: {
      background: '#111116',
      color: 'rgba(255,255,255,0.85)',
      fontSize: 12,
      borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.06)',
    },
  },
};
```

## File Organization

```
components/
  charts/              # Reusable chart components
    ChartTheme.ts      # Shared theme constants
    EChartsWrapper.tsx  # Pre-themed ECharts wrapper
    MiniViz.tsx         # Card thumbnail D3 mini-visualizations
  home/
    CardMiniViz.tsx     # Homepage card D3 thumbnails (current)
  projects/
    [slug]/             # Project-specific interactive visualizations
```
