#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const rootDir = process.cwd();
const strict = process.argv.includes("--strict");
const strictWarn = process.argv.includes("--strict-warn");
const appHtmlRoot = path.join(rootDir, ".next", "server", "app");

const routeConfigs = [
  { route: "/", htmlPath: "index.html", htmlWarn: 110_000, htmlHard: 140_000, jsWarnGzip: 180_000, jsHardGzip: 240_000 },
  {
    route: "/projects",
    htmlPath: "projects.html",
    htmlWarn: 100_000,
    htmlHard: 140_000,
    jsWarnGzip: 200_000,
    jsHardGzip: 260_000,
  },
  {
    route: "/projects/ord-lga-price-war",
    htmlPath: "projects/ord-lga-price-war.html",
    htmlWarn: 140_000,
    htmlHard: 260_000,
    jsWarnGzip: 240_000,
    jsHardGzip: 340_000,
  },
  {
    route: "/projects/fraud-radar",
    htmlPath: "projects/fraud-radar.html",
    htmlWarn: 140_000,
    htmlHard: 260_000,
    jsWarnGzip: 240_000,
    jsHardGzip: 340_000,
  },
  {
    route: "/projects/target-shrink",
    htmlPath: "projects/target-shrink.html",
    htmlWarn: 140_000,
    htmlHard: 260_000,
    jsWarnGzip: 240_000,
    jsHardGzip: 340_000,
  },
  {
    route: "/projects/starbucks-pivot",
    htmlPath: "projects/starbucks-pivot.html",
    htmlWarn: 140_000,
    htmlHard: 260_000,
    jsWarnGzip: 240_000,
    jsHardGzip: 340_000,
  },
  {
    route: "/projects/tesla-nacs",
    htmlPath: "projects/tesla-nacs.html",
    htmlWarn: 140_000,
    htmlHard: 260_000,
    jsWarnGzip: 240_000,
    jsHardGzip: 340_000,
  },
  {
    route: "/projects/netflix-roi",
    htmlPath: "projects/netflix-roi.html",
    htmlWarn: 140_000,
    htmlHard: 260_000,
    jsWarnGzip: 240_000,
    jsHardGzip: 340_000,
  },
];

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function parseJsAssets(html) {
  const assets = new Set();
  const regex = /\/_next\/([^"'()\s>]+\.js)(?:\?[^"'()\s>]*)?/g;
  let match = regex.exec(html);
  while (match) {
    assets.add(match[1]);
    match = regex.exec(html);
  }
  return [...assets];
}

if (!fs.existsSync(appHtmlRoot)) {
  console.error("[perf] Missing .next/server/app build artifacts. Run `npm run build` first.");
  process.exit(1);
}

const warnings = [];
const failures = [];
const rows = [];

for (const config of routeConfigs) {
  const htmlFile = path.join(appHtmlRoot, config.htmlPath);
  if (!fs.existsSync(htmlFile)) {
    failures.push(`${config.route}: missing HTML artifact ${path.relative(rootDir, htmlFile)}`);
    continue;
  }

  const htmlBuffer = fs.readFileSync(htmlFile);
  const htmlBytes = htmlBuffer.byteLength;
  const jsAssets = parseJsAssets(htmlBuffer.toString("utf8"));

  let jsGzipBytes = 0;
  for (const asset of jsAssets) {
    const localAssetPath = path.join(rootDir, ".next", asset);
    if (!fs.existsSync(localAssetPath)) {
      warnings.push(`${config.route}: referenced missing asset .next/${asset}`);
      continue;
    }
    const contents = fs.readFileSync(localAssetPath);
    jsGzipBytes += zlib.gzipSync(contents).byteLength;
  }

  rows.push({
    route: config.route,
    htmlBytes,
    jsGzipBytes,
    htmlWarn: config.htmlWarn,
    htmlHard: config.htmlHard,
    jsWarnGzip: config.jsWarnGzip,
    jsHardGzip: config.jsHardGzip,
  });

  if (htmlBytes > config.htmlHard) {
    const message = `${config.route}: HTML ${formatBytes(htmlBytes)} exceeds hard budget ${formatBytes(config.htmlHard)}`;
    if (strict || strictWarn) {
      failures.push(message);
    } else {
      warnings.push(message);
    }
  } else if (htmlBytes > config.htmlWarn) {
    const message = `${config.route}: HTML ${formatBytes(htmlBytes)} exceeds warn budget ${formatBytes(config.htmlWarn)}`;
    if (strictWarn) {
      failures.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (jsGzipBytes > config.jsHardGzip) {
    const message = `${config.route}: initial JS(gzip) ${formatBytes(jsGzipBytes)} exceeds hard budget ${formatBytes(config.jsHardGzip)}`;
    if (strict || strictWarn) {
      failures.push(message);
    } else {
      warnings.push(message);
    }
  } else if (jsGzipBytes > config.jsWarnGzip) {
    const message = `${config.route}: initial JS(gzip) ${formatBytes(jsGzipBytes)} exceeds warn budget ${formatBytes(config.jsWarnGzip)}`;
    if (strictWarn) {
      failures.push(message);
    } else {
      warnings.push(message);
    }
  }
}

console.log("[perf] Route budgets (HTML raw + inferred initial JS gzip)");
for (const row of rows) {
  console.log(
    `- ${row.route} :: html=${formatBytes(row.htmlBytes)} (warn ${formatBytes(row.htmlWarn)}, hard ${formatBytes(
      row.htmlHard,
    )}) | js(gzip)=${formatBytes(row.jsGzipBytes)} (warn ${formatBytes(
      row.jsWarnGzip,
    )}, hard ${formatBytes(row.jsHardGzip)})`,
  );
}

if (warnings.length > 0) {
  console.warn("[perf] WARNINGS");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (failures.length > 0) {
  console.error("[perf] FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("[perf] PASS");
