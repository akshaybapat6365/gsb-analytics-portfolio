import { describe, expect, it } from "vitest";
import { roi, npv } from "@/lib/metrics/finance";

describe("finance metrics", () => {
  it("roi computes gain vs cost", () => {
    expect(roi(120, 100)).toBeCloseTo(0.2);
    expect(roi(80, 100)).toBeCloseTo(-0.2);
  });

  it("npv discounts cashflows", () => {
    const value = npv([-100, 60, 60], 0.1);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(20);
  });
});

