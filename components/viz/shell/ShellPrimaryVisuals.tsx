import type { AirlinePayload } from "@/lib/schemas/airline";
import type { EvPayload } from "@/lib/schemas/ev";
import type { FraudPayload } from "@/lib/schemas/fraud";
import type { NetflixPayload } from "@/lib/schemas/netflix";
import type { ShrinkPayload } from "@/lib/schemas/shrink";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";

type Bounds = {
  min: number;
  max: number;
};

type Point = {
  x: number;
  y: number;
};

function extent(values: number[]): Bounds {
  if (values.length === 0) {
    return { min: 0, max: 1 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }
  return { min, max };
}

function scaleLinear(value: number, domain: Bounds, range: Bounds): number {
  const pct = (value - domain.min) / Math.max(1e-9, domain.max - domain.min);
  return range.min + pct * (range.max - range.min);
}

function linePath(points: Point[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

function chartFrame(
  width: number,
  height: number,
  margin: { left: number; right: number; top: number; bottom: number },
) {
  return {
    xMin: margin.left,
    xMax: width - margin.right,
    yMin: margin.top,
    yMax: height - margin.bottom,
  };
}

export function OrdShellVisual({ payload }: { payload: AirlinePayload }) {
  const width = 980;
  const height = 420;
  const margin = { left: 64, right: 36, top: 30, bottom: 52 };
  const frame = chartFrame(width, height, margin);

  const deltas = payload.days.map((day) => day.algo.revenue - day.actual.revenue);
  const cumulative = deltas.reduce<number[]>((acc, value) => {
    const prev = acc[acc.length - 1] ?? 0;
    acc.push(prev + value);
    return acc;
  }, []);
  const deltaBounds = extent(deltas);
  const cumulativeBounds = extent(cumulative);
  const xDomain = { min: 0, max: Math.max(1, deltas.length - 1) };

  const deltaPoints = deltas.map((value, idx) => ({
    x: scaleLinear(idx, xDomain, { min: frame.xMin, max: frame.xMax }),
    y: scaleLinear(value, deltaBounds, { min: frame.yMax, max: frame.yMin }),
  }));
  const cumulativePoints = cumulative.map((value, idx) => ({
    x: scaleLinear(idx, xDomain, { min: frame.xMin, max: frame.xMax }),
    y: scaleLinear(value, cumulativeBounds, { min: frame.yMax, max: frame.yMin }),
  }));

  const bestIdx = deltas.reduce(
    (best, value, idx) => (value > deltas[best] ? idx : best),
    0,
  );
  const worstIdx = deltas.reduce(
    (worst, value, idx) => (value < deltas[worst] ? idx : worst),
    0,
  );

  const bestDate = payload.days[bestIdx]?.date ?? "n/a";
  const worstDate = payload.days[worstIdx]?.date ?? "n/a";

  return (
    <section className="panel overflow-hidden p-4 sm:p-5" data-testid="primary-chart">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Route-Day Revenue Delta
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Solid line: daily algorithmic lift. Dashed line: cumulative lift over the quarter.
          </p>
        </div>
        <div className="metric-strip px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Best / Worst Day
          </p>
          <p className="mt-1 font-mono text-xs text-slate-100">
            {bestDate} / {worstDate}
          </p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full rounded-xl border border-white/10 bg-black/20">
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = frame.yMin + (tick / 4) * (frame.yMax - frame.yMin);
          return (
            <line
              key={`ord-grid-${tick}`}
              x1={frame.xMin}
              x2={frame.xMax}
              y1={y}
              y2={y}
              stroke="rgba(182,169,151,0.16)"
              strokeDasharray="5 8"
            />
          );
        })}
        <line
          x1={frame.xMin}
          x2={frame.xMax}
          y1={frame.yMax}
          y2={frame.yMax}
          stroke="rgba(182,169,151,0.4)"
        />
        <line
          x1={frame.xMin}
          x2={frame.xMin}
          y1={frame.yMin}
          y2={frame.yMax}
          stroke="rgba(182,169,151,0.4)"
        />

        <path
          d={linePath(deltaPoints)}
          fill="none"
          stroke="rgba(196,164,126,0.96)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d={linePath(cumulativePoints)}
          fill="none"
          stroke="rgba(171,78,54,0.92)"
          strokeWidth={2.4}
          strokeDasharray="8 7"
          strokeLinecap="round"
        />

        {bestIdx !== worstIdx ? (
          <>
            <circle
              cx={deltaPoints[bestIdx]?.x}
              cy={deltaPoints[bestIdx]?.y}
              r="5.5"
              fill="rgba(73,95,69,0.95)"
            />
            <circle
              cx={deltaPoints[worstIdx]?.x}
              cy={deltaPoints[worstIdx]?.y}
              r="5.5"
              fill="rgba(157,49,49,0.95)"
            />
          </>
        ) : null}

        <text
          x={frame.xMin}
          y={height - 18}
          fill="rgba(182,169,151,0.9)"
          fontSize="11"
          fontFamily="var(--font-ibm-plex-mono)"
        >
          Q2 route-day index
        </text>
        <text
          x={18}
          y={frame.yMin + 6}
          fill="rgba(182,169,151,0.9)"
          fontSize="11"
          fontFamily="var(--font-ibm-plex-mono)"
        >
          $ delta
        </text>
      </svg>
    </section>
  );
}

