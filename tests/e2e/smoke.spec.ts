import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/projects",
  "/projects/ord-lga-price-war",
  "/projects/fraud-radar",
  "/projects/target-shrink",
  "/projects/starbucks-pivot",
  "/projects/tesla-nacs",
  "/projects/netflix-roi",
] as const;

for (const route of routes) {
  test(`smoke: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
      if (msg.type() === "warning") warnings.push(msg.text());
    });

    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveTitle(/Vaibhav Bapat|Projects|Simulator|Radar|Pivot|War Game|Autopsy|Resume/i);

    // Keep above-the-fold media lightweight by avoiding autoplay video heroes.
    await expect(page.locator("video[autoplay]")).toHaveCount(0);

    if (route.startsWith("/projects/") && route !== "/projects") {
      await expect(page.getByText("Feed Coverage & Provenance")).toBeVisible();
      await expect(page.getByText(/SSR Preview/i)).toHaveCount(0);
      await expect(page.getByTestId("annotation-rail").first()).toBeVisible();

      const gate = page.getByTestId("lazy-interactive-gate");
      if ((await gate.count()) > 0) {
        await expect(gate).toBeVisible();
        await expect(gate).toHaveAttribute("data-state", /idle|active/);
        await gate.scrollIntoViewIfNeeded();
        await expect(gate).toHaveAttribute("data-state", /active/);
      } else {
        await expect(
          page.getByText(/Scenario|Decision|Simulator|Workbench|Sandbox|Portfolio/i).first(),
        ).toBeVisible();
      }

      await expect(page.getByTestId("primary-chart").first()).toBeVisible();
      await expect(page.getByTestId("decision-console").first()).toBeVisible();

      if (route === "/projects/ord-lga-price-war") {
        const decisionConsole = page.getByTestId("decision-console").last();
        await decisionConsole.scrollIntoViewIfNeeded();
        await expect(decisionConsole).toContainText(/Policy guardrails/i);
        await expect(decisionConsole).toContainText(/Lift CI/i);
      }
    }

    // Charts mount client-side; just ensure no fatal console errors.
    expect(errors.join("\n")).not.toMatch(/ReferenceError|TypeError|Hydration|didn't match/i);
    expect(warnings.join("\n")).not.toMatch(/Hydration|didn't match server/i);
  });
}
