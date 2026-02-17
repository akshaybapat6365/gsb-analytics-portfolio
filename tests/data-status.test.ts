import { describe, expect, it } from "vitest";
import { PayloadMetaSchema, RealSignalSchema } from "@/lib/schemas/common";

describe("data availability schemas", () => {
  it("parses payload meta with module statuses", () => {
    const sample = {
      runId: "real-20260216120000",
      generatedAt: "2026-02-16T12:00:00Z",
      overallStatus: "unavailable",
      modules: {
        airfare_cpi_yoy: {
          status: "ok",
          provenance: {
            source: "fred:CUSR0000SETG01",
            fetchedAt: "2026-02-16T12:00:00Z",
            asOf: "2025-12-01",
          },
        },
        nkla_recent_10k_10q: {
          status: "unavailable",
          reasonCode: "fetch_error:HTTPError",
        },
      },
    };

    expect(() => PayloadMetaSchema.parse(sample)).not.toThrow();
  });

  it("parses unavailable signal without value", () => {
    const sample = {
      id: "nflx_recent_10k_10q",
      label: "NFLX 10-K/10-Q filings (365d)",
      status: "unavailable",
      reasonCode: "fetch_error:HTTPError",
    };

    expect(() => RealSignalSchema.parse(sample)).not.toThrow();
  });
});