export function FraudShellVisual({ payload }: { payload: FraudPayload }) {
  const width = 980;
  const height = 420;
  const margin = { left: 64, right: 36, top: 30, bottom: 52 };
  const frame = chartFrame(width, height, margin);

  const filings = [...payload.filings]
    .sort((a, b) => a.filingDate.localeCompare(b.filingDate))
    .slice(-20);
  const risk = filings.map((f) => f.riskScore);
  const deception = filings.map((f) => f.deception);
  const scoreBounds = extent([...risk, ...deception]);
  const xDomain = { min: 0, max: Math.max(1, filings.length - 1) };

  const riskPoints = risk.map((value, idx) => ({
    x: scaleLinear(idx, xDomain, { min: frame.xMin, max: frame.xMax }),
    y: scaleLinear(value, scoreBounds, { min: frame.yMax, max: frame.yMin }),
  }));
  const deceptionPoints = deception.map((value, idx) => ({
    x: scaleLinear(idx, xDomain, { min: frame.xMin, max: frame.xMax }),
    y: scaleLinear(value, scoreBounds, { min: frame.yMax, max: frame.yMin }),
  }));

  const spikeIdx = risk.reduce((best, value, idx) => (value > risk[best] ? idx : best), 0);
  const spike = filings[spikeIdx];

  return (
    <section className="panel overflow-hidden p-4 sm:p-5" data-testid="primary-chart">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-rose-100/85">
            Filing Risk Trajectory
          </p>
          <p className="mt-1 text-sm text-rose-100/72">
            Risk-score and deception-index convergence. Peak point is annotated for pre-collapse lead time.
          </p>
        </div>
        <div className="metric-strip px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Peak Signal
          </p>
          <p className="mt-1 font-mono text-xs text-slate-100">
            {spike?.ticker ?? "n/a"} · {spike?.filingDate ?? "n/a"}
          </p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full rounded-xl border border-white/10 bg-black/20">
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = frame.yMin + (tick / 4) * (frame.yMax - frame.yMin);
          return (
            <line
              key={`fraud-grid-${tick}`}
              x1={frame.xMin}
              x2={frame.xMax}
              y1={y}
              y2={y}
              stroke="rgba(182,169,151,0.14)"
              strokeDasharray="5 8"
            />
          );
        })}
        <line x1={frame.xMin} x2={frame.xMax} y1={frame.yMax} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />
        <line x1={frame.xMin} x2={frame.xMin} y1={frame.yMin} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />

        <path d={linePath(riskPoints)} fill="none" stroke="rgba(190,24,93,0.94)" strokeWidth={3} />
        <path d={linePath(deceptionPoints)} fill="none" stroke="rgba(145,98,51,0.94)" strokeWidth={2.5} strokeDasharray="7 6" />

        {spikeIdx >= 0 ? (
          <>
            <circle cx={riskPoints[spikeIdx]?.x} cy={riskPoints[spikeIdx]?.y} r="5.8" fill="rgba(244,114,182,0.95)" />
            <line
              x1={riskPoints[spikeIdx]?.x}
              x2={riskPoints[spikeIdx]?.x}
              y1={riskPoints[spikeIdx]?.y}
              y2={frame.yMin}
              stroke="rgba(244,114,182,0.5)"
              strokeDasharray="4 5"
            />
          </>
        ) : null}

        <text x={frame.xMin} y={height - 18} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          Filing sequence
        </text>
        <text x={18} y={frame.yMin + 6} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          score
        </text>
      </svg>
    </section>
  );
}

