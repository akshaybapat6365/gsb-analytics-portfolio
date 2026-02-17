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
