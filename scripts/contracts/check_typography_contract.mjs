#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const layoutPath = path.join(rootDir, "app", "layout.tsx");
const scanRoots = ["app", "components", "lib"];
const bannedPatterns = [/\bRoboto\s*\(/, /\bArial\b/i];
const errors = [];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

if (!fs.existsSync(layoutPath)) {
  console.error("[contracts:typography] Missing app/layout.tsx");
  process.exit(1);
}

const layoutSource = readUtf8(layoutPath);
for (const requiredFont of [
  "Playfair_Display",
  "DM_Sans",
  "Crimson_Pro",
  "Space_Grotesk",
  "Oswald",
  "Inter",
  "Lora",
  "Source_Sans_3",
  "Rajdhani",
  "Outfit",
  "Merriweather",
  "Nunito_Sans",
  "IBM_Plex_Mono",
]) {
  if (!layoutSource.includes(requiredFont)) {
    errors.push(`app/layout.tsx missing required font import: ${requiredFont}`);
  }
}

for (const requiredVar of [
  "--font-display-ord",
  "--font-ui-ord",
  "--font-display-fraud",
  "--font-ui-fraud",
  "--font-display-shrink",
  "--font-ui-shrink",
  "--font-display-starbucks",
  "--font-ui-starbucks",
  "--font-display-tesla",
  "--font-ui-tesla",
  "--font-display-netflix",
  "--font-ui-netflix",
  "--font-mono-core",
]) {
  if (!layoutSource.includes(requiredVar)) {
    errors.push(`app/layout.tsx missing required font variable: ${requiredVar}`);
  }
}

const sourceFiles = [];
function walkFiles(absDir) {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if ([".next", ".git", "node_modules"].includes(entry.name)) continue;
    const fullPath = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath);
      continue;
    }
    if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".css"))) {
      sourceFiles.push(fullPath);
    }
  }
}

for (const relRoot of scanRoots) {
  const absRoot = path.join(rootDir, relRoot);
  if (fs.existsSync(absRoot)) {
    walkFiles(absRoot);
  }
}

for (const filePath of sourceFiles) {
  const rel = path.relative(rootDir, filePath);
  const source = readUtf8(filePath);
  for (const pattern of bannedPatterns) {
    if (pattern.test(source)) {
      errors.push(`${rel}: contains banned typography token (${pattern})`);
    }
  }
}

if (errors.length > 0) {
  console.error("[contracts:typography] FAILED");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`[contracts:typography] PASS (${sourceFiles.length} files scanned)`);
