"use client";

import { useEffect, useMemo, useState } from "react";
import type { AirlinePayload } from "@/lib/schemas/airline";
import {
  buildBookingCurveForDay,
  buildHeatCells,
  buildNashSeries,
  buildShockEvents,
  derivePolicyDays,
  summarizeRows,
  type PolicyViewMode,
} from "@/components/viz/ord-lga/transforms";

export function useOrdLgaScrollytelling(payload: AirlinePayload) {
  const defaultSelected = Math.max(0, payload.days.findIndex((day) => day.shock > 0));

  const [aggressiveness, setAggressiveness] = useState(64);
  const [competitorReactivity, setCompetitorReactivity] = useState(58);
  const [mode, setMode] = useState<PolicyViewMode>("delta");
  const [shockReplay, setShockReplay] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);

  const rows = useMemo(
    () => derivePolicyDays(payload, aggressiveness, competitorReactivity),
    [aggressiveness, competitorReactivity, payload],
  );
  const summary = useMemo(() => summarizeRows(rows), [rows]);
  const selectedDay = rows[selectedIndex] ?? rows[0];
  const heat = useMemo(() => buildHeatCells(payload, mode), [mode, payload]);
  const shocks = useMemo(() => buildShockEvents(payload, rows), [payload, rows]);
  const bookingCurve = useMemo(
    () => buildBookingCurveForDay(payload, selectedDay),
    [payload, selectedDay],
  );
  const nash = useMemo(
    () => buildNashSeries(payload, aggressiveness, competitorReactivity),
    [aggressiveness, competitorReactivity, payload],
  );

  useEffect(() => {
    if (!shockReplay || shocks.length === 0) return;
    let idx = 0;
    const timer = window.setInterval(() => {
      const next = shocks[idx % shocks.length];
      if (next) setSelectedIndex(next.dayIndex);
      idx += 1;
    }, 1900);
    return () => window.clearInterval(timer);
  }, [shockReplay, shocks]);

  return {
    aggressiveness,
    setAggressiveness,
    competitorReactivity,
    setCompetitorReactivity,
    mode,
    setMode,
    shockReplay,
    setShockReplay,
    selectedIndex,
    setSelectedIndex,
    rows,
    summary,
    selectedDay,
    heat,
    shocks,
    bookingCurve,
    nash,
  };
}
