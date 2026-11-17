import { expect, test } from "@playwright/test";

test("Focus Planner appears from metadata and keeps its theme and interaction functional", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /^Explore templates/ })).toBeVisible();

  const card = page.locator('[data-template-id="focus-planner"]');
  await expect(card).toBeVisible();
  await expect.poll(() => card.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await card.click();
  await expect(page.getByRole("heading", { name: "Focus Planner" })).toBeVisible();
  await expect(page.getByText("Productivity").first()).toBeVisible();
  await expect(page.getByText("React + Vite (tested)", { exact: true })).toBeVisible();

  await page.getByRole("combobox", { name: "Theme variant" }).click();
  await page.getByRole("option", { name: "Moss" }).click();
  await expect(page.locator("html")).toHaveAttribute("style", /--accent: 151 52% 38%/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  const preview = page.locator(".preview-stage .preview-viewport");
  await preview.getByRole("button", { name: "Add task" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Add a task" });
  await dialog.getByRole("textbox", { name: "Task name" }).fill("Prepare launch packet");
  await dialog.getByRole("button", { name: "Add task" }).click();
  await expect(preview.getByText("Prepare launch packet")).toBeVisible();
  await preview.getByRole("checkbox", { name: "Mark Prepare launch packet complete" }).click();
  await expect(preview.getByRole("tab", { name: "Done 2" })).toBeVisible();
  await page.getByRole("button", { name: "mobile preview" }).click();
  await expect(preview).toHaveCSS("width", "375px");
  await page.setViewportSize({ width: 375, height: 844 });
  const mobileLayout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    previewWidth: document.querySelector(".preview-stage .preview-viewport")!.getBoundingClientRect().width,
    contentWidth: document.querySelector(".preview-stage .preview-viewport")!.firstElementChild!.scrollWidth,
    contentClientWidth: document.querySelector(".preview-stage .preview-viewport")!.firstElementChild!.clientWidth
  }));
  expect(mobileLayout.documentWidth).toBeLessThanOrEqual(mobileLayout.viewportWidth);
  expect(mobileLayout.previewWidth).toBe(375);
  expect(mobileLayout.contentWidth).toBeLessThanOrEqual(mobileLayout.contentClientWidth);
});

test("running templates meet typography and responsive quality gates", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const cards = page.locator(".template-card");
  const count = await cards.count();

  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index);
    const templateName = (await card.locator("h3").textContent())?.trim();
    await card.click();
    await expect(page.getByRole("heading", { name: templateName! })).toBeVisible();
    const preview = page.locator(".preview-stage .preview-viewport");

    for (const { width, device } of [
      { width: 375, device: "mobile" },
      { width: 820, device: "tablet" },
      { width: 1366, device: "desktop" }
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.getByRole("button", { name: `${device} preview` }).click();
      await expect(preview.locator(".preview-missing")).toHaveCount(0);
      const metrics = await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>(".preview-stage .preview-viewport > *")!;
        const exempt = '[data-type-exempt="decorative"]';
        const violations = [...root.querySelectorAll<HTMLElement>("*")].flatMap((element) => {
          const hasText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
          const isControl = element.matches("input, textarea, select");
          if ((!hasText && !isControl) || element.closest(exempt)) return [];
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (style.display === "none" || style.visibility === "hidden" || !rect.width || !rect.height) return [];
          const size = Number.parseFloat(style.fontSize);
          return size < 12 ? [`${element.tagName.toLowerCase()}: ${size}px`] : [];
        });
        return {
          rootFontSize: Number.parseFloat(getComputedStyle(root).fontSize),
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          contentWidth: root.scrollWidth,
          rootWidth: root.clientWidth,
          violations
        };
      });
      expect(metrics.rootFontSize, `${templateName} body default at ${width}px`).toBe(14);
      expect(metrics.violations, `${templateName} text below 12px at ${width}px`).toEqual([]);
      expect(metrics.documentWidth, `${templateName} page overflow at ${width}px`).toBeLessThanOrEqual(metrics.viewportWidth);
      expect(metrics.contentWidth, `${templateName} content overflow at ${width}px`).toBeLessThanOrEqual(metrics.rootWidth);
    }

    await page.getByRole("button", { name: "All templates" }).click();
  }
});
