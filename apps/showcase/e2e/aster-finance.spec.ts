import { expect, test } from "@playwright/test";

test("Aster Finance appears from registry and supports pricing and signup interactions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const card = page.locator('[data-template-id="aster-finance"]');
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.getByRole("heading", { name: "Aster Finance" })).toBeVisible();

  const preview = page.locator(".preview-stage .preview-viewport");
  await expect(preview.locator(".aster-finance")).toBeVisible();
  await expect(preview.getByRole("heading", { name: "Make room for what matters." })).toBeVisible();
  await preview.getByRole("button", { name: /Yearly/ }).click();
  await expect(preview.getByText("$15", { exact: true })).toBeVisible();
  await preview.getByRole("button", { name: "Choose Everyday" }).click();

  const signup = page.getByRole("dialog", { name: "Take your first step with Aster" });
  await expect(signup).toContainText("Everyday sample plan");
  await signup.getByRole("textbox", { name: "Your name" }).fill("Ada Morgan");
  await signup.getByRole("textbox", { name: "Email address" }).fill("ada@example.test");
  await signup.getByRole("button", { name: "Continue with Everyday" }).click();
  await expect(page.getByText("Thanks, Ada", { exact: true })).toBeVisible();
});

test("Aster Finance reflows at mobile, tablet, and desktop widths", async ({ page }) => {
  for (const width of [375, 820, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?template-preview=aster-finance&theme=light&accent=224%2082%25%2056%25");
    const landing = page.locator(".aster-finance");
    await expect(landing).toBeVisible();

    const metrics = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>(".af-hero h1")!;
      const body = document.querySelector<HTMLElement>(".af-feature-card .ui-card-header > p")!;
      const button = document.querySelector<HTMLElement>(".af-nav-cta")!;
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        heroSize: Number.parseFloat(getComputedStyle(hero).fontSize),
        bodySize: Number.parseFloat(getComputedStyle(body).fontSize),
        buttonSize: Number.parseFloat(getComputedStyle(button).fontSize),
        smallestVisibleText: (() => {
          const walker = document.createTreeWalker(document.querySelector(".aster-finance")!, NodeFilter.SHOW_TEXT);
          const sizes: number[] = [];
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent?.trim()) continue;
            const element = walker.currentNode.parentElement;
            if (!element || !element.getClientRects().length) continue;
            const style = getComputedStyle(element);
            if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
            sizes.push(Number.parseFloat(style.fontSize));
          }
          return Math.min(...sizes);
        })()
      };
    });

    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
    expect(metrics.heroSize).toBeGreaterThanOrEqual(40);
    expect(metrics.heroSize).toBeLessThanOrEqual(48);
    expect(metrics.bodySize).toBeGreaterThanOrEqual(14);
    expect(metrics.buttonSize).toBeGreaterThanOrEqual(14);
    expect(metrics.smallestVisibleText).toBeGreaterThanOrEqual(12);

    if (width === 375) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Pricing" })).toBeVisible();
      await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Pricing" }).click();
      await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
    }
  }
});
