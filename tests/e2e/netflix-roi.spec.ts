import { expect, test } from "@playwright/test";

async function setRangeValue(page: import("@playwright/test").Page, label: string, value: number) {
  const slider = page
    .locator("label")
    .filter({ hasText: label })
    .locator('input[type="range"]')
    .first();

  await expect(slider).toBeVisible();
  await slider.evaluate((input, nextValue) => {
    const element = input as HTMLInputElement;
    element.value = String(nextValue);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

test.describe("Netflix ROI route", () => {
  test("mounts the allocation committee controls and updates visible decision outputs", async ({ page }) => {
    await page.goto("/projects/netflix-roi");

    const gate = page.getByTestId("lazy-interactive-gate");
    await gate.scrollIntoViewIfNeeded();
    await expect(gate).toHaveAttribute("data-state", "active");
    await expect(page.getByText("Committee Decision Packet")).toBeVisible();
    await expect(page.getByText("Selected Title Board")).toBeVisible();

    const rankingReadout = page.locator("section").filter({ hasText: "Ranking readout" }).first();
    await expect(rankingReadout).toContainText("Grey’s: Rewatch Effect (Synthetic)");

    await setRangeValue(page, "Retention priority", 100);
    await expect(rankingReadout).toContainText("The Residence");

    await page.locator('button[title="The Residence"]').click();

    const selectedTitleBoard = page.locator("section").filter({ hasText: "Selected Title Board" }).first();
    await expect(selectedTitleBoard).toContainText("Title:");
    await expect(selectedTitleBoard).toContainText("The Residence");

    const modeledCommitteeOutput = page.getByTestId("decision-console").filter({
      hasText: "Modeled committee output",
    });
    await expect(modeledCommitteeOutput).toContainText(/Capital recommendation/i);
    await expect(modeledCommitteeOutput).toContainText(/Predicted adds \/ retention/i);
  });

  test("renders distinct recoverable loading and error probe states", async ({ page }) => {
    await page.goto("/projects/netflix-roi?routeProbe=loading");
    const loadingProbe = page.getByTestId("netflix-route-probe");
    await expect(loadingProbe).toHaveAttribute("data-probe", "loading");
    await expect(loadingProbe).toContainText(/Recoverability probe active/i);
    await expect(page.getByRole("link", { name: /Open live route/i })).toBeVisible();

    await page.goto("/projects/netflix-roi?routeProbe=error");
    const errorProbe = page.getByTestId("netflix-route-probe");
    await expect(errorProbe).toHaveAttribute("data-probe", "error");
    await expect(errorProbe).toContainText(/Diagnostics/i);
    await expect(page.getByRole("link", { name: /Back to projects/i })).toBeVisible();
  });
});
