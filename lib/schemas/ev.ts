import { z } from "zod";
import {
  AnnotationSchema,
  DecisionEvidenceSchema,
  ModuleReadinessSchema,
  PayloadMetaSchema,
  RealSignalSchema,
} from "@/lib/schemas/common";

export const EvPayloadSchema = z.object({
  corridor: z.object({
    name: z.string(),
    focus: z.string(),
    bounds: z.tuple([z.tuple([z.number(), z.number()]), z.tuple([z.number(), z.number()])]),
  }),
  stations: z.array(
    z.object({
      id: z.string(),
      brand: z.enum(["Tesla", "EA", "Other"]),
      lon: z.number(),
      lat: z.number(),
      pricePerKwh: z.number(),
    }),
  ),
  candidateSites: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      lon: z.number(),
      lat: z.number(),
      capturesFordPct: z.number(),
      cannibalizesTeslaUnitsPerMonth: z.number(),
      npvM: z.number(),
      capexM: z.number(),
    }),
  ),
  flows: z.array(
    z.object({
      id: z.string(),
      brand: z.enum(["Tesla", "Ford", "GM", "Other"]),
      path: z.array(z.tuple([z.number(), z.number()])),
      timestamps: z.array(z.number()),
    }),
  ),
  meta: PayloadMetaSchema.optional(),
  realSignals: z.array(RealSignalSchema).optional(),
  dataReadiness: z.array(ModuleReadinessSchema).optional(),
  annotations: z.array(AnnotationSchema).optional(),
  decisionEvidence: z.array(DecisionEvidenceSchema).optional(),
});

export type EvPayload = z.infer<typeof EvPayloadSchema>;
