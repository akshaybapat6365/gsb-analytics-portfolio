#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const scanRoots = ["app", "components", "lib"];
const errors = [];

const bannedFilePaths = ["lib/data/useValidatedJson.ts", "components/projects/StoryVisual.tsx"];
const bannedPatterns = [
  { regex: /\buseValidatedJson\b/, reason: "deprecated client payload fetch helper" },
  { regex: /fetch\((["'`])\/data\//, reason: "client fetch to /public/data should not be used for primary payloads" },
];

function walkFiles(absDir, out) {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue;
    }
    const fullPath = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, out);
      continue;
    }
    if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      out.push(fullPath);
    }
  }
}

for (const relPath of bannedFilePaths) {
  if (fs.existsSync(path.join(rootDir, relPath))) {
    errors.push(`Deprecated file still present: ${relPath}`);
  }
}

const sourceFiles = [];
for (const root of scanRoots) {
  const abs = path.join(rootDir, root);
  if (fs.existsSync(abs)) {
    walkFiles(abs, sourceFiles);
  }
}

for (const filePath of sourceFiles) {
  const rel = path.relative(rootDir, filePath);
  const source = fs.readFileSync(filePath, "utf8");

  for (const { regex, reason } of bannedPatterns) {
    if (regex.test(source)) {
      errors.push(`${rel}: matches banned pattern (${reason})`);
    }
  }

  if (rel.startsWith(path.join("app", "projects")) && rel.endsWith(path.join("page.tsx"))) {
    if (/from\s+["']\.\/[A-Za-z]+Client["']/.test(source)) {
      errors.push(
        `${rel}: imports legacy *Client directly; route page should use *Shell + *InteractiveSection.`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("[contracts:dead-paths] FAILED");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`[contracts:dead-paths] PASS (${sourceFiles.length} TS/TSX files scanned)`);
