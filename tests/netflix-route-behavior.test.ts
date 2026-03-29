import { describe, expect, it } from "vitest";

import { resolveNetflixRouteProbe } from "@/app/projects/netflix-roi/recoverability";

describe("Netflix route recoverability probe", () => {
  it("accepts only explicit loading and error probe states", () => {
    expect(resolveNetflixRouteProbe("loading")).toBe("loading");
    expect(resolveNetflixRouteProbe("error")).toBe("error");
    expect(resolveNetflixRouteProbe("none")).toBe("none");
    expect(resolveNetflixRouteProbe(undefined)).toBe("none");
    expect(resolveNetflixRouteProbe("unexpected")).toBe("none");
  });

  it("uses the first search-param value when Next supplies arrays", () => {
    expect(resolveNetflixRouteProbe(["loading", "error"])).toBe("loading");
    expect(resolveNetflixRouteProbe(["error"])).toBe("error");
  });
});
