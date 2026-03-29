import { expect, test } from "@playwright/test";

const recoverabilityRoutes = [
  {
    name: "ORD-LGA",
    path: "/projects/ord-lga-price-war",
    testId: "ordlga-route-probe",
  },
  {
    name: "Fraud Radar",
    path: "/projects/fraud-radar",
    testId: "fraud-route-probe",
  },
  {
    name: "Target Shrink",
    path: "/projects/target-shrink",
    testId: "shrink-route-probe",
  },
  {
    name: "Starbucks Pivot",
    path: "/projects/starbucks-pivot",
    testId: "starbucks-route-probe",
  },
  {
    name: "Tesla NACS",
    path: "/projects/tesla-nacs",
    testId: "ev-route-probe",
  },
  {
    name: "Netflix ROI",
    path: "/projects/netflix-roi",
    testId: "netflix-route-probe",
  },
] as const;

for (const route of recoverabilityRoutes) {
  test(`${route.name} routeProbe=error keeps route-specific recovery UI visible`, async ({ page }) => {
    await page.goto(`${route.path}?routeProbe=error`);

    const probe = page.getByTestId(route.testId);
    await expect(probe).toHaveAttribute("data-probe", "error");
    await expect(probe).toContainText(/Route Error/i);
    await expect(probe).toContainText(/Diagnostics/i);
    await expect(page.getByRole("link", { name: /Open live route/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to projects/i })).toBeVisible();
    await expect(page.getByText(/Application error/i)).toHaveCount(0);
  });
}