export function ShrinkShellVisual({ payload }: { payload: ShrinkPayload }) {
  const width = 980;
  const height = 420;
  const margin = { left: 64, right: 36, top: 30, bottom: 52 };
  const frame = chartFrame(width, height, margin);

  const outcomes = [...payload.policy.outcomes].sort((a, b) => a.threshold - b.threshold);
  const roi = outcomes.map((o) => o.roi);
  const fp = outcomes.map((o) => o.falsePositiveRate * 100);
  const yBounds = extent([...roi, ...fp]);
  const xDomain = {
    min: outcomes[0]?.threshold ?? 0.55,
    max: outcomes[outcomes.length - 1]?.threshold ?? 0.95,
  };

  const roiPoints = outcomes.map((o) => ({
    x: scaleLinear(o.threshold, xDomain, { min: frame.xMin, max: frame.xMax }),
    y: scaleLinear(o.roi, yBounds, { min: frame.yMax, max: frame.yMin }),
  }));
  const fpPoints = outcomes.map((o) => ({
    x: scaleLinear(o.threshold, xDomain, { min: frame.xMin, max: frame.xMax }),
    y: scaleLinear(o.falsePositiveRate * 100, yBounds, { min: frame.yMax, max: frame.yMin }),
  }));
  const bestIdx = roi.reduce((best, value, idx) => (value > roi[best] ? idx : best), 0);
  const bestThreshold = outcomes[bestIdx]?.threshold ?? 0;

  return (
    <section className="panel overflow-hidden p-4 sm:p-5" data-testid="primary-chart">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-100/90">
            Stop Rule Frontier
          </p>
          <p className="mt-1 text-sm text-amber-100/72">
            Frontier overlays ROI (solid) and false-positive burden (dashed) across threshold policy.
          </p>
        </div>
        <div className="metric-strip px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Max ROI Threshold
          </p>
          <p className="mt-1 font-mono text-xs text-slate-100">{(bestThreshold * 100).toFixed(0)}%</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full rounded-xl border border-white/10 bg-black/20">
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = frame.yMin + (tick / 4) * (frame.yMax - frame.yMin);
          return (
            <line
              key={`shrink-grid-${tick}`}
              x1={frame.xMin}
              x2={frame.xMax}
              y1={y}
              y2={y}
              stroke="rgba(182,169,151,0.14)"
              strokeDasharray="5 8"
            />
          );
        })}
        <line x1={frame.xMin} x2={frame.xMax} y1={frame.yMax} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />
        <line x1={frame.xMin} x2={frame.xMin} y1={frame.yMin} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />

        <path d={linePath(roiPoints)} fill="none" stroke="rgba(139,107,62,0.95)" strokeWidth={3} />
        <path d={linePath(fpPoints)} fill="none" stroke="rgba(157,49,49,0.9)" strokeWidth={2.4} strokeDasharray="7 6" />

        <line
          x1={scaleLinear(bestThreshold, xDomain, { min: frame.xMin, max: frame.xMax })}
          x2={scaleLinear(bestThreshold, xDomain, { min: frame.xMin, max: frame.xMax })}
          y1={frame.yMin}
          y2={frame.yMax}
          stroke="rgba(73,95,69,0.82)"
          strokeDasharray="4 5"
        />

        <text x={frame.xMin} y={height - 18} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          Threshold policy
        </text>
        <text x={18} y={frame.yMin + 6} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          ROI / FPR
        </text>
      </svg>
    </section>
  );
}

