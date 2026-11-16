import { expect, test } from "@playwright/test";

test("Groundwork Finance navigates and balances cash KPIs on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const templateCard = page.locator('[data-template-id="groundwork-finance"]');
  await expect(templateCard).toBeVisible();
  await templateCard.click();

  const preview = page.locator(".preview-stage .preview-viewport");
  await expect(page.getByRole("heading", { name: "Groundwork Finance" })).toBeVisible();
  await expect(preview.getByRole("heading", { name: /Good morning/ })).toBeVisible();
  await preview.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: /^Autopay$/ }).click();
  await expect(preview.getByRole("heading", { name: "Automatic payments" })).toBeVisible();

  await preview.getByRole("button", { name: "Overview", exact: true }).click();
  await page.getByRole("button", { name: "mobile preview" }).click();
  await page.setViewportSize({ width: 375, height: 844 });

  const kpis = preview.locator(".gw-welcome-metric");
  await expect(kpis).toHaveCount(3);
  const widths = await kpis.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
  const calendarCellWidth = await preview.locator(".gw-week-day").first().evaluate((element) => element.getBoundingClientRect().width);
  expect(calendarCellWidth).toBeGreaterThan(100);

  const overflow = await preview.locator(".groundwork-finance").evaluate((root) => ({
    content: root.scrollWidth,
    viewport: root.clientWidth
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport);
});
