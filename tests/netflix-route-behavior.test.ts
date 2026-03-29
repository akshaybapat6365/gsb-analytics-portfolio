import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RecoverabilityProbe } from "@/app/projects/netflix-roi/RecoverabilityProbe";
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

  it("renders distinct recoverability markup for loading and error probes", () => {
    const loadingMarkup = renderToStaticMarkup(createElement(RecoverabilityProbe, { probe: "loading" }));
    const errorMarkup = renderToStaticMarkup(createElement(RecoverabilityProbe, { probe: "error" }));

    expect(loadingMarkup).toContain('data-probe="loading"');
    expect(loadingMarkup).toContain("Recoverability probe active");
    expect(loadingMarkup).toContain("Open live route");

    expect(errorMarkup).toContain('data-probe="error"');
    expect(errorMarkup).toContain("Diagnostics");
    expect(errorMarkup).toContain("Back to projects");
  });
});
