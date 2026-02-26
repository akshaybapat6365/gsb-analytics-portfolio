import { clamp } from "@/lib/metrics/math";
import type { AirlinePayload } from "@/lib/schemas/airline";

export type PolicyViewMode = "observed" | "counterfactual" | "delta";

export type OrdDerivedDay = {
  index: number;
  date: string;
  dow: string;
  shock: number;
  actualPrice: number;
  algoPrice: number;
  policyPrice: number;
  actualPax: number;
  algoPax: number;
  policyPax: number;
  actualRevenue: number;
  algoRevenue: number;
  policyRevenue: number;
  policyRegret: number;
  competitorPrice: number;
  uaShare: number;
  dlShare: number;
};

export type OrdHeatCell = {
  x: number;
  y: number;
  value: number;
  window: number;
  dow: string;
};

export type OrdShockEvent = {
  date: string;
  dayIndex: number;
  severity: "low" | "med" | "high";
  label: string;
  narrative: string;
  regret: number;
};

export type OrdNashState = {
  dayIndex: number;
  uaPrice: number;
  dlPrice: number;
  uaShare: number;
  dlShare: number;
  regret: number;
};

export type OrdSummary = {
  totalActualRevenue: number;
  totalPolicyRevenue: number;
  totalAlgoRevenue: number;
  incrementalRevenue: number;
  avgShareDelta: number;
  peakRegretDay: OrdDerivedDay;
};

function toWindowProgress(window: number, maxWindow: number) {
  if (maxWindow <= 0) return 1;
  return clamp(1 - window / maxWindow, 0, 1);
}

export function derivePolicyDays(
  payload: AirlinePayload,
  aggressiveness: number,
  competitorReactivity: number,
) {
  const t = clamp(aggressiveness / 100, 0, 1);
  const c = clamp(competitorReactivity / 100, 0, 1);
  const elasticity = -1.22;

  const rows: OrdDerivedDay[] = payload.days.map((day, index) => {
    const actualPrice = day.actual.price;
    const algoPrice = day.algo.price;

    const policyPrice = actualPrice + t * (algoPrice - actualPrice);
    const policyPaxBase = day.algo.pax * Math.pow(policyPrice / Math.max(1, algoPrice), elasticity);

    const competitorBase = actualPrice + 5.5 - day.shock * 3.8;
    const competitorPrice = clamp(
      competitorBase + c * (policyPrice - actualPrice) * 0.62,
      198,
      360,
    );

    const uaShare = clamp(
      0.49 + (competitorPrice - policyPrice) / 215 + day.shock * 0.03,
      0.2,
      0.82,
    );
    const dlShare = clamp(1 - uaShare, 0.18, 0.8);
    const shareAdjustedPax = Math.max(0, policyPaxBase * (0.72 + uaShare * 0.58));
    const policyRevenue = policyPrice * shareAdjustedPax;

    return {
      index,
      date: day.date,
      dow: day.dow,
      shock: day.shock,
      actualPrice,
      algoPrice,
      policyPrice,
      actualPax: day.actual.pax,
      algoPax: day.algo.pax,
      policyPax: shareAdjustedPax,
      actualRevenue: day.actual.revenue,
      algoRevenue: day.algo.revenue,
      policyRevenue,
      policyRegret: policyRevenue - day.actual.revenue,
      competitorPrice,
      uaShare,
      dlShare,
    };
  });

  return rows;
}

export function summarizeRows(rows: OrdDerivedDay[]): OrdSummary {
  const totalActualRevenue = rows.reduce((acc, row) => acc + row.actualRevenue, 0);
  const totalPolicyRevenue = rows.reduce((acc, row) => acc + row.policyRevenue, 0);
  const totalAlgoRevenue = rows.reduce((acc, row) => acc + row.algoRevenue, 0);
  const avgShareDelta =
    rows.reduce((acc, row) => acc + (row.uaShare - 0.5), 0) / Math.max(1, rows.length);
  const peakRegretDay = rows.reduce((best, row) =>
    row.policyRegret > best.policyRegret ? row : best,
  );

  return {
    totalActualRevenue,
    totalPolicyRevenue,
    totalAlgoRevenue,
    incrementalRevenue: totalPolicyRevenue - totalActualRevenue,
    avgShareDelta,
    peakRegretDay,
  };
}

