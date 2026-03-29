import { describe, expect, it } from "vitest";

import { isRecoverableChunkError } from "@/lib/runtime/chunkLoadRecovery";

describe("chunk load recovery detection", () => {
  it("matches webpack-style loading chunk failures", () => {
    expect(isRecoverableChunkError(new Error("Loading chunk 7177 failed."))).toBe(true);
  });

  it("matches generic dynamic import failures", () => {
    expect(isRecoverableChunkError(new Error("Failed to fetch dynamically imported module"))).toBe(true);
    expect(isRecoverableChunkError({ reason: new Error("Importing a module script failed") })).toBe(true);
  });

  it("ignores unrelated runtime errors", () => {
    expect(isRecoverableChunkError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isRecoverableChunkError(undefined)).toBe(false);
  });
});
