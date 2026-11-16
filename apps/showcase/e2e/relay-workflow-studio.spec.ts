import { expect, test } from "@playwright/test";

test("Relay Workflow Studio runs locally and meets responsive preview checks", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1000 });
  await page.goto("/");
  const card = page.locator('[data-template-id="relay-workflow-studio"]');
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.getByRole("heading", { name: "Relay Workflow Studio" })).toBeVisible();

  const preview = page.locator(".preview-stage .preview-viewport");
  const workspace = preview.locator(".relay-workflow-studio");
  await expect(workspace).toBeVisible();
  await preview.getByRole("button", { name: "Run now" }).click();
  await expect(preview.getByText("Test run completed")).toBeVisible();

  for (const { width, device } of [
    { width: 375, device: "mobile" },
    { width: 820, device: "tablet" },
    { width: 1366, device: "desktop" }
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole("button", { name: `${device} preview` }).click();
    const metrics = await workspace.evaluate((root) => ({
      fontSize: getComputedStyle(root).fontSize,
      contentWidth: root.scrollWidth,
      rootWidth: root.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    }));
    expect(metrics.fontSize, `body default at ${width}px`).toBe("14px");
    expect(metrics.contentWidth, `template overflow at ${width}px`).toBeLessThanOrEqual(metrics.rootWidth);
    expect(metrics.documentWidth, `page overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewportWidth);
  }
});