export function buildHeatCells(
  payload: AirlinePayload,
  mode: PolicyViewMode,
): {
  bookingWindows: number[];
  dows: string[];
  cells: OrdHeatCell[];
  min: number;
  max: number;
} {
  const matrix =
    mode === "observed"
      ? payload.heatmap.actual
      : mode === "counterfactual"
        ? payload.heatmap.algo
        : payload.heatmap.algo.map((row, y) =>
          row.map((value, x) => value - payload.heatmap.actual[y]![x]!),
        );

  const cells: OrdHeatCell[] = [];
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y]!.length; x++) {
      cells.push({
        x,
        y,
        value: matrix[y]![x]!,
        window: payload.heatmap.bookingWindows[x]!,
        dow: payload.heatmap.dows[y]!,
      });
    }
  }

  const values = cells.map((cell) => cell.value);
  return {
    bookingWindows: payload.heatmap.bookingWindows,
    dows: payload.heatmap.dows,
    cells,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function buildBookingCurveForDay(
  payload: AirlinePayload,
  row: OrdDerivedDay,
): Array<{ window: number; actual: number; counterfactual: number }> {
  if (payload.bookingCurve?.length) {
    const filtered = payload.bookingCurve
      .filter((point) => point.date === row.date)
      .sort((a, b) => b.window - a.window)
      .map((point) => ({
        window: point.window,
        actual: point.actualBookings,
        counterfactual: point.algoBookings,
      }));
    if (filtered.length) {
      return filtered;
    }
  }

  const windows = [...payload.heatmap.bookingWindows].sort((a, b) => b - a);
  const maxWindow = Math.max(...windows, 1);
  return windows.map((window) => {
    const progress = toWindowProgress(window, maxWindow);
    return {
      window,
      actual: row.actualPax * (0.18 + 0.82 * progress ** 0.72),
      counterfactual: row.policyPax * (0.16 + 0.84 * progress ** 0.7),
    };
  });
}

export function buildShockEvents(
  payload: AirlinePayload,
  rows: OrdDerivedDay[],
): OrdShockEvent[] {
  if (payload.shockEvents?.length) {
    return payload.shockEvents
      .map((event) => {
        const dayIndex = rows.findIndex((row) => row.date === event.date);
        const fallback = rows[Math.max(0, dayIndex)] ?? rows[0];
        return {
          date: event.date,
          dayIndex: Math.max(dayIndex, 0),
          severity: event.severity,
          label: event.label,
          narrative: event.narrative,
          regret: fallback.policyRegret,
        };
      })
      .sort((a, b) => a.dayIndex - b.dayIndex);
  }

  return rows
    .filter((row) => row.shock > 0)
    .map((row) => ({
      date: row.date,
      dayIndex: row.index,
      severity: row.shock >= 1 ? "high" : "med",
      label: "Demand anomaly",
      narrative:
        row.shock >= 1
          ? "Major demand shock detected; competitor response lag amplifies regret."
          : "Moderate demand shock; the pricing desk underreacted against competitor movement.",
      regret: row.policyRegret,
    }));
}

export function buildNashSeries(
  payload: AirlinePayload,
  aggressiveness: number,
  competitorReactivity: number,
): { states: OrdNashState[]; convergenceDay: number } {
  const t = clamp(aggressiveness / 100, 0, 1);
  const c = clamp(competitorReactivity / 100, 0, 1);

  if (payload.nashSim?.states?.length) {
    const states = payload.nashSim.states.map((state, index) => {
      const uaPrice = clamp(state.uaPrice + (t - 0.5) * 18 + index * 0.15, 198, 360);
      const dlPrice = clamp(state.dlPrice + (c - 0.5) * 16 + index * 0.12, 198, 365);
      const uaShare = clamp(state.uaShare + (dlPrice - uaPrice) / 420, 0.2, 0.82);
      return {
        dayIndex: state.dayIndex,
        uaPrice,
        dlPrice,
        uaShare,
        dlShare: 1 - uaShare,
        regret: Math.max(0, state.regret + (1 - t) * 110 - c * 40),
      };
    });

    let convergenceDay = payload.nashSim.convergenceDay;
    for (const state of states) {
      if (Math.abs(state.uaPrice - state.dlPrice) <= 1.75) {
        convergenceDay = state.dayIndex;
        break;
      }
    }

    return { states, convergenceDay };
  }

  const states: OrdNashState[] = [];
  let uaPrice = 284;
  let dlPrice = 290;
  for (let day = 1; day <= 18; day++) {
    uaPrice = clamp(0.6 * uaPrice + 0.4 * (245 + 0.45 * dlPrice + t * 9), 200, 360);
    dlPrice = clamp(0.62 * dlPrice + 0.38 * (246 + 0.44 * uaPrice + c * 10), 200, 360);
    const uaShare = clamp(0.5 + (dlPrice - uaPrice) / 220, 0.2, 0.82);
    states.push({
      dayIndex: day,
      uaPrice,
      dlPrice,
      uaShare,
      dlShare: 1 - uaShare,
      regret: Math.max(0, (uaPrice - 250) * (1 - uaShare) * 2.8),
    });
  }

  return { states, convergenceDay: 18 };
}

// ──────────────────────────────────────────────────────────────
// Phase 1: New types & transforms for 100× overhaul
// ──────────────────────────────────────────────────────────────

// Step 1: Daily P&L decomposition
export type DailyPnLRow = {
  date: string;
  dayIndex: number;
  baseRevenue: number;
  algorithmicUplift: number;
  competitorCapture: number;
  shockLoss: number;
  netLift: number;
  cumulative: number;
};

// Step 2: buildDailyPnL
export function buildDailyPnL(rows: OrdDerivedDay[]): DailyPnLRow[] {
  let cumulative = 0;
  return rows.map((row) => {
    const totalDelta = row.policyRevenue - row.actualRevenue;
    // Decompose: algo uplift is the idealized gain, competitor capture is share-adjusted loss,
    // shock loss is the shock-weighted penalty
    const idealUplift = row.algoRevenue - row.actualRevenue;
    const shareAdjustment = (row.uaShare - 0.5) * row.policyPrice * row.policyPax * 0.15;
    const shockPenalty = row.shock > 0 ? row.shock * Math.abs(totalDelta) * 0.25 : 0;
    const competitorEffect = totalDelta - idealUplift + shareAdjustment + shockPenalty;

    const algorithmicUplift = Math.max(0, idealUplift);
    const competitorCapture = Math.min(0, competitorEffect);
    const shockLoss = -shockPenalty;
    const netLift = totalDelta;
    cumulative += netLift;

    return {
      date: row.date,
      dayIndex: row.index,
      baseRevenue: row.actualRevenue,
      algorithmicUplift,
      competitorCapture,
      shockLoss,
      netLift,
      cumulative,
    };
  });
}

// Step 3 & 4: Fare distribution (KDE)
export type FareDistPoint = {
  price: number;
  density: number;
};

export type FareDistByDow = {
  dow: string;
  actual: FareDistPoint[];
  policy: FareDistPoint[];
  actualMean: number;
  policyMean: number;
};

function gaussianKDE(
  values: number[],
  bandwidth: number,
  gridMin: number,
  gridMax: number,
  nPoints: number,
): FareDistPoint[] {
  const step = (gridMax - gridMin) / (nPoints - 1);
  return Array.from({ length: nPoints }, (_, i) => {
    const x = gridMin + i * step;
    let density = 0;
    for (const v of values) {
      const z = (x - v) / bandwidth;
      density += Math.exp(-0.5 * z * z) / (bandwidth * Math.sqrt(2 * Math.PI));
    }
    density /= Math.max(1, values.length);
    return { price: x, density };
  });
}

export function buildFareDistribution(rows: OrdDerivedDay[]): FareDistByDow[] {
  const dowOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const grouped = new Map<string, OrdDerivedDay[]>();
  for (const row of rows) {
    const arr = grouped.get(row.dow) ?? [];
    arr.push(row);
    grouped.set(row.dow, arr);
  }

  const allPrices = rows.flatMap((r) => [r.actualPrice, r.policyPrice]);
  const gridMin = Math.min(...allPrices) - 20;
  const gridMax = Math.max(...allPrices) + 20;
  const bandwidth = (gridMax - gridMin) / 12;

  return dowOrder
    .filter((dow) => grouped.has(dow))
    .map((dow) => {
      const dayRows = grouped.get(dow)!;
      const actualPrices = dayRows.map((r) => r.actualPrice);
      const policyPrices = dayRows.map((r) => r.policyPrice);
      return {
        dow,
        actual: gaussianKDE(actualPrices, bandwidth, gridMin, gridMax, 50),
        policy: gaussianKDE(policyPrices, bandwidth, gridMin, gridMax, 50),
        actualMean:
          actualPrices.reduce((a, b) => a + b, 0) / Math.max(1, actualPrices.length),
        policyMean:
          policyPrices.reduce((a, b) => a + b, 0) / Math.max(1, policyPrices.length),
      };
    });
}

// Step 5 & 6: Cumulative regret with CI
export type CumulativeRegretPoint = {
  dayIndex: number;
  date: string;
  dailyRegret: number;
  cumRegret: number;
  ciLow: number;
  ciHigh: number;
  hasShock: boolean;
};

export function buildCumulativeRegret(
  rows: OrdDerivedDay[],
  uncertainty?: { revenueLiftCi: [number, number] },
): CumulativeRegretPoint[] {
  const totalRegret = rows.reduce((acc, r) => acc + r.policyRegret, 0);
  const ciSpread = uncertainty
    ? (uncertainty.revenueLiftCi[1] - uncertainty.revenueLiftCi[0]) / 2
    : totalRegret * 0.15;
  const spreadPerDay = ciSpread / Math.max(1, Math.sqrt(rows.length));

  let cumRegret = 0;
  return rows.map((row) => {
    cumRegret += row.policyRegret;
    const dayFrac = (row.index + 1) / rows.length;
    const ciWidth = spreadPerDay * Math.sqrt(row.index + 1);
    return {
      dayIndex: row.index,
      date: row.date,
      dailyRegret: row.policyRegret,
      cumRegret,
      ciLow: cumRegret - ciWidth,
      ciHigh: cumRegret + ciWidth,
      hasShock: row.shock > 0,
    };
  });
}

// Step 7 & 8: Competitor response lag
export type CompetitorLagPoint = {
  dayIndex: number;
  date: string;
  uaPriceChange: number;
  dlResponseDays: number;
  dlPriceChange: number;
  uaPrice: number;
  dlPrice: number;
};

export function buildCompetitorLagSeries(rows: OrdDerivedDay[]): CompetitorLagPoint[] {
  const result: CompetitorLagPoint[] = [];
  // Non-linear decay constant: competitor response intensity decays exponentially
  // λ=0.4 means ~67% of response occurs within first 2 days
  const DECAY_LAMBDA = 0.4;
  const MIN_PRICE_MOVE = 3;
  const MAX_LAG_WINDOW = 6;

  for (let i = 1; i < rows.length; i++) {
    const uaChange = rows[i]!.policyPrice - rows[i - 1]!.policyPrice;
    if (Math.abs(uaChange) < MIN_PRICE_MOVE) continue;

    const direction = uaChange > 0 ? 1 : -1;
    let lagDays = MAX_LAG_WINDOW; // default "no response"
    let dlChange = 0;

    // Scan forward for competitor response with non-linear decay weighting
    let bestDecayScore = 0;
    for (let j = i + 1; j < Math.min(i + MAX_LAG_WINDOW, rows.length); j++) {
      const dChange = rows[j]!.competitorPrice - rows[j - 1]!.competitorPrice;
      const lag = j - i;
      // Exponential decay: response impact = |dChange| * exp(-λ * lag)
      const decayWeight = Math.exp(-DECAY_LAMBDA * lag);
      const decayScore = Math.abs(dChange) * decayWeight;

      if (dChange * direction > 2 && decayScore > bestDecayScore) {
        bestDecayScore = decayScore;
        lagDays = lag;
        // Apply decay to the effective price change (non-linear dampening)
        dlChange = dChange * decayWeight;
        break;
      }
    }

    result.push({
      dayIndex: rows[i]!.index,
      date: rows[i]!.date,
      uaPriceChange: uaChange,
      dlResponseDays: lagDays,
      dlPriceChange: parseFloat(dlChange.toFixed(2)),
      uaPrice: rows[i]!.policyPrice,
      dlPrice: rows[i]!.competitorPrice,
    });
  }
  return result;
}

// Step 9 & 10: Validation comparison
export type ValidationBar = {
  model: string;
  metric: string;
  value: number;
  isBest: boolean;
};

export type ValidationComparison = {
  bars: ValidationBar[];
  trainDays: number;
  valDays: number;
  trainStart: string;
  trainEnd: string;
  valStart: string;
  valEnd: string;
  oosLiftStatic: number;
  oosLiftSticky: number;
};

export function buildValidationComparison(
  payload: AirlinePayload,
): ValidationComparison | null {
  const vs = payload.validationSummary;
  if (!vs) return null;

  const models = ["Static Baseline", "Sticky Baseline", "Policy Model"] as const;
  const metricKeys = ["maeRevenue", "mapeRevenue", "meanRegret"] as const;
  const metricLabels = ["MAE Revenue", "MAPE Revenue", "Mean Regret"];
  const sources = [vs.metrics.staticBaseline, vs.metrics.stickyBaseline, vs.metrics.policyModel];

  const bars: ValidationBar[] = [];
  for (let m = 0; m < metricKeys.length; m++) {
    const key = metricKeys[m]!;
    const values = sources.map((s) => Math.abs(s[key]));
    const bestIdx = values.indexOf(Math.min(...values));
    for (let i = 0; i < models.length; i++) {
      bars.push({
        model: models[i]!,
        metric: metricLabels[m]!,
        value: sources[i]![key],
        isBest: i === bestIdx,
      });
    }
  }

  return {
    bars,
    trainDays: vs.trainWindow.count,
    valDays: vs.validationWindow.count,
    trainStart: vs.trainWindow.start ?? "",
    trainEnd: vs.trainWindow.end ?? "",
    valStart: vs.validationWindow.start ?? "",
    valEnd: vs.validationWindow.end ?? "",
    oosLiftStatic: vs.oosLiftDeltaVsStatic,
    oosLiftSticky: vs.oosLiftDeltaVsSticky,
  };
}

// Step 11 & 12: Narrative timeline
export type NarrativeNode = {
  date: string;
  dayIndex: number;
  type: "narrative" | "shock" | "annotation";
  title: string;
  body: string;
  metric?: number;
  severity?: "low" | "med" | "high";
};

export function buildNarrativeTimeline(
  payload: AirlinePayload,
  rows: OrdDerivedDay[],
): NarrativeNode[] {
  const nodes: NarrativeNode[] = [];
  const findDay = (date: string) => rows.findIndex((r) => r.date === date);

  // Narrative entries
  for (const n of payload.narrative) {
    const idx = findDay(n.date);
    nodes.push({
      date: n.date,
      dayIndex: Math.max(0, idx),
      type: "narrative",
      title: `Policy: $${n.recommendedPrice} vs Actual: $${n.actualPrice}`,
      body: n.reason,
      metric: n.incrementalRevenue,
    });
  }

  // Shock events
  for (const s of payload.shockEvents ?? []) {
    const idx = findDay(s.date);
    const row = rows[Math.max(0, idx)] ?? rows[0];
    nodes.push({
      date: s.date,
      dayIndex: Math.max(0, idx),
      type: "shock",
      title: s.label,
      body: s.narrative,
      metric: row?.policyRegret,
      severity: s.severity,
    });
  }

  // Annotations
  for (const a of payload.annotations ?? []) {
    const idx = findDay(a.timestampOrIndex);
    nodes.push({
      date: a.timestampOrIndex,
      dayIndex: Math.max(0, idx),
      type: "annotation",
      title: a.title,
      body: a.body,
    });
  }

  return nodes.sort((a, b) => a.dayIndex - b.dayIndex);
}

// Step 13 & 14: Weekly rollup
export type WeeklyBin = {
  weekIndex: number;
  weekStart: string;
  weekEnd: string;
  avgActualPrice: number;
  avgPolicyPrice: number;
  avgCompetitorPrice: number;
  totalRevenue: number;
  totalPolicyRevenue: number;
  avgRegret: number;
  avgUaShare: number;
  shockCount: number;
  dayCount: number;
};

export function buildWeeklyRollup(rows: OrdDerivedDay[]): WeeklyBin[] {
  const bins: WeeklyBin[] = [];
  for (let i = 0; i < rows.length; i += 7) {
    const chunk = rows.slice(i, i + 7);
    const n = chunk.length;
    bins.push({
      weekIndex: Math.floor(i / 7),
      weekStart: chunk[0]!.date,
      weekEnd: chunk[n - 1]!.date,
      avgActualPrice: chunk.reduce((a, r) => a + r.actualPrice, 0) / n,
      avgPolicyPrice: chunk.reduce((a, r) => a + r.policyPrice, 0) / n,
      avgCompetitorPrice: chunk.reduce((a, r) => a + r.competitorPrice, 0) / n,
      totalRevenue: chunk.reduce((a, r) => a + r.actualRevenue, 0),
      totalPolicyRevenue: chunk.reduce((a, r) => a + r.policyRevenue, 0),
      avgRegret: chunk.reduce((a, r) => a + r.policyRegret, 0) / n,
      avgUaShare: chunk.reduce((a, r) => a + r.uaShare, 0) / n,
      shockCount: chunk.filter((r) => r.shock > 0).length,
      dayCount: n,
    });
  }
  return bins;
}

// Step 15: Price spread series (for sparklines)
export type PriceSpreadPoint = {
  dayIndex: number;
  spread: number;
  spreadPct: number;
};

export function buildPriceSpreadSeries(rows: OrdDerivedDay[]): PriceSpreadPoint[] {
  return rows.map((row) => ({
    dayIndex: row.index,
    spread: row.competitorPrice - row.policyPrice,
    spreadPct: (row.competitorPrice - row.policyPrice) / Math.max(1, row.policyPrice),
  }));
}

// Step 16: Share oscillation series (for sparklines)
export type SharePoint = {
  dayIndex: number;
  uaShare: number;
  dlShare: number;
  delta: number;
};

export function buildShareOscillation(rows: OrdDerivedDay[]): SharePoint[] {
  return rows.map((row) => ({
    dayIndex: row.index,
    uaShare: row.uaShare,
    dlShare: row.dlShare,
    delta: row.uaShare - row.dlShare,
  }));
}

// ──────────────────────────────────────────────────────────────
// Monte Carlo: 50K-point fare distribution via bootstrap resampling
// ──────────────────────────────────────────────────────────────

export type MonteCarloResult = {
  samples: number;
  fareDistributions: number[];
  revenueDistributions: number[];
  regretDistributions: number[];
  fareMean: number;
  fareStd: number;
  revenueMean: number;
  revenueStd: number;
  ci95: [number, number];
};

/** Seeded PRNG for reproducible Monte Carlo (xoshiro128**) */
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildMonteCarloDistribution(
  rows: OrdDerivedDay[],
  nSamples = 50000,
  seed = 42,
): MonteCarloResult {
  const rng = mulberry32(seed);
  const prices = rows.map(r => r.policyPrice);
  const revenues = rows.map(r => r.policyRevenue);
  const regrets = rows.map(r => r.policyRegret);
  const n = prices.length;

  const fareDist: number[] = new Array(nSamples);
  const revDist: number[] = new Array(nSamples);
  const regDist: number[] = new Array(nSamples);

  // Bootstrap resampling with log-normal noise perturbation
  for (let i = 0; i < nSamples; i++) {
    const idx = Math.floor(rng() * n);
    // Add small log-normal perturbation for continuous distribution
    const noise = Math.exp((rng() - 0.5) * 0.1);
    fareDist[i] = prices[idx]! * noise;
    revDist[i] = revenues[idx]! * noise;
    regDist[i] = regrets[idx]! * (1 + (rng() - 0.5) * 0.15);
  }

  // Sort for percentile computation
  const sortedFares = [...fareDist].sort((a, b) => a - b);
  const fareMean = sortedFares.reduce((s, v) => s + v, 0) / nSamples;
  const fareStd = Math.sqrt(sortedFares.reduce((s, v) => s + (v - fareMean) ** 2, 0) / nSamples);
  const revMean = revDist.reduce((s, v) => s + v, 0) / nSamples;
  const revStd = Math.sqrt(revDist.reduce((s, v) => s + (v - revMean) ** 2, 0) / nSamples);

  return {
    samples: nSamples,
    fareDistributions: fareDist,
    revenueDistributions: revDist,
    regretDistributions: regDist,
    fareMean,
    fareStd,
    revenueMean: revMean,
    revenueStd: revStd,
    ci95: [sortedFares[Math.floor(nSamples * 0.025)]!, sortedFares[Math.floor(nSamples * 0.975)]!],
  };
}

// ──────────────────────────────────────────────────────────────
// Non-linear competitor response decay model
// ──────────────────────────────────────────────────────────────

export type DecayModelParams = {
  lambda: number;       // exponential decay rate
  halfLife: number;     // half-life in days
  r2: number;           // fit quality
  residuals: number[];  // per-observation residuals
};

export type EnrichedLagPoint = CompetitorLagPoint & {
  decayPrediction: number;  // predicted response magnitude from decay model
  decayResidual: number;    // actual - predicted
  decayWeight: number;      // exp(-lambda * lag)
};

/**
 * Fit exponential decay model to competitor response data:
 *   response_magnitude = A * exp(-lambda * lag_days)
 * Uses least-squares via log-linearization.
 */
export function fitNonLinearDecay(lagData: CompetitorLagPoint[]): DecayModelParams {
  const withResponse = lagData.filter(d => d.dlResponseDays < 6 && Math.abs(d.dlPriceChange) > 0);

  if (withResponse.length < 3) {
    return { lambda: 0.5, halfLife: 1.39, r2: 0, residuals: [] };
  }

  // Log-linearize: ln(|response|) = ln(A) - lambda * lag
  const logResponses = withResponse.map(d => Math.log(Math.abs(d.dlPriceChange)));
  const lags = withResponse.map(d => d.dlResponseDays);
  const n = withResponse.length;

  const meanX = lags.reduce((s, v) => s + v, 0) / n;
  const meanY = logResponses.reduce((s, v) => s + v, 0) / n;

  let numerator = 0, denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (lags[i]! - meanX) * (logResponses[i]! - meanY);
    denominator += (lags[i]! - meanX) ** 2;
  }

  const lambda = denominator !== 0 ? -numerator / denominator : 0.5;
  const halfLife = Math.LN2 / Math.max(lambda, 0.01);
  const lnA = meanY + lambda * meanX;
  const A = Math.exp(lnA);

  // Compute R² and residuals
  const residuals = withResponse.map(d => {
    const predicted = A * Math.exp(-lambda * d.dlResponseDays);
    return Math.abs(d.dlPriceChange) - predicted;
  });

  const ssRes = residuals.reduce((s, r) => s + r * r, 0);
  const ssTot = logResponses.reduce((s, v) => s + (v - meanY) ** 2, 0);
  const r2 = ssTot > 0 ? 1 - ssRes / (ssTot * A * A) : 0;

  return { lambda: clamp(lambda, 0.01, 5), halfLife, r2: clamp(r2, 0, 1), residuals };
}

