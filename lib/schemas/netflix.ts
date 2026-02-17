import { z } from "zod";
import { PayloadMetaSchema, RealSignalSchema } from "@/lib/schemas/common";

export const NetflixPayloadSchema = z.object({
  headline: z.object({
    dealCostM: z.number(),
    estimatedIncrementalAddsM: z.number(),
    ciAddsM: z.tuple([z.number(), z.number()]),
    retentionLiftPct: z.number(),
  }),
  titles: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      costM: z.number(),
      acquisitionLtvM: z.number(),
      retentionLtvM: z.number(),
      acclaim: z.number(),
    }),
  ),
  paretoFrontier: z.array(
    z.object({
      id: z.string(),
      acquisition: z.number(),
      retention: z.number(),
    }),
  ),
  model: z.object({
    acquisitionAddsCoeff: z.object({
      intercept: z.number(),
      budget: z.number(),
      buzz: z.number(),
      acclaim: z.number(),
    }),
    retentionMonthsCoeff: z.object({
      intercept: z.number(),
      budget: z.number(),
      buzz: z.number(),
      acclaim: z.number(),
    }),
  }),
  meta: PayloadMetaSchema.optional(),
  realSignals: z.array(RealSignalSchema).optional(),
});

export type NetflixPayload = z.infer<typeof NetflixPayloadSchema>;
