#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const errors = [];

const sourceRoots = ["app", "components"];
const sourcePatterns = [
  /\b\d+\s+issue(?:s)?\b/i,
  /__next-dev-overlay/i,
  /react-dev-overlay/i,
];

const buildPatterns = [
  />\s*\d+\s+issue(?:s)?\s*</i,
  /__next-dev-overlay/i,
  /react-dev-overlay/i,
];

function walk(dir, collector) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".next", "node_modules"].includes(entry.name)) continue;
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absPath, collector);
      continue;
    }
    if (entry.isFile()) {
      collector(absPath);
    }
  }
}

function scanSource() {
  for (const root of sourceRoots) {
    const absRoot = path.join(rootDir, root);
    if (!fs.existsSync(absRoot)) continue;
    walk(absRoot, (absPath) => {
      if (!/\.(ts|tsx|css|mdx?)$/.test(absPath)) return;
      const relPath = path.relative(rootDir, absPath);
      const content = fs.readFileSync(absPath, "utf8");
      for (const pattern of sourcePatterns) {
        if (pattern.test(content)) {
          errors.push(`${relPath}: matched banned dev-overlay pattern ${pattern}`);
        }
      }
    });
  }
}

function scanBuiltHtml() {
  const buildRoot = path.join(rootDir, ".next", "server", "app");
  if (!fs.existsSync(buildRoot)) {
    errors.push("Build artifacts missing at .next/server/app. Run `npm run build` before strict overlay checks.");
    return;
  }

  walk(buildRoot, (absPath) => {
    if (!absPath.endsWith(".html")) return;
    const relPath = path.relative(rootDir, absPath);
    const content = fs.readFileSync(absPath, "utf8");
    for (const pattern of buildPatterns) {
      if (pattern.test(content)) {
        errors.push(`${relPath}: matched banned runtime overlay pattern ${pattern}`);
      }
    }
  });
}

scanSource();
scanBuiltHtml();

if (errors.length > 0) {
  console.error("[contracts:no-dev-overlays] FAILED");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("[contracts:no-dev-overlays] PASS");
