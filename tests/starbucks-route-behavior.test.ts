import { describe, expect, it } from "vitest";

import { resolveStarbucksRouteProbe } from "@/app/projects/starbucks-pivot/recoverability";

describe("Starbucks route recoverability probe", () => {
  it("accepts only explicit loading and error probe states", () => {
    expect(resolveStarbucksRouteProbe("loading")).toBe("loading");
    expect(resolveStarbucksRouteProbe("error")).toBe("error");
    expect(resolveStarbucksRouteProbe("none")).toBe("none");
    expect(resolveStarbucksRouteProbe(undefined)).toBe("none");
    expect(resolveStarbucksRouteProbe("unexpected")).toBe("none");
  });

  it("uses the first search-param value when Next supplies arrays", () => {
    expect(resolveStarbucksRouteProbe(["loading", "error"])).toBe("loading");
    expect(resolveStarbucksRouteProbe(["error"])).toBe("error");
  });
});
