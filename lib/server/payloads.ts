import { loadPublicJson } from "./loadPublicJson";
import { AirlinePayloadSchema, type AirlinePayload } from "@/lib/schemas/airline";
import { FraudPayloadSchema, type FraudPayload } from "@/lib/schemas/fraud";
import { ShrinkPayloadSchema, type ShrinkPayload } from "@/lib/schemas/shrink";
import { StarbucksPayloadSchema, type StarbucksPayload } from "@/lib/schemas/starbucks";
import { EvPayloadSchema, type EvPayload } from "@/lib/schemas/ev";
import { NetflixPayloadSchema, type NetflixPayload } from "@/lib/schemas/netflix";

export function loadAirlinePayload(): Promise<AirlinePayload> {
  return loadPublicJson("data/airline/payload.json", AirlinePayloadSchema);
}

export function loadFraudPayload(): Promise<FraudPayload> {
  return loadPublicJson("data/fraud/payload.json", FraudPayloadSchema);
}

export function loadShrinkPayload(): Promise<ShrinkPayload> {
  return loadPublicJson("data/shrink/payload.json", ShrinkPayloadSchema);
}

export function loadStarbucksPayload(): Promise<StarbucksPayload> {
  return loadPublicJson("data/starbucks/payload.json", StarbucksPayloadSchema);
}

export function loadEvPayload(): Promise<EvPayload> {
  return loadPublicJson("data/ev/payload.json", EvPayloadSchema);
}

export function loadNetflixPayload(): Promise<NetflixPayload> {
  return loadPublicJson("data/netflix/payload.json", NetflixPayloadSchema);
}