/**
 * Enrich lag data with non-linear decay predictions.
 */
export function enrichCompetitorLagWithDecay(
  lagData: CompetitorLagPoint[],
): EnrichedLagPoint[] {
  const decay = fitNonLinearDecay(lagData);
  const A = lagData.length > 0
    ? lagData.reduce((s, d) => s + Math.abs(d.dlPriceChange), 0) / lagData.length
    : 10;

  return lagData.map(d => {
    const weight = Math.exp(-decay.lambda * d.dlResponseDays);
    const prediction = A * weight;
    return {
      ...d,
      decayPrediction: prediction,
      decayResidual: Math.abs(d.dlPriceChange) - prediction,
      decayWeight: weight,
    };
  });
}

// ──────────────────────────────────────────────────────────────
// Weather impact correlation
// ──────────────────────────────────────────────────────────────

export type WeatherImpactPoint = {
  dayIndex: number;
  date: string;
  severity: number;
  fareDeviation: number;    // how much actual fare deviated from trend
  revenueImpact: number;    // estimated revenue impact of weather
  event?: string;
};

export function buildWeatherImpact(
  rows: OrdDerivedDay[],
  weatherShocks: Array<{ date: string; severity: number; event?: string }>,
): WeatherImpactPoint[] {
  if (!weatherShocks?.length || !rows?.length) return [];

  // Build a rolling 7-day average as "trend"
  const trendPrices: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const start = Math.max(0, i - 3);
    const end = Math.min(rows.length - 1, i + 3);
    let sum = 0, count = 0;
    for (let j = start; j <= end; j++) {
      sum += rows[j]!.policyPrice;
      count++;
    }
    trendPrices.push(sum / count);
  }

  const dateMap = new Map(rows.map((r, i) => [r.date, i]));

  const results: WeatherImpactPoint[] = [];
  for (const shock of weatherShocks) {
    const idx = dateMap.get(shock.date);
    if (idx === undefined) continue;
    const row = rows[idx]!;
    const trend = trendPrices[idx]!;
    const fareDeviation = row.policyPrice - trend;
    const revenueImpact = fareDeviation * row.policyPax;
    results.push({
      dayIndex: row.index,
      date: shock.date,
      severity: shock.severity,
      fareDeviation,
      revenueImpact,
      event: shock.event,
    });
  }
  return results;
}
