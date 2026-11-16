import { expect, test } from "@playwright/test";

test("Ledgerline Finance supports local entries and responsive budget board", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const templateCard = page.locator('[data-template-id="ledgerline-finance"]');
  await expect(templateCard).toBeVisible();
  await templateCard.click();

  const preview = page.locator(".preview-stage .preview-viewport");
  await expect(page.getByRole("heading", { name: "Ledgerline Finance" })).toBeVisible();
  await expect(preview.getByRole("heading", { name: "Financial overview" })).toBeVisible();
  await expect(preview.locator(".ll-board-lane")).toHaveCount(4);
  await preview.getByRole("button", { name: "Collapse sidebar" }).click();
  await preview.getByRole("button", { name: "Expand sidebar" }).click();

  const download = page.waitForEvent("download");
  await preview.getByRole("button", { name: "Export" }).click();
  expect((await download).suggestedFilename()).toBe("ledgerline-sample-transactions.csv");

  await preview.getByRole("button", { name: "Add transaction" }).click();
  const dialog = page.getByRole("dialog", { name: "Add a transaction" });
  await dialog.getByRole("textbox", { name: "Description" }).fill("Harbor Bookshop");
  await dialog.getByRole("spinbutton", { name: "Amount" }).fill("28.50");
  await dialog.getByRole("button", { name: "Add transaction" }).click();
  const newEntry = preview.getByRole("button", { name: "Open Harbor Bookshop details" });
  await expect(newEntry).toBeVisible();
  await newEntry.click();
  const details = page.getByRole("dialog", { name: "Harbor Bookshop" });
  await details.getByRole("combobox", { name: "Status" }).click();
  await page.getByRole("option", { name: "Cleared" }).click();
  await details.getByRole("button", { name: "Save status" }).click();
  await expect(newEntry).toBeVisible();

  await page.getByRole("button", { name: "mobile preview" }).click();
  await page.setViewportSize({ width: 375, height: 844 });
  const dimensions = await preview.locator(".ledgerline-finance").evaluate((root) => ({
    width: root.scrollWidth,
    clientWidth: root.clientWidth,
    kpis: [...root.querySelectorAll<HTMLElement>(".ll-metric-card")].map((card) => card.getBoundingClientRect().width)
  }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.kpis).toHaveLength(3);
  expect(Math.max(...dimensions.kpis) - Math.min(...dimensions.kpis)).toBeLessThanOrEqual(1);
});
