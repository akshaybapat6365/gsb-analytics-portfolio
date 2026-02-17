import { z } from "zod";
import { PayloadMetaSchema, RealSignalSchema } from "@/lib/schemas/common";

export const ShrinkPayloadSchema = z.object({
  store: z.object({
    name: z.string(),
    width: z.number(),
    height: z.number(),
    zones: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number(),
        theftPressure: z.number(),
      }),
    ),
  }),
  initialCameras: z.array(
    z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
    }),
  ),
  events: z.array(
    z.object({
      t: z.number(),
      zoneId: z.string(),
      type: z.enum(["scan", "sweep", "switch"]),
      pTheft: z.number(),
    }),
  ),
  economics: z.object({
    avgBasket: z.number(),
    grossMargin: z.number(),
    customerLtv: z.number(),
    falsePositiveCost: z.number(),
    theftCost: z.number(),
  }),
  policy: z.object({
    thresholds: z.array(z.number()),
    outcomes: z.array(
      z.object({
        threshold: z.number(),
        preventedLoss: z.number(),
        falsePositiveRate: z.number(),
        roi: z.number(),
      }),
    ),
  }),
  meta: PayloadMetaSchema.optional(),
  realSignals: z.array(RealSignalSchema).optional(),
});

export type ShrinkPayload = z.infer<typeof ShrinkPayloadSchema>;
