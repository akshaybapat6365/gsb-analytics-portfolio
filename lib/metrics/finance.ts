import { clamp } from "./math";

export function roi(gain: number, cost: number) {
  if (cost === 0) return 0;
  return (gain - cost) / Math.abs(cost);
}

export function npv(cashflows: number[], discountRate: number) {
  const r = clamp(discountRate, -0.99, 10);
  return cashflows.reduce((acc, cf, idx) => acc + cf / Math.pow(1 + r, idx), 0);
}

