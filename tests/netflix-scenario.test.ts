import { describe, expect, it } from "vitest";

import { deriveNetflixScenario } from "@/lib/viewmodels/netflix";
import { NetflixPayloadSchema } from "@/lib/schemas/netflix";
import { readFileSync } from "node:fs";
import path from "node:path";

function loadPayload() {
  const filePath = path.join(process.cwd(), "public/data/netflix/payload.json");
  return NetflixPayloadSchema.parse(JSON.parse(readFileSync(filePath, "utf8")));
}

describe("deriveNetflixScenario", () => {
  it("changes the top title when the committee shifts from acquisition to retention", () => {
    const payload = loadPayload();

    const acquisitionFirst = deriveNetflixScenario(payload, {
      budgetM: 90,
      buzz: 66,
      acclaim: 74,
      retentionPriority: 0,
      buzzDecay: 44,
      selectedTitleId: "t05",
    });

    const retentionFirst = deriveNetflixScenario(payload, {
      budgetM: 90,
      buzz: 66,
      acclaim: 74,
      retentionPriority: 100,
      buzzDecay: 44,
      selectedTitleId: "t05",
    });

    expect(acquisitionFirst.top?.title).toBe("Grey’s: Rewatch Effect (Synthetic)");
    expect(retentionFirst.top?.title).toBe("The Residence");
    expect(acquisitionFirst.ranked[0]?.id).not.toBe(retentionFirst.ranked[0]?.id);
  });

  it("keeps the selected title packet and evidence summary synchronized to scenario state", () => {
    const payload = loadPayload();

    const scenario = deriveNetflixScenario(payload, {
      budgetM: 140,
      buzz: 78,
      acclaim: 88,
      retentionPriority: 82,
      buzzDecay: 18,
      selectedTitleId: "t04",
    });

    expect(scenario.selectedTitle.id).toBe("t04");
    expect(scenario.decisionPacket.recommendationHeadline.toLowerCase()).toContain("the residence");
    expect(scenario.recommendationContract.evidenceSummary).toContain("The Residence");
    expect(scenario.recommendationContract.evidenceSummary).toContain("retention-weighted");
    expect(scenario.recommendationContract.evidenceFooter).toContain("modeled");
  });
});
