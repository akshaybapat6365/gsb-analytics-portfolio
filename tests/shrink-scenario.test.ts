import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildShrinkEventRef, deriveShrinkScenario } from "@/lib/viewmodels/shrinkScenario";
import { ShrinkPayloadSchema } from "@/lib/schemas/shrink";

function loadPayload() {
  const abs = path.join(process.cwd(), "public", "data/shrink/payload.json");
  return ShrinkPayloadSchema.parse(JSON.parse(fs.readFileSync(abs, "utf8")) as unknown);
}

describe("deriveShrinkScenario", () => {
  it("syncs selected event back to its zone and incident timeline", () => {
    const payload = loadPayload();
    const globalIndex = payload.events.findIndex((event) => event.zoneId === "z2" && event.t === 132);
    const event = payload.events[globalIndex]!;

    const scenario = deriveShrinkScenario(
      payload,
      0.85,
      100,
      payload.store.zones[0]?.id,
      buildShrinkEventRef(event, globalIndex),
    );

    expect(scenario.zone.id).toBe("z2");
    expect(scenario.selectedEvent?.t).toBe(132);
    expect(scenario.zoneEvents.some((zoneEvent) => zoneEvent.t === 132)).toBe(true);
    expect(scenario.eventCountsByZone.z2).toBeGreaterThan(0);
  });

  it("flags sparse evidence mode when decision evidence disappears", () => {
    const payload = loadPayload();
    const sparsePayload = {
      ...payload,
      decisionEvidence: [],
    };

    const scenario = deriveShrinkScenario(sparsePayload, 0.85, 100, payload.store.zones[0]?.id);

    expect(scenario.evidenceMode).toBe("sparse");
  });
});
