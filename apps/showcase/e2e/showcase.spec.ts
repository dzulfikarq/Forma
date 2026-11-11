import { expect, test } from "@playwright/test";

test("gallery, live preview, theme variants, and responsive navigation work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Explore templates 2" })).toBeVisible();
  await page.getByRole("button", { name: /Modern Admin/ }).click();
  await expect(page.getByRole("heading", { name: "Modern Admin" })).toBeVisible();
  await expect(page.locator(".preview-viewport").getByRole("heading", { name: "Heartwell today" })).toBeVisible();
  const detailTypography = await page.evaluate(() => {
    const fontSize = (selector: string) => Number.parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize);
    return {
      heading: fontSize(".detail-sidebar h1"),
      description: fontSize(".detail-description"),
      metadataLabel: fontSize(".detail-metadata span"),
      metadataValue: fontSize(".detail-metadata b"),
      previewSearch: fontSize(".preview-viewport .global-search input"),
    };
  });
  expect(detailTypography.heading).toBe(24);
  expect(detailTypography.description).toBe(14);
  expect(detailTypography.metadataLabel).toBe(13);
  expect(detailTypography.metadataValue).toBe(14);
  expect(detailTypography.previewSearch).toBe(14);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/detail-1440.png" });
  await page.getByRole("button", { name: "Open large preview" }).click();
  await expect(page.getByRole("dialog", { name: "Modern Admin preview" })).toBeVisible();
  await page.screenshot({ path: "test-results/preview-expanded-1440.png", animations: "disabled" });
  await page.getByRole("button", { name: "Close dialog" }).click();
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
  await page.getByRole("button", { name: "Open large preview" }).click();
  await expect(page.getByRole("dialog", { name: "Modern Admin preview" })).toBeVisible();
  await expect(page.getByRole("dialog").locator(".preview-viewport")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  const mobileWidths = await page.locator(".preview-viewport").evaluate((viewport) => {
    const shell = viewport.querySelector<HTMLElement>(".admin-shell")!;
    return { shell: shell.clientWidth, content: shell.querySelector<HTMLElement>(".overview-primary")!.clientWidth, cards: shell.querySelector<HTMLElement>(".stat-grid")!.clientWidth };
  });
  expect(mobileWidths.cards).toBeLessThanOrEqual(mobileWidths.content);
  await page.screenshot({ path: "test-results/modern-admin-mobile.png", fullPage: true });
  await expect(page.getByText(/mobile · 375px/)).toBeVisible();
  await page.getByRole("button", { name: "All templates" }).click();
  await page.setViewportSize({ width: 375, height: 844 });
  await expect(page.getByRole("heading", { name: "Explore templates 2" })).toBeVisible();
  await page.screenshot({ path: "test-results/showcase-mobile.png", fullPage: true });
});

test("typography and gallery layout stay readable at target widths", async ({ page }) => {
  await page.goto("/");

  for (const width of [375, 820, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const metrics = await page.evaluate(() => {
      const fontSize = (selector: string) => Number.parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize);
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        hero: fontSize(".hero-copy h1"),
        nav: fontSize(".header-links button"),
        input: fontSize("#template-search"),
        category: fontSize(".category-filters button"),
        cardTitle: fontSize(".template-card-title h3"),
        cardDescription: fontSize(".template-card-info > p"),
        badge: fontSize(".preview-version"),
        footer: fontSize(".showcase-footer"),
        cardWidth: document.querySelector(".template-card")!.getBoundingClientRect().width,
        gridWidth: document.querySelector(".template-grid")!.getBoundingClientRect().width,
      };
    });

    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
    expect(metrics.hero).toBeGreaterThanOrEqual(width < 640 ? 36 : 40);
    expect(metrics.hero).toBeLessThanOrEqual(48);
    expect(metrics.nav).toBeGreaterThanOrEqual(14);
    expect(metrics.input).toBeGreaterThanOrEqual(14);
    expect(metrics.category).toBeGreaterThanOrEqual(13);
    expect(metrics.cardTitle).toBe(18);
    expect(metrics.cardDescription).toBeGreaterThanOrEqual(14);
    expect(metrics.badge).toBeGreaterThanOrEqual(12);
    expect(metrics.footer).toBeGreaterThanOrEqual(12);
    expect(metrics.cardWidth).toBeGreaterThan(width <= 640 ? 320 : 300);
    const columns = width <= 640 ? 1 : width <= 1100 ? 2 : 3;
    const cardShare = metrics.cardWidth / metrics.gridWidth;
    expect(cardShare).toBeGreaterThan(1 / columns - 0.05);
    expect(cardShare).toBeLessThan(1 / columns + 0.02);
    await page.screenshot({ path: `test-results/showcase-${width}.png`, fullPage: true });
  }
});

test("components page uses shared readable typography", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Components" }).click();

  const metrics = await page.evaluate(() => {
    const fontSize = (selector: string) => Number.parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize);
    return {
      pageHeading: fontSize(".component-heading h1"),
      cardTitle: fontSize(".component-grid .ui-card-title"),
      cardDescription: fontSize(".component-grid .ui-card-header > p"),
      button: fontSize(".component-row .ui-button"),
    };
  });

  expect(metrics.pageHeading).toBe(24);
  expect(metrics.cardTitle).toBe(18);
  expect(metrics.cardDescription).toBeGreaterThanOrEqual(14);
  expect(metrics.button).toBe(14);
  await page.screenshot({ path: "test-results/components-1440.png", fullPage: true });
});
