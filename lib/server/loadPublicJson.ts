import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";

function safeJoinPublic(relPath: string) {
  // Prevent path traversal. We only allow paths under `public/`.
  const cleaned = relPath.replace(/^\/+/, "");
  const resolved = path.resolve(process.cwd(), "public", cleaned);
  const publicRoot = path.resolve(process.cwd(), "public");
  if (!resolved.startsWith(publicRoot + path.sep)) {
    throw new Error(`Invalid public path: ${relPath}`);
  }
  return resolved;
}

export const loadPublicJson = cache(
  async <TSchema extends z.ZodTypeAny>(relPath: string, schema: TSchema) => {
    const abs = safeJoinPublic(relPath);
    const raw = await fs.readFile(abs, "utf8");
    const json = JSON.parse(raw) as unknown;
    return schema.parse(json) as z.infer<TSchema>;
  },
);

