#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const cardsDir = path.join(rootDir, "data", "cards");
const contractPath = path.join(rootDir, "docs", "contracts", "data-policy.md");
const panelPath = path.join(rootDir, "components", "story", "RealSignalsPanel.tsx");
const sitePath = path.join(rootDir, "lib", "site.ts");

const requiredModes = ["strict-real", "baseline-fallback", "synthetic-demo"];
const bannedPhrases = [/Synthetic \(default\)/i];
const errors = [];

function readUtf8(filePath) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing required file: ${path.relative(rootDir, filePath)}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
}

const contractSource = readUtf8(contractPath);
const panelSource = readUtf8(panelPath);
const siteSource = readUtf8(sitePath);

for (const mode of requiredModes) {
  if (!contractSource.includes(mode)) {
    errors.push(`docs/contracts/data-policy.md missing mode: ${mode}`);
  }
  if (!siteSource.includes(mode)) {
    errors.push(`lib/site.ts missing mode in runtime resolver: ${mode}`);
  }
}

if (!panelSource.includes("policy:")) {
  errors.push("RealSignalsPanel must render an explicit policy badge.");
}

if (!panelSource.includes("policyMessage")) {
  errors.push("RealSignalsPanel must provide mode-aware policy message mapping.");
}

const cardFiles = fs
  .readdirSync(cardsDir)
  .filter((file) => file.endsWith(".md") && file !== "README.md")
  .sort();

for (const cardFile of cardFiles) {
  const fullPath = path.join(cardsDir, cardFile);
  const source = readUtf8(fullPath);

  for (const phrase of bannedPhrases) {
    if (phrase.test(source)) {
      errors.push(`Banned phrase "${phrase}" found in data/cards/${cardFile}`);
    }
  }

  if (!source.includes("Mode-aware baseline payload")) {
    errors.push(`data/cards/${cardFile} must declare mode-aware baseline status.`);
  }
}

for (const phrase of bannedPhrases) {
  if (phrase.test(contractSource)) {
    errors.push(`Banned phrase "${phrase}" found in docs/contracts/data-policy.md`);
  }
  if (phrase.test(panelSource)) {
    errors.push(`Banned phrase "${phrase}" found in components/story/RealSignalsPanel.tsx`);
  }
}

if (errors.length > 0) {
  console.error("[contracts:data-policy] FAILED");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`[contracts:data-policy] PASS (${cardFiles.length} data cards + runtime copy aligned)`);