export function StarbucksShellVisual({ payload }: { payload: StarbucksPayload }) {
  const width = 980;
  const height = 420;
  const margin = { left: 64, right: 36, top: 30, bottom: 52 };
  const frame = chartFrame(width, height, margin);

  const xBounds = extent(payload.stores.map((store) => store.wfhExposure));
  const yBounds = extent(payload.stores.map((store) => store.deltaProfitK));

  const colorByRecommendation: Record<string, string> = {
    Convert: "rgba(34,197,94,0.88)",
    Lockers: "rgba(245,158,11,0.88)",
    Close: "rgba(190,24,93,0.88)",
  };

  const top = [...payload.stores]
    .sort((a, b) => Math.abs(b.deltaProfitK) - Math.abs(a.deltaProfitK))
    .slice(0, 3);

  return (
    <section className="panel overflow-hidden p-4 sm:p-5" data-testid="primary-chart">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-100/90">
            Store Recommendation Matrix
          </p>
          <p className="mt-1 text-sm text-emerald-100/72">
            X-axis: WFH exposure. Y-axis: projected delta profit. Color: convert, lockers, or close.
          </p>
        </div>
        <div className="metric-strip px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            High-Leverage Stores
          </p>
          <p className="mt-1 font-mono text-xs text-slate-100">{top.map((store) => store.id).join(" · ") || "n/a"}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full rounded-xl border border-white/10 bg-black/20">
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = frame.yMin + (tick / 4) * (frame.yMax - frame.yMin);
          return (
            <line
              key={`sbux-grid-${tick}`}
              x1={frame.xMin}
              x2={frame.xMax}
              y1={y}
              y2={y}
              stroke="rgba(182,169,151,0.14)"
              strokeDasharray="5 8"
            />
          );
        })}
        <line x1={frame.xMin} x2={frame.xMax} y1={frame.yMax} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />
        <line x1={frame.xMin} x2={frame.xMin} y1={frame.yMin} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />

        {payload.stores.map((store) => {
          const x = scaleLinear(store.wfhExposure, xBounds, { min: frame.xMin, max: frame.xMax });
          const y = scaleLinear(store.deltaProfitK, yBounds, { min: frame.yMax, max: frame.yMin });
          return (
            <circle
              key={store.id}
              cx={x}
              cy={y}
              r={6 + Math.min(10, Math.abs(store.deltaProfitK) / 12)}
              fill={colorByRecommendation[store.recommendation] ?? "rgba(148,163,184,0.82)"}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1}
            />
          );
        })}

        {top.map((store) => {
          const x = scaleLinear(store.wfhExposure, xBounds, { min: frame.xMin, max: frame.xMax });
          const y = scaleLinear(store.deltaProfitK, yBounds, { min: frame.yMax, max: frame.yMin });
          return (
            <text
              key={`sbux-label-${store.id}`}
              x={x + 8}
              y={y - 8}
              fill="rgba(226,232,240,0.9)"
              fontSize="10.5"
              fontFamily="var(--font-ibm-plex-mono)"
            >
              {store.id}
            </text>
          );
        })}

        <text x={frame.xMin} y={height - 18} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          WFH exposure
        </text>
        <text x={18} y={frame.yMin + 6} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          delta profit
        </text>
      </svg>
    </section>
  );
}

