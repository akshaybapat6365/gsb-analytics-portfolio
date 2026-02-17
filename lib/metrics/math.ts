export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function roundTo(value: number, step: number) {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

