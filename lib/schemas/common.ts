import { z } from "zod";

export const DataStatusSchema = z.enum(["ok", "stale", "unavailable"]);
export type DataStatus = z.infer<typeof DataStatusSchema>;

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
  modules: z.record(z.string(), AvailabilityBlockSchema),
});
export type PayloadMeta = z.infer<typeof PayloadMetaSchema>;

export const RealSignalSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: DataStatusSchema,
  value: z.string().optional(),
  unit: z.string().optional(),
  change: z.string().optional(),
  reasonCode: z.string().optional(),
  provenance: ProvenanceSchema.optional(),
});
export type RealSignal = z.infer<typeof RealSignalSchema>;

