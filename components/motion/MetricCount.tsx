"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

type MetricCountProps = {
  value: number;
  durationMs?: number;
  pad?: number;
};

function easeOutExpo(t: number): number {
  if (t >= 1) return 1;
  return 1 - 2 ** (-10 * t);
}

export function MetricCount({
  value,
  durationMs = 1200,
  pad,
}: MetricCountProps) {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutExpo(progress);
      const nextValue = value * eased;
      setDisplayValue(nextValue);
      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [durationMs, reducedMotion, value]);

  const rendered = useMemo(() => {
    const formatValue = (num: number) =>
      typeof pad === "number" ? String(num).padStart(pad, "0") : String(num);

    if (reducedMotion) {
      const roundedValue = Math.round(value);
      return formatValue(roundedValue);
    }

    const rounded = Math.round(displayValue);
    return formatValue(rounded);
  }, [displayValue, pad, reducedMotion, value]);

  return <>{rendered}</>;
}
