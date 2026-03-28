import { describe, expect, it } from "vitest";

import { resolveOrdLgaRouteProbe } from "@/app/projects/ord-lga-price-war/recoverability";

describe("ORD-LGA route recoverability probe", () => {
  it("accepts only explicit loading and error probe states", () => {
    expect(resolveOrdLgaRouteProbe("loading")).toBe("loading");
    expect(resolveOrdLgaRouteProbe("error")).toBe("error");
    expect(resolveOrdLgaRouteProbe("none")).toBe("none");
    expect(resolveOrdLgaRouteProbe(undefined)).toBe("none");
    expect(resolveOrdLgaRouteProbe("unexpected")).toBe("none");
  });

  it("uses the first search-param value when Next supplies arrays", () => {
    expect(resolveOrdLgaRouteProbe(["loading", "error"])).toBe("loading");
    expect(resolveOrdLgaRouteProbe(["error"])).toBe("error");
  });
});
