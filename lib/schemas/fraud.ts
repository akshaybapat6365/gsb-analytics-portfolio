import { z } from "zod";
import { PayloadMetaSchema, RealSignalSchema } from "@/lib/schemas/common";

export const FraudPayloadSchema = z.object({
  companies: z.array(
    z.object({
      ticker: z.string(),
      name: z.string(),
    }),
  ),
  filings: z.array(
    z.object({
      ticker: z.string(),
      filingDate: z.string(),
      beneishM: z.number(),
      sentiment: z.number(),
      deception: z.number(),
      riskScore: z.number(),
      topSignals: z.array(z.string()),
    }),
  ),
  graph: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        group: z.number(),
      }),
    ),
    links: z.array(
      z.object({
        source: z.string(),
        target: z.string(),
        weight: z.number(),
      }),
    ),
  }),
  backtest: z.object({
    dates: z.array(z.string()),
    strategy: z.array(z.number()),
    benchmark: z.array(z.number()),
    annualizedAlpha: z.number(),
  }),
  meta: PayloadMetaSchema.optional(),
  realSignals: z.array(RealSignalSchema).optional(),
});

export type FraudPayload = z.infer<typeof FraudPayloadSchema>;
