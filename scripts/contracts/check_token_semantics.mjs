#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const catalogPath = path.join(rootDir, "lib", "projects", "catalog.ts");
const cardPath = path.join(rootDir, "components", "projects", "ProjectCard.tsx");
const headerPath = path.join(rootDir, "components", "projects", "ProjectHeader.tsx");

const expectedAccentTokens = [
  "market-competition",
  "forensic-risk",
  "retail-operations",
  "geo-portfolio",
  "infrastructure-strategy",
  "content-capital",
];

const legacyColorTokens = ["cyan", "amber", "emerald", "crimson", "purple", "violet", "blue", "teal"];
const errors = [];

function readUtf8(filePath) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing required file: ${path.relative(rootDir, filePath)}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

const catalogSource = readUtf8(catalogPath);
const cardSource = readUtf8(cardPath);
const headerSource = readUtf8(headerPath);

const accentMatches = [...catalogSource.matchAll(/accent:\s*"([^"]+)"/g)].map((match) => match[1]);
if (accentMatches.length === 0) {
  errors.push("No project accent tokens found in lib/projects/catalog.ts");
}

for (const token of accentMatches) {
  if (!expectedAccentTokens.includes(token)) {
    errors.push(`Unexpected accent token in catalog: ${token}`);
  }
}

for (const token of expectedAccentTokens) {
  if (!accentMatches.includes(token)) {
    errors.push(`Expected accent token missing from catalog: ${token}`);
  }
  if (!cardSource.includes(token)) {
    errors.push(`ProjectCard is missing token mapping: ${token}`);
  }
  if (!headerSource.includes(token)) {
    errors.push(`ProjectHeader is missing token mapping: ${token}`);
  }
}

for (const legacy of legacyColorTokens) {
  const regex = new RegExp(`accent:\\s*"${legacy}"`);
  if (regex.test(catalogSource)) {
    errors.push(`Legacy color-name accent token found in catalog: ${legacy}`);
  }
}

if (errors.length > 0) {
  console.error("[contracts:token-semantics] FAILED");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`[contracts:token-semantics] PASS (${accentMatches.length} project accent tokens validated)`);
