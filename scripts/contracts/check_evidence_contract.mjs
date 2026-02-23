#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const errors = [];

function readUtf8(relPath) {
  const absPath = path.join(rootDir, relPath);
  if (!fs.existsSync(absPath)) {
    errors.push(`Missing required file: ${relPath}`);
    return "";
  }
  return fs.readFileSync(absPath, "utf8");
}

function expectMatch(source, pattern, file, message) {
  if (!pattern.test(source)) {
    errors.push(`${file}: ${message}`);
  }
}

const catalogSource = readUtf8("lib/projects/catalog.ts");
const homeGridSource = readUtf8("components/home/HomeProjectGrid.tsx");
const projectCardSource = readUtf8("components/projects/ProjectCard.tsx");
const blufPanelSource = readUtf8("components/story/BlufPanel.tsx");

const routePages = [
  "app/projects/ord-lga-price-war/page.tsx",
  "app/projects/fraud-radar/page.tsx",
  "app/projects/target-shrink/page.tsx",
  "app/projects/starbucks-pivot/page.tsx",
  "app/projects/tesla-nacs/page.tsx",
  "app/projects/netflix-roi/page.tsx",
];

if (catalogSource) {
  const claimTypeCount = [...catalogSource.matchAll(/claimType:\s*"/g)].length;
  const limitationCount = [...catalogSource.matchAll(/limitation:\s*"/g)].length;
  const evidenceLevelCount = [...catalogSource.matchAll(/evidenceLevel:\s*"/g)].length;
  const sourceCount = [...catalogSource.matchAll(/source:\s*"/g)].length;
  const asOfCount = [...catalogSource.matchAll(/asOf:\s*"/g)].length;

  if (claimTypeCount < 6) errors.push(`lib/projects/catalog.ts: expected at least 6 claimType fields, found ${claimTypeCount}`);
  if (limitationCount < 6) errors.push(`lib/projects/catalog.ts: expected at least 6 limitation fields, found ${limitationCount}`);
  if (evidenceLevelCount < 6) errors.push(`lib/projects/catalog.ts: expected at least 6 evidenceLevel fields, found ${evidenceLevelCount}`);
  if (sourceCount < 6) errors.push(`lib/projects/catalog.ts: expected at least 6 source fields, found ${sourceCount}`);
  if (asOfCount < 6) errors.push(`lib/projects/catalog.ts: expected at least 6 asOf fields, found ${asOfCount}`);
}

if (homeGridSource) {
  expectMatch(
    homeGridSource,
    /resultLabel[\s\S]{0,700}data-evidence-badge/m,
    "components/home/HomeProjectGrid.tsx",
    "result block must include adjacent evidence badge",
  );
  expectMatch(
    homeGridSource,
    /resultValue[\s\S]{0,400}claimFraming/m,
    "components/home/HomeProjectGrid.tsx",
    "result block must include claim framing near the metric",
  );
}

if (projectCardSource) {
  expectMatch(
    projectCardSource,
    /resultLabel[\s\S]{0,700}badge\.label/m,
    "components/projects/ProjectCard.tsx",
    "project card result block must include adjacent evidence badge",
  );
  expectMatch(
    projectCardSource,
    /resultValue[\s\S]{0,500}limitation/m,
    "components/projects/ProjectCard.tsx",
    "project card result block must include limitation near metric",
  );
}

if (blufPanelSource) {
  expectMatch(
    blufPanelSource,
    /keyOutputValue[\s\S]{0,500}data-evidence-badge/m,
    "components/story/BlufPanel.tsx",
    "BLUF key output must render evidence badge adjacency",
  );
}

for (const routePage of routePages) {
  const source = readUtf8(routePage);
  if (!source) continue;
  expectMatch(source, /<BlufPanel[\s\S]{0,900}evidenceLine=/m, routePage, "BlufPanel must receive evidenceLine");
  expectMatch(source, /<BlufPanel[\s\S]{0,900}limitation=/m, routePage, "BlufPanel must receive limitation");
  expectMatch(source, /<BlufPanel[\s\S]{0,900}keyOutputLabel=/m, routePage, "BlufPanel must receive keyOutputLabel");
  expectMatch(source, /<BlufPanel[\s\S]{0,900}keyOutputValue=/m, routePage, "BlufPanel must receive keyOutputValue");
}

if (errors.length > 0) {
  console.error("[contracts:evidence] FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("[contracts:evidence] PASS");
