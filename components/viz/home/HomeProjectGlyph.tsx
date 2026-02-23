import { area, line, scaleLinear } from "d3";
import type { HomeVizType } from "@/lib/projects/catalog";

type HomeProjectGlyphProps = {
  vizType: HomeVizType;
  series: number[];
  markerLabel: string;
  annotation: string;
};

const WIDTH = 380;
const HEIGHT = 178;
const PAD_X = 22;
const PAD_Y = 18;

function buildLine(series: number[]) {
  const x = scaleLinear()
    .domain([0, Math.max(1, series.length - 1)])
    .range([PAD_X, WIDTH - PAD_X]);
  const y = scaleLinear()
    .domain([Math.min(...series) - 1, Math.max(...series) + 1])
    .range([HEIGHT - PAD_Y, PAD_Y]);

  const mkLine = line<number>()
    .x((_, idx) => x(idx))
    .y((value) => y(value));
  const mkArea = area<number>()
    .x((_, idx) => x(idx))
    .y0(HEIGHT - PAD_Y)
    .y1((value) => y(value));

  return {
    path: mkLine(series) ?? "",
    fillPath: mkArea(series) ?? "",
    x,
    y,
  };
}

function renderMatrix(series: number[]) {
  const cells = Array.from({ length: 24 }, (_, idx) => {
    const value = series[idx % series.length] ?? 0;
    const col = idx % 6;
    const row = Math.floor(idx / 6);
    return (
      <rect
        key={idx}
        x={28 + col * 48}
        y={22 + row * 26}
        width={36}
        height={16}
        rx={2}
        fill={`rgba(198,153,98,${0.2 + ((value % 10) / 18)})`}
      />
    );
  });
  return <g>{cells}</g>;
}

function renderTimeline(series: number[]) {
  const { path, x, y } = buildLine(series);
  const focus = Math.floor(series.length * 0.6);
  return (
    <g>
      <line x1={PAD_X} x2={WIDTH - PAD_X} y1={HEIGHT - PAD_Y} y2={HEIGHT - PAD_Y} stroke="rgba(220,180,137,0.36)" />
      <path d={path} fill="none" stroke="rgba(199,94,94,0.94)" strokeWidth={3} />
      <circle cx={x(focus)} cy={y(series[focus] ?? 0)} r={5} fill="rgba(244,238,228,0.95)" />
    </g>
  );
}

function renderFrontier(series: number[]) {
  const { path, fillPath } = buildLine(series);
  const inverse = [...series].reverse().map((value, idx) => value - (idx % 2 === 0 ? 3 : 0));
  const inverseLine = buildLine(inverse);
  return (
    <g>
      <path d={fillPath} fill="rgba(198,153,98,0.2)" />
      <path d={path} fill="none" stroke="rgba(198,153,98,0.95)" strokeWidth={3} />
      <path d={inverseLine.path} fill="none" stroke="rgba(157,49,49,0.9)" strokeWidth={2.4} strokeDasharray="8 6" />
      <line x1={PAD_X} x2={WIDTH - PAD_X} y1={HEIGHT - PAD_Y} y2={HEIGHT - PAD_Y} stroke="rgba(232,209,181,0.3)" />
    </g>
  );
}

function renderBand(series: number[]) {
  const { path, x, y } = buildLine(series);
  const bandArea =
    area<number>()
      .x((_, idx) => x(idx))
      .y0((value) => y(value - 2))
      .y1((value) => y(value + 2))(series) ?? "";
  return (
    <g>
      <path d={bandArea} fill="rgba(88,119,84,0.24)" />
      <path d={path} fill="none" stroke="rgba(112,153,105,0.96)" strokeWidth={3} />
      <line x1={PAD_X} x2={WIDTH - PAD_X} y1={HEIGHT - PAD_Y} y2={HEIGHT - PAD_Y} stroke="rgba(186,217,180,0.24)" />
    </g>
  );
}

function renderNodes(series: number[]) {
  const centers = [42, 92, 142, 192, 242, 292];
  return (
    <g>
      {centers.slice(0, 5).map((cx, idx) => (
        <line
          key={`line-${cx}`}
          x1={cx}
          y1={78 - ((series[idx] ?? 0) % 12)}
          x2={centers[idx + 1]}
          y2={78 - ((series[idx + 1] ?? 0) % 12)}
          stroke="rgba(173,128,89,0.56)"
          strokeWidth={2}
        />
      ))}
      {centers.map((cx, idx) => (
        <circle
          key={cx}
          cx={cx}
          cy={78 - ((series[idx] ?? 0) % 12)}
          r={7 + ((series[idx] ?? 0) % 4)}
          fill="rgba(173,128,89,0.9)"
          stroke="rgba(244,238,228,0.36)"
        />
      ))}
      <line x1={PAD_X} x2={WIDTH - PAD_X} y1={HEIGHT - PAD_Y} y2={HEIGHT - PAD_Y} stroke="rgba(232,209,181,0.24)" />
    </g>
  );
}

function renderBubbles(series: number[]) {
  const circles = Array.from({ length: 6 }, (_, idx) => ({
    cx: 46 + idx * 47,
    cy: 30 + ((idx % 3) * 32),
    r: 10 + ((series[idx] ?? 0) % 9),
    alpha: 0.24 + ((series[idx] ?? 0) % 6) * 0.09,
  }));

  return (
    <g>
      {circles.map((circle, idx) => (
        <circle
          key={idx}
          cx={circle.cx}
          cy={circle.cy}
          r={circle.r}
          fill={`rgba(178,132,74,${circle.alpha})`}
          stroke="rgba(244,238,228,0.3)"
        />
      ))}
      <line x1={PAD_X} x2={WIDTH - PAD_X} y1={HEIGHT - PAD_Y} y2={HEIGHT - PAD_Y} stroke="rgba(232,209,181,0.22)" />
    </g>
  );
}

function renderByType(vizType: HomeVizType, series: number[]) {
  switch (vizType) {
    case "matrix":
      return renderMatrix(series);
    case "timeline":
      return renderTimeline(series);
    case "frontier":
      return renderFrontier(series);
    case "band":
      return renderBand(series);
    case "nodes":
      return renderNodes(series);
    case "bubbles":
      return renderBubbles(series);
    default:
      return null;
  }
}

export function HomeProjectGlyph({ vizType, series, markerLabel, annotation }: HomeProjectGlyphProps) {
  return (
    <div className="rounded-xl border border-white/20 bg-black/28 p-3.5 transition duration-200 group-hover:scale-[1.015]">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-[150px] w-full"
        role="img"
        aria-label={`${vizType} project preview`}
      >
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="rgba(0,0,0,0.08)" />
        {[24, 64, 104, 144].map((yy) => (
          <line key={yy} x1={0} y1={yy} x2={WIDTH} y2={yy} stroke="rgba(244,238,228,0.09)" strokeDasharray="3 8" />
        ))}
        {[26, 98, 170, 242, 314].map((xx) => (
          <line key={xx} x1={xx} y1={0} x2={xx} y2={HEIGHT} stroke="rgba(244,238,228,0.08)" strokeDasharray="2 10" />
        ))}
        {renderByType(vizType, series)}
      </svg>
      <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2 sm:items-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-slate-200">X: Scenario step</p>
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-slate-200 sm:text-right">Y: Signal index</p>
        <p className="font-mono text-[13px] text-amber-100 sm:col-span-2">{markerLabel}</p>
      </div>
      <p className="mt-1 text-[14px] leading-6 text-slate-200">{annotation}</p>
    </div>
  );
}
