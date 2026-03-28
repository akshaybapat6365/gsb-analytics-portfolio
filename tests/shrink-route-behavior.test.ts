import { describe, expect, it } from "vitest";

import { resolveShrinkRouteProbe } from "@/app/projects/target-shrink/recoverability";

describe("Target Shrink route recoverability probe", () => {
  it("accepts only explicit loading and error probe states", () => {
    expect(resolveShrinkRouteProbe("loading")).toBe("loading");
    expect(resolveShrinkRouteProbe("error")).toBe("error");
    expect(resolveShrinkRouteProbe("none")).toBe("none");
    expect(resolveShrinkRouteProbe(undefined)).toBe("none");
    expect(resolveShrinkRouteProbe("unexpected")).toBe("none");
  });

  it("uses the first search-param value when Next supplies arrays", () => {
    expect(resolveShrinkRouteProbe(["loading", "error"])).toBe("loading");
    expect(resolveShrinkRouteProbe(["error"])).toBe("error");
  });
});
