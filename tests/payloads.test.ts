import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { projects } from "@/lib/projects/catalog";
import { buildHomePageViewModel } from "@/lib/viewmodels/home";
import { buildPageMetadata } from "@/lib/seo";
import { AirlinePayloadSchema } from "@/lib/schemas/airline";
import { FraudPayloadSchema } from "@/lib/schemas/fraud";
import { ShrinkPayloadSchema } from "@/lib/schemas/shrink";
import { StarbucksPayloadSchema } from "@/lib/schemas/starbucks";
import { EvPayloadSchema } from "@/lib/schemas/ev";
import { NetflixPayloadSchema } from "@/lib/schemas/netflix";

const caseStudyPages = [
  "app/projects/ord-lga-price-war/page.tsx",
  "app/projects/fraud-radar/page.tsx",
  "app/projects/target-shrink/page.tsx",
  "app/projects/starbucks-pivot/page.tsx",
  "app/projects/tesla-nacs/page.tsx",
  "app/projects/netflix-roi/page.tsx",
] as const;

function readJson(rel: string) {
  const p = path.join(process.cwd(), rel);
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as unknown;
}

describe("portfolio discovery metadata", () => {
  it("portfolio cards preserve trust framing across the home viewmodel", () => {
    const vm = buildHomePageViewModel(projects);

    expect(vm.cards).toHaveLength(projects.length);
    for (const card of vm.cards) {
      expect(card.claimFraming.length).toBeGreaterThan(0);
      expect(card.methodPlain.length).toBeGreaterThan(0);
      expect(card.evidenceMeta).toContain("as-of");
      expect(card.href).toMatch(/^\/projects\//);
    }
  });

  it("home metadata stays route-specific with an absolute portfolio title", () => {
    const metadata = buildPageMetadata({
      title: { absolute: "Vaibhav Bapat | Decision Intelligence Portfolio" },
      description: "Trust-rich home route metadata.",
      path: "/",
      theme: "ord-lga-price-war",
    });

    expect(metadata.title).toEqual({ absolute: "Vaibhav Bapat | Decision Intelligence Portfolio" });
    expect(metadata.openGraph?.title).toBe("Vaibhav Bapat | Decision Intelligence Portfolio");
    expect(metadata.twitter?.title).toBe("Vaibhav Bapat | Decision Intelligence Portfolio");
    expect(metadata.alternates?.canonical).toBe("https://vb-labs.vercel.app");
  });
});

describe("case-study trust composition", () => {
  it("every case study page exposes the shared trust stack entrypoints", () => {
    for (const pagePath of caseStudyPages) {
      const source = fs.readFileSync(path.join(process.cwd(), pagePath), "utf8");
      expect(source).toContain("CaseStudyTrustStack");
    }
  });
});

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

