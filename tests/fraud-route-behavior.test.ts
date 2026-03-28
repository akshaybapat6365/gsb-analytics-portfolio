import { describe, expect, it } from "vitest";

import { resolveFraudRouteProbe } from "@/app/projects/fraud-radar/recoverability";

describe("Fraud Radar route recoverability probe", () => {
  it("accepts only explicit loading and error probe states", () => {
    expect(resolveFraudRouteProbe("loading")).toBe("loading");
    expect(resolveFraudRouteProbe("error")).toBe("error");
    expect(resolveFraudRouteProbe("none")).toBe("none");
    expect(resolveFraudRouteProbe(undefined)).toBe("none");
    expect(resolveFraudRouteProbe("unexpected")).toBe("none");
  });

  it("uses the first search-param value when Next supplies arrays", () => {
    expect(resolveFraudRouteProbe(["loading", "error"])).toBe("loading");
    expect(resolveFraudRouteProbe(["error"])).toBe("error");
  });
});
