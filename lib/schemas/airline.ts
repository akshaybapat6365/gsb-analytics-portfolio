import { z } from "zod";
import {
  AnnotationSchema,
  DecisionEvidenceSchema,
  ModuleReadinessSchema,
  PayloadMetaSchema,
  RealSignalSchema,
} from "@/lib/schemas/common";

export const AirlinePayloadSchema = z.object({
  route: z.object({
    origin: z.string(),
    destination: z.string(),
  }),
  competitor: z
    .object({
      name: z.string(),
      dailyAggressiveness: z.array(z.number()),
      dailyPrices: z.array(z.number()).optional(),
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
  methodMeta: z
    .object({
      modelVersion: z.string(),
      calibrationWindow: z.object({
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        count: z.number(),
      }),
      validationWindow: z.object({
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        count: z.number(),
      }),
      objective: z.string(),
    })
    .optional(),
  dataLineage: z
    .object({
      observedPct: z.number(),
      inferredPct: z.number(),
      modeledPct: z.number(),
    })
    .optional(),
  uncertainty: z
    .object({
      samples: z.number().optional(),
      revenueLiftCi: z.tuple([z.number(), z.number()]),
      shareImpactCi: z.tuple([z.number(), z.number()]),
      regretCi: z.tuple([z.number(), z.number()]),
    })
    .optional(),
  validationSummary: z
    .object({
      trainWindow: z.object({
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        count: z.number(),
      }),
      validationWindow: z.object({
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        count: z.number(),
      }),
      metrics: z.object({
        staticBaseline: z.object({
          maeRevenue: z.number(),
          mapeRevenue: z.number(),
          meanRegret: z.number(),
        }),
        stickyBaseline: z.object({
          maeRevenue: z.number(),
          mapeRevenue: z.number(),
          meanRegret: z.number(),
        }),
        policyModel: z.object({
          maeRevenue: z.number(),
          mapeRevenue: z.number(),
          meanRegret: z.number(),
        }),
      }),
      oosLiftDeltaVsStatic: z.number(),
      oosLiftDeltaVsSticky: z.number(),
    })
    .optional(),
  ablationSummary: z
    .array(
      z.object({
        scenario: z.string(),
        incrementalRevenue: z.number(),
        actualRevenue: z.number(),
        simRevenue: z.number(),
        liftPct: z.number(),
        meanRegret: z.number(),
      }),
    )
    .optional(),
  sensitivitySummary: z
    .object({
      grid: z.array(
        z.object({
          elasticity: z.number(),
          competitorReactivity: z.number(),
          incrementalRevenue: z.number(),
          liftPct: z.number(),
        }),
      ),
      bestCase: z
        .object({
          elasticity: z.number(),
          competitorReactivity: z.number(),
          incrementalRevenue: z.number(),
          liftPct: z.number(),
        })
        .nullable()
        .optional(),
      worstCase: z
        .object({
          elasticity: z.number(),
          competitorReactivity: z.number(),
          incrementalRevenue: z.number(),
          liftPct: z.number(),
        })
        .nullable()
        .optional(),
    })
    .optional(),
  meta: PayloadMetaSchema.optional(),
  realSignals: z.array(RealSignalSchema).optional(),
  dataReadiness: z.array(ModuleReadinessSchema).optional(),
  annotations: z.array(AnnotationSchema).optional(),
  decisionEvidence: z.array(DecisionEvidenceSchema).optional(),
});

export type AirlinePayload = z.infer<typeof AirlinePayloadSchema>;
