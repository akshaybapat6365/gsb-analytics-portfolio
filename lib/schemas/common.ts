import { z } from "zod";

export const DataStatusSchema = z.enum(["ok", "stale", "unavailable"]);
export type DataStatus = z.infer<typeof DataStatusSchema>;

export const DataPolicyModeSchema = z.enum([
  "strict-real",
  "baseline-fallback",
  "synthetic-demo",
]);
export type DataPolicyMode = z.infer<typeof DataPolicyModeSchema>;

export const ModuleReadinessStatusSchema = z.enum(["ready", "partial", "blocked"]);
export type ModuleReadinessStatus = z.infer<typeof ModuleReadinessStatusSchema>;

export const ProvenanceSchema = z.object({
  source: z.string(),
  fetchedAt: z.string(),
  asOf: z.string().optional(),
  note: z.string().optional(),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const AvailabilityBlockSchema = z.object({
  status: DataStatusSchema,
  reasonCode: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
});
export type AvailabilityBlock = z.infer<typeof AvailabilityBlockSchema>;

export const PayloadMetaSchema = z.object({
  runId: z.string(),
  generatedAt: z.string(),
  overallStatus: DataStatusSchema,
  policyMode: DataPolicyModeSchema.optional(),
  policyDecision: z.string().optional(),
  modules: z.record(z.string(), AvailabilityBlockSchema),
});
export type PayloadMeta = z.infer<typeof PayloadMetaSchema>;

export const RealSignalSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
  status: DataStatusSchema,
  value: z.string().optional(),
  unit: z.string().optional(),
  change: z.string().optional(),
  reasonCode: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
});
export type RealSignal = z.infer<typeof RealSignalSchema>;

export const ModuleReadinessSchema = z.object({
  moduleId: z.string(),
  status: ModuleReadinessStatusSchema,
  realCoveragePct: z.number().min(0).max(100),
  minRequiredSeries: z.array(z.string()),
  missingSeries: z.array(z.string()),
  lastSuccessfulRealRunAt: z.string().optional(),
});
export type ModuleReadiness = z.infer<typeof ModuleReadinessSchema>;

export const AnnotationTypeSchema = z.enum([
  "shock",
  "anomaly",
  "inflection",
  "recommendation",
]);
export type AnnotationType = z.infer<typeof AnnotationTypeSchema>;

export const EvidenceRefSchema = z.object({
  source: z.string(),
  asOf: z.string().optional(),
  seriesId: z.string(),
  value: z.string().optional(),
});
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

export const AnnotationSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  timestampOrIndex: z.string(),
  title: z.string(),
  body: z.string(),
  type: AnnotationTypeSchema,
  evidenceRefs: z.array(EvidenceRefSchema),
});
export type Annotation = z.infer<typeof AnnotationSchema>;

export const DecisionEvidenceSchema = z.object({
  recommendationId: z.string(),
  drivers: z.array(z.string()),
  counterfactualDelta: z.string(),
  confidenceBand: z.tuple([z.number(), z.number()]),
});
export type DecisionEvidence = z.infer<typeof DecisionEvidenceSchema>;
