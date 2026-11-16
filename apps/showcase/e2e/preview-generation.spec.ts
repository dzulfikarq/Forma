import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

test("capture desktop and mobile previews from the running template", async ({ page }) => {
  const templateId = process.env.PREVIEW_TEMPLATE_ID;
  test.skip(!templateId, "Run pnpm template:preview to capture template previews.");
  if (!templateId) return;

  const outputDirectory = process.env.PREVIEW_OUTPUT_DIR;
  if (!outputDirectory) throw new Error("PREVIEW_OUTPUT_DIR is required.");
  await mkdir(outputDirectory, { recursive: true });
  await page.setViewportSize({ width: 1366, height: 1000 });
  const accent = process.env.PREVIEW_ACCENT ?? "24 95% 53%";
  const query = new URLSearchParams({ "template-preview": templateId, accent, theme: process.env.PREVIEW_THEME === "light" ? "light" : "dark" });
  await page.goto(`/?${query.toString()}`);

  const preview = page.locator(`[data-template-preview-id="${templateId}"]`);
  await expect(preview).toBeVisible();
  await expect(preview.getByText("Loading template preview")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(outputDirectory, "preview.png"), fullPage: true, animations: "disabled", caret: "hide" });

  await page.setViewportSize({ width: 375, height: 844 });
  await page.screenshot({ path: path.join(outputDirectory, "preview-mobile.png"), fullPage: true, animations: "disabled", caret: "hide" });
});
