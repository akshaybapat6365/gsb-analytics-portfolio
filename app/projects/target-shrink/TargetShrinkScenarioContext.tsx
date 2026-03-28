"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ShrinkPayload } from "@/lib/schemas/shrink";
import { buildShrinkRecommendationSurfaceModel } from "@/lib/viewmodels/shrink";
import {
  buildShrinkEventRef,
  deriveShrinkScenario,
  type ShrinkEventRef,
} from "@/lib/viewmodels/shrinkScenario";

type TargetShrinkScenarioContextValue = {
  payload: ShrinkPayload;
  threshold: number;
  setThreshold: (value: number) => void;
  falsePositiveMultiplier: number;
  setFalsePositiveMultiplier: (value: number) => void;
  selectedZone: string;
  setSelectedZone: (value: string) => void;
  selectedEventRef: ShrinkEventRef | null;
  setSelectedEventRef: (value: ShrinkEventRef | null) => void;
  derived: ReturnType<typeof deriveShrinkScenario>;
  recommendationSurface: ReturnType<typeof buildShrinkRecommendationSurfaceModel>;
};

const TargetShrinkScenarioContext = createContext<TargetShrinkScenarioContextValue | null>(null);

const DEFAULT_THRESHOLD = 0.85;
const DEFAULT_FALSE_POSITIVE_MULTIPLIER = 100;

export function TargetShrinkScenarioProvider({
  payload,
  children,
}: {
  payload: ShrinkPayload;
  children: React.ReactNode;
}) {
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [falsePositiveMultiplier, setFalsePositiveMultiplier] = useState(DEFAULT_FALSE_POSITIVE_MULTIPLIER);
  const [selectedZone, setSelectedZone] = useState<string>(payload.store.zones[0]?.id ?? "");
  const [selectedEventRef, setSelectedEventRef] = useState<ShrinkEventRef | null>(() => {
    const firstEvent = payload.events[0];
    return firstEvent ? buildShrinkEventRef(firstEvent, 0) : null;
  });

  const derived = useMemo(
    () => deriveShrinkScenario(payload, threshold, falsePositiveMultiplier, selectedZone, selectedEventRef),
    [payload, threshold, falsePositiveMultiplier, selectedZone, selectedEventRef],
  );

  const baselineRecommendedThreshold = useMemo(
    () =>
      deriveShrinkScenario(
        payload,
        DEFAULT_THRESHOLD,
        DEFAULT_FALSE_POSITIVE_MULTIPLIER,
        payload.store.zones[0]?.id,
      ).recommended.threshold,
    [payload],
  );

  const recommendationSurface = useMemo(
    () =>
      buildShrinkRecommendationSurfaceModel({
        currentThreshold: derived.point.threshold,
        falsePositiveMultiplier,
        recommendedThreshold: derived.recommended.threshold,
        recommendedNetValue: derived.recommended.recoveredNet,
        currentNetValue: derived.expectedNetValue,
        baselineRecommendedThreshold,
      }),
    [baselineRecommendedThreshold, derived.expectedNetValue, derived.point.threshold, derived.recommended.recoveredNet, derived.recommended.threshold, falsePositiveMultiplier],
  );

  return (
    <TargetShrinkScenarioContext.Provider
      value={{
        payload,
        threshold,
        setThreshold,
        falsePositiveMultiplier,
        setFalsePositiveMultiplier,
        selectedZone,
        setSelectedZone,
        selectedEventRef,
        setSelectedEventRef,
        derived,
        recommendationSurface,
      }}
    >
      {children}
    </TargetShrinkScenarioContext.Provider>
  );
}

export function useTargetShrinkScenario() {
  const context = useContext(TargetShrinkScenarioContext);

  if (!context) {
    throw new Error("useTargetShrinkScenario must be used within TargetShrinkScenarioProvider");
  }

  return context;
}
