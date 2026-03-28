import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildFraudRecommendationContract } from "@/lib/viewmodels/fraud";
import { FraudPayloadSchema } from "@/lib/schemas/fraud";

function loadFraudPayload() {
  const abs = path.join(process.cwd(), "public", "data/fraud/payload.json");
  return FraudPayloadSchema.parse(JSON.parse(fs.readFileSync(abs, "utf8")) as unknown);
}

describe("Fraud recommendation contract", () => {
  it("filters the evidence pack to the active recommendation state", () => {
    const payload = loadFraudPayload();

    const contract = buildFraudRecommendationContract({
      payload,
      recommendation: "Keep on watchlist",
      scenarioLabel: "Balance-sheet stress",
      reviewPosture:
        "Escalate names with sustained balance-sheet deterioration into deeper forensic review, but keep language as investigative context only.",
      selectedTicker: "NKLA",
      latestAdjustedRisk: 0.74,
      triggerThreshold: 0.69,
      topWatchlistTicker: "NKLA",
      topWatchlistScore: 0.78,
      retainedLinkCount: 42,
      linkCutoffPct: 20,
      alphaBand: [0.31, 0.47],
    });

    expect(contract.activeRecommendationId).toBe("fraud-watchlist-monitor");
    expect(contract.evidence).toHaveLength(1);
    expect(contract.evidence[0]?.recommendationId).toBe("fraud-watchlist-monitor");
    expect(contract.evidenceSummary).toContain("Keep on watchlist");
    expect(contract.evidenceSummary).toContain("NKLA");
    expect(contract.evidenceFooter).toContain("modeled triage aids");
    expect(contract.evidenceFooter).toContain("legal proof");
  });

  it("switches recommendation evidence when the active posture changes", () => {
    const payload = loadFraudPayload();

    const observeContract = buildFraudRecommendationContract({
      payload,
      recommendation: "Observe only",
      scenarioLabel: "Baseline panel",
      reviewPosture:
        "Monitor the issuer in the watchlist queue and wait for another corroborating filing before escalating.",
      selectedTicker: "AAPL",
      latestAdjustedRisk: 0.41,
      triggerThreshold: 0.62,
      topWatchlistTicker: null,
      topWatchlistScore: null,
      retainedLinkCount: 6,
      linkCutoffPct: 35,
      alphaBand: [0.18, 0.33],
    });

    const escalateContract = buildFraudRecommendationContract({
      payload,
      recommendation: "Escalate forensic review",
      scenarioLabel: "Language whiplash",
      reviewPosture:
        "Treat abrupt disclosure-language swings as a prompt for transcript and filing follow-up, not as standalone proof of misconduct.",
      selectedTicker: "FTX",
      latestAdjustedRisk: 0.87,
      triggerThreshold: 0.71,
      topWatchlistTicker: "FTX",
      topWatchlistScore: 0.91,
      retainedLinkCount: 57,
      linkCutoffPct: 18,
      alphaBand: [0.37, 0.53],
    });

    expect(observeContract.activeRecommendationId).toBe("fraud-observe-only");
    expect(escalateContract.activeRecommendationId).toBe("fraud-escalate-review");
    expect(observeContract.evidence[0]?.recommendationId).not.toBe(escalateContract.evidence[0]?.recommendationId);
    expect(observeContract.boundedNotes.join(" ")).toContain("AAPL");
    expect(escalateContract.boundedNotes.join(" ")).toContain("FTX");
  });
});
