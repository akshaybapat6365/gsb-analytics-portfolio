import { clamp, lerp } from "@/lib/metrics/math";
import type { ModuleReadiness, PayloadMeta } from "@/lib/schemas/common";
import type { ShrinkPayload } from "@/lib/schemas/shrink";

type PolicyPoint = ShrinkPayload["policy"]["outcomes"][number];
type StoreEvent = ShrinkPayload["events"][number];

export type ShrinkEventRef = {
  key: string;
  globalIndex: number;
};

export type ShrinkOperationalPosture = "observe" | "detain" | "escalate";
export type ShrinkEvidenceMode = "clear" | "sparse" | "degraded";

function buildEventKey(event: StoreEvent) {
  return `${event.zoneId}:${event.t}:${event.type}`;
}

function interp(left: PolicyPoint, right: PolicyPoint, alpha: number) {
  return {
    threshold: lerp(left.threshold, right.threshold, alpha),
    preventedLoss: lerp(left.preventedLoss, right.preventedLoss, alpha),
    falsePositiveRate: lerp(left.falsePositiveRate, right.falsePositiveRate, alpha),
    roi: lerp(left.roi, right.roi, alpha),
  };
}

function resolveEvidenceMode(
  meta: PayloadMeta | undefined,
  readiness: ModuleReadiness[] | undefined,
  evidence: ShrinkPayload["decisionEvidence"] | undefined,
): ShrinkEvidenceMode {
  const hasSparseEvidence = !evidence || evidence.length === 0;
  const hasBlockedModule = readiness?.some((module) => module.status === "blocked") ?? false;
  const hasPartialModule = readiness?.some((module) => module.status === "partial") ?? false;
  const overallStatus = meta?.overallStatus;

  if (overallStatus === "unavailable" || hasBlockedModule) {
    return "degraded";
  }

  if (overallStatus === "stale" || hasPartialModule || hasSparseEvidence) {
    return "sparse";
  }

  return "clear";
}

export function pickShrinkChapterAnnotations(
  annotations: NonNullable<ShrinkPayload["annotations"]>,
  keywords: string[],
) {
  const pool = annotations.filter((annotation) =>
    keywords.some((keyword) => annotation.moduleId.includes(keyword)),
  );
  return pool.length > 0 ? pool : annotations;
}

export function buildShrinkEventRef(event: StoreEvent, globalIndex: number): ShrinkEventRef {
  return {
    key: buildEventKey(event),
    globalIndex,
  };
}

export function deriveShrinkScenario(
  payload: ShrinkPayload,
  threshold: number,
  falsePositiveMultiplier: number,
  selectedZoneId: string | undefined,
  selectedEventRef?: ShrinkEventRef | null,
) {
  const outcomes = [...payload.policy.outcomes].sort((a, b) => a.threshold - b.threshold);

  const target = clamp(
    threshold,
    outcomes[0]?.threshold ?? threshold,
    outcomes.at(-1)?.threshold ?? threshold,
  );

  let left = outcomes[0]!;
  let right = outcomes.at(-1)!;
  for (let index = 0; index < outcomes.length - 1; index += 1) {
    const a = outcomes[index]!;
    const b = outcomes[index + 1]!;
    if (target >= a.threshold && target <= b.threshold) {
      left = a;
      right = b;
      break;
    }
  }

  const alpha =
    right.threshold === left.threshold
      ? 0
      : (target - left.threshold) / (right.threshold - left.threshold);
  const point = interp(left, right, alpha);

  const fpMultiplier = clamp(falsePositiveMultiplier / 100, 0.4, 2.2);
  const adjustedFalsePositiveCost = payload.economics.falsePositiveCost * fpMultiplier;
  const eventVolume = payload.events.length;

  const objectiveCurve = outcomes.map((outcome) => {
    const falsePositiveCost = outcome.falsePositiveRate * eventVolume * adjustedFalsePositiveCost;
    const recoveredNet = outcome.preventedLoss - falsePositiveCost;
    return {
      ...outcome,
      falsePositiveCost,
      recoveredNet,
    };
  });

  const expectedFalsePositiveCost = point.falsePositiveRate * eventVolume * adjustedFalsePositiveCost;
  const expectedNetValue = point.preventedLoss - expectedFalsePositiveCost;

  const recommended =
    objectiveCurve.reduce((best, value) =>
      value.recoveredNet > best.recoveredNet ? value : best,
    ) ?? objectiveCurve[0];

  const eventCountsByZone = payload.store.zones.reduce<Record<string, number>>((acc, zone) => {
    acc[zone.id] = 0;
    return acc;
  }, {});
  for (const event of payload.events) {
    eventCountsByZone[event.zoneId] = (eventCountsByZone[event.zoneId] ?? 0) + 1;
  }

  const resolvedEvent = selectedEventRef
    ? payload.events.find((event, index) => {
        const ref = buildShrinkEventRef(event, index);
        return ref.key === selectedEventRef.key && ref.globalIndex === selectedEventRef.globalIndex;
      })
    : null;

  const resolvedZoneId = resolvedEvent?.zoneId ?? selectedZoneId ?? payload.store.zones[0]?.id ?? "";
  const zone = payload.store.zones.find((item) => item.id === resolvedZoneId) ?? payload.store.zones[0]!;
  const zoneEvents = payload.events.filter((event) => event.zoneId === zone.id);
  const zoneTriggered = zoneEvents.filter((event) => event.pTheft >= target);

  const selectedZoneEvent = resolvedEvent && resolvedEvent.zoneId === zone.id
    ? resolvedEvent
    : zoneEvents[0] ?? null;
  const cursor = selectedZoneEvent ? zoneEvents.findIndex((event) => event === selectedZoneEvent) : 0;

  const zoneMix = zoneEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.type] = (acc[event.type] ?? 0) + 1;
    return acc;
  }, {});

  const monthlyRecovered = point.preventedLoss * 4;
  const monthlyFalsePositive = expectedFalsePositiveCost * 4;
  const monthlyNet = monthlyRecovered - monthlyFalsePositive;
  const posture: ShrinkOperationalPosture =
    zoneTriggered.length >= 5 ? "escalate" : zoneTriggered.length >= 2 ? "detain" : "observe";

  const evidenceMode = resolveEvidenceMode(payload.meta, payload.dataReadiness, payload.decisionEvidence);
  const moduleStatusSummary = payload.dataReadiness?.map((module) => `${module.moduleId}:${module.status}`) ?? [];

  return {
    outcomes,
    point,
    fpMultiplier,
    adjustedFalsePositiveCost,
    expectedFalsePositiveCost,
    expectedNetValue,
    objectiveCurve,
    recommended,
    eventCountsByZone,
    zone,
    zoneEvents,
    zoneTriggered,
    zoneMix,
    eventVolume,
    selectedEvent: selectedZoneEvent,
    cursor,
    monthlyRecovered,
    monthlyFalsePositive,
    monthlyNet,
    posture,
    evidenceMode,
    moduleStatusSummary,
  };
}
