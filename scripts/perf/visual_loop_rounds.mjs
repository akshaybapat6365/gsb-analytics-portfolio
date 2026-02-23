#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const roundsArg = args.find((arg) => arg.startsWith("--rounds="));
const baseArg = args.find((arg) => arg.startsWith("--base-url="));
const strict = args.includes("--strict");
const rounds = Math.max(1, Number.parseInt(roundsArg?.split("=")[1] ?? "10", 10) || 10);
const baseUrl = (baseArg?.split("=")[1] ?? "http://localhost:3401").replace(/\/$/, "");
const ts = new Date().toISOString().replaceAll(":", "-");
const outputDir = path.join(process.cwd(), "tmp", "visual-loops", ts);
const minStrictScore = 80;

const routes = [
  "/",
  "/projects",
  "/projects/ord-lga-price-war",
  "/projects/fraud-radar",
  "/projects/target-shrink",
  "/projects/starbucks-pivot",
  "/projects/tesla-nacs",
  "/projects/netflix-roi",
];

const viewports = [
  { name: "desktop", width: 1600, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

function safeName(route) {
  return route === "/" ? "home" : route.replaceAll("/", "_").replace(/^_+/, "");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function avg(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreRound(route, diagnostics, consoleErrors) {
  const failures = [];
  const scores = {
    readabilityScore: 100,
    affordanceScore: 100,
    evidenceScore: 100,
    chartClarityScore: 100,
  };

  if (diagnostics.h1.length === 0) {
    failures.push("missing_h1");
    scores.readabilityScore -= 50;
  }

  if (diagnostics.loadingTextVisible) {
    failures.push("loading_persisted");
    scores.readabilityScore -= 30;
    scores.affordanceScore -= 20;
  }

  if (consoleErrors.length > 0) {
    failures.push("console_error");
    scores.affordanceScore -= 35;
    scores.chartClarityScore -= 15;
  }

  if (diagnostics.chartCount === 0) {
    failures.push("missing_chart_primitives");
    scores.chartClarityScore -= 70;
  }

  const fontFloor = route === "/" ? 12 : route === "/projects" ? 11 : 10;
  if (diagnostics.minFunctionalFontPx < fontFloor) {
    if (route === "/" && diagnostics.minFunctionalFontPx < 11) {
      failures.push("small_functional_text");
    }
    scores.readabilityScore -= route === "/" ? 15 : 4;
  }

  if (route === "/" && diagnostics.heroCopyLeftFirst === false) {
    failures.push("hero_hierarchy_order");
    scores.readabilityScore -= 20;
  }

  if (route === "/" && diagnostics.kpiValueMaxPx < 38) {
    failures.push("kpi_anchor_too_small");
    scores.readabilityScore -= 25;
  }

  if (route === "/" && diagnostics.cardCtaCount < 6) {
    failures.push("weak_card_affordance");
    scores.affordanceScore -= 35;
  }

  if (route === "/" && diagnostics.evidenceBadgeCount < 6) {
    failures.push("missing_evidence_badges");
    scores.evidenceScore -= 45;
  }

  if (route === "/" && diagnostics.provenanceCount < 6) {
    failures.push("missing_provenance_rows");
    scores.evidenceScore -= 30;
  }

  if (route === "/" && diagnostics.chartAxisCount < 2) {
    failures.push("weak_chart_axis_semantics");
    scores.chartClarityScore -= 30;
  }

  if (route === "/" && diagnostics.chartLegendCount < 3) {
    failures.push("missing_chart_legend");
    scores.chartClarityScore -= 25;
  }

  if (route.startsWith("/projects/") && route !== "/projects" && !diagnostics.dataIntegrityVisible) {
    failures.push("data_integrity_missing");
    scores.evidenceScore -= 50;
  }

  Object.entries(scores).forEach(([name, value]) => {
    if (strict && value < minStrictScore) {
      failures.push(`strict_score_failed:${name}`);
    }
  });

  return {
    scores,
    failures: Array.from(new Set(failures)),
  };
}

async function run() {
  ensureDir(outputDir);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const report = {
    baseUrl,
    rounds,
    strict,
    generatedAt: new Date().toISOString(),
    routes: [],
  };

  try {
    for (const route of routes) {
      const routeName = safeName(route);
      const routeDir = path.join(outputDir, routeName);
      ensureDir(routeDir);
      const routeResult = {
        route,
        rounds: [],
      };

      for (let round = 1; round <= rounds; round += 1) {
        const consoleErrors = [];
        const onConsole = (msg) => {
          if (msg.type() === "error") {
            consoleErrors.push(msg.text());
          }
        };

        page.on("console", onConsole);
        const url = `${baseUrl}${route}`;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await wait(route === "/" ? 3500 : 2800);
        await page.setViewportSize({ width: 1600, height: 1024 });
        await wait(120);

        const diagnostics = await page.evaluate((activeRoute) => {
          const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
          const chartCount = document.querySelectorAll("svg, canvas").length;
          const loadingTextVisible = Array.from(document.querySelectorAll("*")).some((el) => {
            const text = (el.textContent ?? "").trim();
            return text === "Loading" || text === "Loading..." || text === "Loading…";
          });

          const functionalNodes = Array.from(
            document.querySelectorAll("p,button,a,label,li,span"),
          );
          const fontSizes = functionalNodes
            .filter((node) => {
              const text = (node.textContent ?? "").trim();
              if (text.length < 3) return false;
              const style = window.getComputedStyle(node);
              const rect = node.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.visibility !== "hidden" &&
                style.display !== "none" &&
                Number.parseFloat(style.opacity || "1") > 0
              );
            })
            .map((node) => Number.parseFloat(window.getComputedStyle(node).fontSize))
            .filter((value) => Number.isFinite(value) && value > 0);

          const minFunctionalFontPx = fontSizes.length ? Math.min(...fontSizes) : 0;

          const kpiSizes = Array.from(document.querySelectorAll(".kpi-card"))
            .map((card) => {
              const candidates = Array.from(card.querySelectorAll("*"))
                .filter((node) => /\d/.test(node.textContent ?? ""))
                .map((node) => Number.parseFloat(window.getComputedStyle(node).fontSize))
                .filter((value) => Number.isFinite(value));
              return candidates.length ? Math.max(...candidates) : 0;
            })
            .filter((value) => value > 0);
          const kpiValueMaxPx = kpiSizes.length ? Math.max(...kpiSizes) : 0;

          const heroCopy = document.querySelector("[data-hero-copy]");
          const signalBoard = document.querySelector("[data-signal-board]");
          let heroCopyLeftFirst = true;
          if (heroCopy && signalBoard) {
            const heroRect = heroCopy.getBoundingClientRect();
            const signalRect = signalBoard.getBoundingClientRect();
            heroCopyLeftFirst = heroRect.left <= signalRect.left;
          }

          const evidenceBadgeCount = document.querySelectorAll("[data-evidence-badge]").length;
          const provenanceCount = document.querySelectorAll("[data-provenance-row]").length;
          const cardCtaCount = document.querySelectorAll("[data-card-cta]").length;
          const chartAxisCount = document.querySelectorAll("[data-chart-axis]").length;
          const chartLegendCount = document.querySelectorAll("[data-chart-legend]").length;
          const dataIntegrityVisible =
            !activeRoute.startsWith("/projects/") ||
            activeRoute === "/projects" ||
            /Feed Coverage & Provenance|Data Integrity/i.test(document.body.innerText);

          return {
            h1,
            chartCount,
            loadingTextVisible,
            title: document.title,
            minFunctionalFontPx,
            kpiValueMaxPx,
            heroCopyLeftFirst,
            evidenceBadgeCount,
            provenanceCount,
            cardCtaCount,
            chartAxisCount,
            chartLegendCount,
            dataIntegrityVisible,
          };
        }, route);

        const screenshots = [];
        for (const viewport of viewports) {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await wait(180);
          const shotName = `round-${String(round).padStart(2, "0")}-${viewport.name}.png`;
          const shotPath = path.join(routeDir, shotName);
          await page.screenshot({ path: shotPath, fullPage: false });
          screenshots.push(shotPath);
        }

        page.off("console", onConsole);
        const analysis = scoreRound(route, diagnostics, consoleErrors);

        routeResult.rounds.push({
          round,
          url,
          diagnostics,
          scores: analysis.scores,
          failures: analysis.failures,
          screenshotPaths: screenshots.map((shotPath) => path.relative(process.cwd(), shotPath)),
          consoleErrors,
          pass: analysis.failures.length === 0,
        });
      }

      report.routes.push(routeResult);
    }
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  const allRounds = report.routes.flatMap((route) => route.rounds);
  const failedRounds = allRounds.filter((round) => !round.pass);
  const failedReasonsByType = {};
  for (const round of failedRounds) {
    for (const failure of round.failures) {
      failedReasonsByType[failure] = (failedReasonsByType[failure] ?? 0) + 1;
    }
  }

  const summary = {
    totalRounds: allRounds.length,
    failedRounds: failedRounds.length,
    failedReasonsByType,
    averageScores: {
      readabilityScore: Number(avg(allRounds.map((round) => round.scores.readabilityScore)).toFixed(2)),
      affordanceScore: Number(avg(allRounds.map((round) => round.scores.affordanceScore)).toFixed(2)),
      evidenceScore: Number(avg(allRounds.map((round) => round.scores.evidenceScore)).toFixed(2)),
      chartClarityScore: Number(avg(allRounds.map((round) => round.scores.chartClarityScore)).toFixed(2)),
    },
  };

  const reportPath = path.join(outputDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ ...report, summary }, null, 2));

  console.log(`[visual-loop] output=${path.relative(process.cwd(), outputDir)}`);
  console.log(`[visual-loop] rounds=${summary.totalRounds} failed=${summary.failedRounds}`);
  console.log(`[visual-loop] averages=${JSON.stringify(summary.averageScores)}`);

  if (summary.failedRounds > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("[visual-loop] failed", error);
  process.exit(1);
});
