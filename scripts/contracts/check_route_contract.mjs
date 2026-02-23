#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const projectsRoot = path.join(rootDir, "app", "projects");

const expectedProjectSlugs = [
  "ord-lga-price-war",
  "fraud-radar",
  "target-shrink",
  "starbucks-pivot",
  "tesla-nacs",
  "netflix-roi",
];

const requiredRouteFiles = ["page.tsx", "layout.tsx", "loading.tsx", "error.tsx", "Hero.tsx", "InteractiveSection.tsx"];

const errors = [];
const warnings = [];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertContains(content, marker, label) {
  if (!content.includes(marker)) {
    errors.push(`${label} is missing required marker: ${marker}`);
  }
}

if (!fs.existsSync(projectsRoot)) {
  console.error(`[contracts:route] app/projects not found at ${projectsRoot}`);
  process.exit(1);
}

const discoveredProjectDirs = fs
  .readdirSync(projectsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const slug of expectedProjectSlugs) {
  const projectDir = path.join(projectsRoot, slug);
  if (!fs.existsSync(projectDir)) {
    errors.push(`Missing project route directory: app/projects/${slug}`);
    continue;
  }

  const files = fs.readdirSync(projectDir);
  for (const requiredFile of requiredRouteFiles) {
    if (!files.includes(requiredFile)) {
      errors.push(`Missing app/projects/${slug}/${requiredFile}`);
    }
  }

  const shellFiles = files.filter((file) => file.endsWith("Shell.tsx"));
  const interactiveFiles = files.filter(
    (file) => file.endsWith("Interactive.tsx") && file !== "InteractiveSection.tsx",
  );

  if (shellFiles.length !== 1) {
    errors.push(
      `app/projects/${slug} must contain exactly one *Shell.tsx file. Found: ${shellFiles.length || "none"}`,
    );
  }

  if (interactiveFiles.length !== 1) {
    errors.push(
      `app/projects/${slug} must contain exactly one *Interactive.tsx file. Found: ${
        interactiveFiles.length || "none"
      }`,
    );
  }

  const pagePath = path.join(projectDir, "page.tsx");
  if (fs.existsSync(pagePath)) {
    const pageSource = readUtf8(pagePath);

    if (/^\s*["']use client["'];/m.test(pageSource)) {
      errors.push(`app/projects/${slug}/page.tsx must be a server component (remove "use client").`);
    }

    assertContains(pageSource, "<Hero", `app/projects/${slug}/page.tsx`);
    assertContains(pageSource, "<BlufPanel", `app/projects/${slug}/page.tsx`);
    assertContains(pageSource, "<RealSignalsPanel", `app/projects/${slug}/page.tsx`);
    assertContains(pageSource, "Shell", `app/projects/${slug}/page.tsx`);
    assertContains(pageSource, "InteractiveSection", `app/projects/${slug}/page.tsx`);
    assertContains(pageSource, "<AssumptionsDrawer", `app/projects/${slug}/page.tsx`);

    if (!/load[A-Za-z]+Payload/.test(pageSource)) {
      errors.push(`app/projects/${slug}/page.tsx must load payload server-side from lib/server/payloads.`);
    }

    if (/fetch\((["'`])\/data\//.test(pageSource)) {
      errors.push(`app/projects/${slug}/page.tsx cannot fetch /public/data on the client path.`);
    }

    if (/useValidatedJson/.test(pageSource)) {
      errors.push(`app/projects/${slug}/page.tsx references deprecated useValidatedJson.`);
    }
  }

  const interactiveSectionPath = path.join(projectDir, "InteractiveSection.tsx");
  if (fs.existsSync(interactiveSectionPath)) {
    const sectionSource = readUtf8(interactiveSectionPath);
    assertContains(sectionSource, "LazyInteractiveGate", `app/projects/${slug}/InteractiveSection.tsx`);
    assertContains(sectionSource, "dynamic(", `app/projects/${slug}/InteractiveSection.tsx`);
    assertContains(sectionSource, "ssr: false", `app/projects/${slug}/InteractiveSection.tsx`);
  }
}

for (const dir of discoveredProjectDirs) {
  if (!expectedProjectSlugs.includes(dir)) {
    warnings.push(`Found non-canonical project directory: app/projects/${dir}`);
  }
}

if (errors.length > 0) {
  console.error("[contracts:route] FAILED");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  if (warnings.length > 0) {
    console.error("[contracts:route] warnings:");
    for (const warning of warnings) {
      console.error(`- ${warning}`);
    }
  }
  process.exit(1);
}

console.log(`[contracts:route] PASS (${expectedProjectSlugs.length} project routes validated)`);
if (warnings.length > 0) {
  for (const warning of warnings) {
    console.warn(`[contracts:route] warn: ${warning}`);
  }
}
