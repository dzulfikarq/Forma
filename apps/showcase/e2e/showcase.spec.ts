import { expect, test } from "@playwright/test";

test("gallery, live preview, theme variants, and responsive navigation work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Explore templates 1" })).toBeVisible();
  await page.getByRole("button", { name: /Modern Admin/ }).click();
  await expect(page.getByRole("heading", { name: "Modern Admin" })).toBeVisible();
  await expect(page.locator(".preview-viewport").getByRole("heading", { name: "Heartwell today" })).toBeVisible();
  await page.getByRole("button", { name: "Violet accent" }).click();
  await expect(page.locator("html")).toHaveAttribute("style", /--accent: 263 83% 62%/);
  const dashboard = page.locator(".preview-viewport");
  await page.keyboard.press("Control+k");
  await expect(dashboard.getByRole("textbox", { name: "Search orders" })).toBeFocused();
  await dashboard.getByRole("button", { name: "Sales", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await dashboard.getByRole("button", { name: "Export CSV" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("sales-by-channel.csv");
  await dashboard.getByRole("button", { name: "Overview" }).click();
  await page.getByRole("button", { name: "mobile preview" }).click();
  const mobileWidths = await page.locator(".preview-viewport").evaluate((viewport) => {
    const shell = viewport.querySelector<HTMLElement>(".admin-shell")!;
    return { shell: shell.clientWidth, content: shell.querySelector<HTMLElement>(".overview-primary")!.clientWidth, cards: shell.querySelector<HTMLElement>(".stat-grid")!.clientWidth };
  });
  expect(mobileWidths.cards).toBeLessThanOrEqual(mobileWidths.content);
  await page.screenshot({ path: "test-results/modern-admin-mobile.png", fullPage: true });
  await expect(page.getByText(/mobile · 390px/)).toBeVisible();
  await page.getByRole("button", { name: "All templates" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Explore templates 1" })).toBeVisible();
  await page.screenshot({ path: "test-results/showcase-mobile.png", fullPage: true });
});
