import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { AirlinePayloadSchema } from "@/lib/schemas/airline";
import { FraudPayloadSchema } from "@/lib/schemas/fraud";
import { ShrinkPayloadSchema } from "@/lib/schemas/shrink";
import { StarbucksPayloadSchema } from "@/lib/schemas/starbucks";
import { EvPayloadSchema } from "@/lib/schemas/ev";
import { NetflixPayloadSchema } from "@/lib/schemas/netflix";

function readJson(rel: string) {
  const p = path.join(process.cwd(), rel);
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as unknown;
}

describe("public payloads", () => {
  it("airline payload matches schema", () => {
    const json = readJson("public/data/airline/payload.json");
    expect(() => AirlinePayloadSchema.parse(json)).not.toThrow();
  });

  it("fraud payload matches schema", () => {
    const json = readJson("public/data/fraud/payload.json");
    expect(() => FraudPayloadSchema.parse(json)).not.toThrow();
  });

  it("shrink payload matches schema", () => {
    const json = readJson("public/data/shrink/payload.json");
    expect(() => ShrinkPayloadSchema.parse(json)).not.toThrow();
  });

  it("starbucks payload matches schema", () => {
    const json = readJson("public/data/starbucks/payload.json");
    expect(() => StarbucksPayloadSchema.parse(json)).not.toThrow();
  });

  it("ev payload matches schema", () => {
    const json = readJson("public/data/ev/payload.json");
    expect(() => EvPayloadSchema.parse(json)).not.toThrow();
  });

  it("netflix payload matches schema", () => {
    const json = readJson("public/data/netflix/payload.json");
    expect(() => NetflixPayloadSchema.parse(json)).not.toThrow();
  });
});

