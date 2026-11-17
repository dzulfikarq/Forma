import { expect, test } from "@playwright/test";

test("Closing Desk appears from registry and supports inbox send/undo responsively", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const card = page.locator('[data-template-id="closing-desk"]');
  await expect(card).toBeVisible();
  await expect.poll(() => card.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await card.click();

  const preview = page.locator(".preview-stage .preview-viewport");
  const workspace = preview.locator(".closing-desk");
  await expect(workspace.getByRole("heading", { name: "Good morning, Laura" })).toBeVisible();
  await expect(workspace.locator(".closing-brand-mark")).toHaveCSS("width", "36px");
  await expect(workspace.locator(".closing-brand-mark svg")).toHaveCSS("width", "20px");
  await expect(workspace.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: /^Home/ }).locator("svg")).toHaveCSS("width", "20px");
  await expect(workspace.getByRole("button", { name: "Search workspace" }).locator("svg")).toHaveCSS("width", "18px");
  await workspace.getByRole("button", { name: "Review inbox", exact: true }).click();
  await expect(workspace.getByRole("heading", { name: "Inbox" })).toBeVisible();
  await workspace.getByRole("button", { name: "Send to Sophia" }).click();
  await expect(workspace.getByRole("button", { name: "Undo" })).toBeVisible();
  await workspace.getByRole("button", { name: "Undo" }).click();
  await expect(workspace.getByText("6 things need you. Agents settled 47 others overnight.")).toBeVisible();

  await page.getByRole("button", { name: "mobile preview" }).click();
  await page.setViewportSize({ width: 375, height: 844 });
  await expect(workspace.getByRole("heading", { name: "Good morning, Laura" })).toBeVisible();
  await expect(workspace.locator(".closing-brand-mark")).toHaveCSS("width", "32px");
  await expect(workspace.getByRole("button", { name: "Open workspace navigation" }).locator("svg")).toHaveCSS("width", "18px");
  await workspace.getByRole("button", { name: "Review inbox", exact: true }).click();
  await expect(workspace.getByRole("heading", { name: "Inbox" })).toBeVisible();
  const mobile = await workspace.evaluate((root) => ({
    width: root.clientWidth,
    contentWidth: root.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));
  expect(mobile.width).toBeLessThanOrEqual(375);
  expect(mobile.width).toBeGreaterThan(350);
  expect(mobile.contentWidth).toBeLessThanOrEqual(mobile.width);
  expect(mobile.documentWidth).toBeLessThanOrEqual(mobile.viewportWidth);
});

test("Closing Desk uses responsive navigation at tablet width", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 900 });
  await page.goto("/?template-preview=closing-desk&theme=light");
  const workspace = page.locator(".closing-desk");
  await expect(workspace.getByRole("heading", { name: "Good morning, Laura" })).toBeVisible();
  await expect(workspace.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();
  await workspace.getByRole("button", { name: "Open workspace navigation" }).click();
  const navigation = page.getByRole("dialog", { name: "Navigation" });
  await expect(navigation).toBeVisible();
  await navigation.getByRole("button", { name: "Calendar" }).click();
  await expect(workspace.getByRole("heading", { name: "Calendar" })).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 820);
});