export function EvShellVisual({ payload }: { payload: EvPayload }) {
  const width = 980;
  const height = 420;
  const margin = { left: 64, right: 36, top: 30, bottom: 52 };
  const frame = chartFrame(width, height, margin);

  const xBounds = extent(payload.candidateSites.map((site) => site.capturesFordPct));
  const yBounds = extent(payload.candidateSites.map((site) => site.cannibalizesTeslaUnitsPerMonth));
  const ranked = [...payload.candidateSites].sort((a, b) => b.npvM - a.npvM);
  const best = ranked[0];

  return (
    <section className="panel overflow-hidden p-4 sm:p-5" data-testid="primary-chart">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orange-100/90">
            Capture vs Cannibalization Surface
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            Bubble position maps Ford capture against Tesla cannibalization. Radius encodes site NPV.
          </p>
        </div>
        <div className="metric-strip px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Top Node
          </p>
          <p className="mt-1 font-mono text-xs text-slate-100">{best?.name ?? "n/a"}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full rounded-xl border border-white/10 bg-black/20">
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = frame.yMin + (tick / 4) * (frame.yMax - frame.yMin);
          return (
            <line
              key={`ev-grid-${tick}`}
              x1={frame.xMin}
              x2={frame.xMax}
              y1={y}
              y2={y}
              stroke="rgba(182,169,151,0.14)"
              strokeDasharray="5 8"
            />
          );
        })}
        <line x1={frame.xMin} x2={frame.xMax} y1={frame.yMax} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />
        <line x1={frame.xMin} x2={frame.xMin} y1={frame.yMin} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />

        {payload.candidateSites.map((site) => {
          const x = scaleLinear(site.capturesFordPct, xBounds, { min: frame.xMin, max: frame.xMax });
          const y = scaleLinear(site.cannibalizesTeslaUnitsPerMonth, yBounds, { min: frame.yMax, max: frame.yMin });
          const radius = 8 + Math.min(14, Math.max(0, site.npvM + 5) * 1.5);
          const fill = site.npvM >= 0 ? "rgba(73,95,69,0.86)" : "rgba(157,49,49,0.86)";

          return (
            <circle
              key={site.id}
              cx={x}
              cy={y}
              r={radius}
              fill={fill}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1}
            />
          );
        })}

        <text x={frame.xMin} y={height - 18} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          capture %
        </text>
        <text x={18} y={frame.yMin + 6} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          cannibalization
        </text>
      </svg>
    </section>
  );
}

export function NetflixShellVisual({ payload }: { payload: NetflixPayload }) {
  const width = 980;
  const height = 420;
  const margin = { left: 64, right: 36, top: 30, bottom: 52 };
  const frame = chartFrame(width, height, margin);

  const xBounds = extent(payload.titles.map((title) => title.costM));
  const netLtv = payload.titles.map(
    (title) => title.acquisitionLtvM + title.retentionLtvM - title.costM,
  );
  const yBounds = extent(netLtv);
  const bestIdx = netLtv.reduce((best, value, idx) => (value > netLtv[best] ? idx : best), 0);
  const bestTitle = payload.titles[bestIdx];

  return (
    <section className="panel overflow-hidden p-4 sm:p-5" data-testid="primary-chart">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-100/90">
            Content ROI Matrix
          </p>
          <p className="mt-1 text-sm text-amber-100/74">
            X-axis: content cost. Y-axis: net LTV contribution. Bubble size tracks critical acclaim.
          </p>
        </div>
        <div className="metric-strip px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Best Net Contribution
          </p>
          <p className="mt-1 font-mono text-xs text-slate-100">{bestTitle?.title ?? "n/a"}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full rounded-xl border border-white/10 bg-black/20">
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = frame.yMin + (tick / 4) * (frame.yMax - frame.yMin);
          return (
            <line
              key={`nflx-grid-${tick}`}
              x1={frame.xMin}
              x2={frame.xMax}
              y1={y}
              y2={y}
              stroke="rgba(182,169,151,0.14)"
              strokeDasharray="5 8"
            />
          );
        })}
        <line x1={frame.xMin} x2={frame.xMax} y1={frame.yMax} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />
        <line x1={frame.xMin} x2={frame.xMin} y1={frame.yMin} y2={frame.yMax} stroke="rgba(182,169,151,0.38)" />

        {payload.titles.map((title, idx) => {
          const net = netLtv[idx] ?? 0;
          const x = scaleLinear(title.costM, xBounds, { min: frame.xMin, max: frame.xMax });
          const y = scaleLinear(net, yBounds, { min: frame.yMax, max: frame.yMin });
          const radius = 8 + Math.min(18, title.acclaim * 0.22);
          const fill = net >= 0 ? "rgba(73,95,69,0.84)" : "rgba(157,49,49,0.84)";
          return (
            <circle
              key={title.id}
              cx={x}
              cy={y}
              r={radius}
              fill={fill}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1}
            />
          );
        })}

        <text x={frame.xMin} y={height - 18} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          cost (M)
        </text>
        <text x={18} y={frame.yMin + 6} fill="rgba(182,169,151,0.9)" fontSize="11" fontFamily="var(--font-ibm-plex-mono)">
          net ltv (M)
        </text>
      </svg>
    </section>
  );
}
