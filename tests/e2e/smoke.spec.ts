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
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveTitle(/Vaibhav Bapat|Projects|Simulator|Radar|Pivot|War Game|Autopsy|Resume/i);
    if (route.startsWith("/projects/") && route !== "/projects") {
      await expect(page.getByText("Data Integrity")).toBeVisible();
    }

    // Charts mount client-side; just ensure no fatal console errors.
    expect(errors.join("\n")).not.toMatch(/ReferenceError|TypeError|Hydration/i);
  });
}
