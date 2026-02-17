import { z } from "zod";
import { PayloadMetaSchema, RealSignalSchema } from "@/lib/schemas/common";

export const StarbucksPayloadSchema = z.object({
  city: z.object({
    name: z.string(),
    center: z.tuple([z.number(), z.number()]), // [lon, lat]
    zoom: z.number(),
  }),
  did: z.object({
    ate: z.number(),
    ci: z.tuple([z.number(), z.number()]),
    pretrendP: z.number(),
  }),
  scenarios: z.array(
    z.object({
      wfhIndex: z.number(),
      trafficMultiplier: z.number(),
    }),
  ),
  stores: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      lon: z.number(),
      lat: z.number(),
      segment: z.enum(["office", "residential", "mixed"]),
      baselineTraffic: z.number(),
      baselineProfitK: z.number(),
      wfhExposure: z.number(),
      recommendation: z.enum(["Convert", "Lockers", "Close"]),
      deltaProfitK: z.number(),
    }),
  ),
  meta: PayloadMetaSchema.optional(),
  realSignals: z.array(RealSignalSchema).optional(),
});

export type StarbucksPayload = z.infer<typeof StarbucksPayloadSchema>;
