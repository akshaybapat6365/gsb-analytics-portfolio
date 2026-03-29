import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RecoverabilityProbe } from "@/app/projects/ord-lga-price-war/RecoverabilityProbe";
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
