import { z } from "zod";
import { PayloadMetaSchema, RealSignalSchema } from "@/lib/schemas/common";

export const AirlinePayloadSchema = z.object({
  route: z.object({
    origin: z.string(),
    destination: z.string(),
  }),
  competitor: z
    .object({
      name: z.string(),
      dailyAggressiveness: z.array(z.number()),
      inferredPolicyLabel: z.string(),
    })
    .optional(),
  days: z.array(
    z.object({
      date: z.string(),
      dow: z.string(),
      shock: z.number(),
      actual: z.object({
        price: z.number(),
        pax: z.number(),
        revenue: z.number(),
      }),
      algo: z.object({
        price: z.number(),
        pax: z.number(),
        revenue: z.number(),
      }),
      regret: z.number(),
    }),
  ),
  heatmap: z.object({
    bookingWindows: z.array(z.number()),
    dows: z.array(z.string()),
    actual: z.array(z.array(z.number())),
    algo: z.array(z.array(z.number())),
  }),
  narrative: z.array(
    z.object({
      date: z.string(),
      recommendedPrice: z.number(),
      actualPrice: z.number(),
      incrementalRevenue: z.number(),
      incrementalTravelers: z.number(),
      reason: z.string(),
    }),
  ),
  bookingCurve: z
    .array(
      z.object({
        date: z.string(),
        window: z.number(),
        actualBookings: z.number(),
        algoBookings: z.number(),
      }),
    )
    .optional(),
  shockEvents: z
    .array(
      z.object({
        date: z.string(),
        severity: z.enum(["low", "med", "high"]),
        label: z.string(),
        narrative: z.string(),
      }),
    )
    .optional(),
  nashSim: z
    .object({
      states: z.array(
        z.object({
          dayIndex: z.number(),
          uaPrice: z.number(),
          dlPrice: z.number(),
          uaShare: z.number(),
          dlShare: z.number(),
          regret: z.number(),
        }),
      ),
      convergenceDay: z.number(),
    })
    .optional(),
  meta: PayloadMetaSchema.optional(),
  realSignals: z.array(RealSignalSchema).optional(),
});

export type AirlinePayload = z.infer<typeof AirlinePayloadSchema>;
