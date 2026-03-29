import { describe, expect, it } from "vitest";

import { resolveEvRouteProbe } from "@/app/projects/tesla-nacs/recoverability";

describe("Tesla NACS route recoverability probe", () => {
  it("accepts only explicit loading and error probe states", () => {
    expect(resolveEvRouteProbe("loading")).toBe("loading");
    expect(resolveEvRouteProbe("error")).toBe("error");
    expect(resolveEvRouteProbe("none")).toBe("none");
    expect(resolveEvRouteProbe(undefined)).toBe("none");
    expect(resolveEvRouteProbe("unexpected")).toBe("none");
  });

  it("uses the first search-param value when Next supplies arrays", () => {
    expect(resolveEvRouteProbe(["loading", "error"])).toBe("loading");
    expect(resolveEvRouteProbe(["error"])).toBe("error");
  });
});
