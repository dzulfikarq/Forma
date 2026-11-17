import { expect, test } from "@playwright/test";

test("gallery, live preview, theme variants, and responsive navigation work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /^Explore templates/ })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".registry-summary")).toBeVisible();
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
  expect(detailTypography.heading).toBe(25);
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
  await expect(page.getByRole("heading", { name: /^Explore templates/ })).toBeVisible();
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

test("premium gallery and detail keep light/dark surfaces and responsive controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("group", { name: "Filter by category" })).toBeVisible();
  const headerIconMetrics = await page.locator(".header-theme, .github-link").evaluateAll((controls) => controls.map((control) => ({
    control: [control.getBoundingClientRect().width, control.getBoundingClientRect().height],
    icon: [getComputedStyle(control.querySelector("svg")!).width, getComputedStyle(control.querySelector("svg")!).height],
  })));
  expect(headerIconMetrics).toEqual([
    { control: [40, 40], icon: ["18px", "18px"] },
    { control: [40, 40], icon: ["18px", "18px"] },
  ]);

  for (const width of [375, 820, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const gridColumns = await page.locator(".template-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length);
    expect(gridColumns).toBe(width <= 640 ? 1 : width <= 1100 ? 2 : 3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, `gallery overflow at ${width}px`).toBe(false);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.locator('[data-template-id="aster-finance"]').click();
  await expect(page.locator(".preview-viewport .aster-finance")).toBeVisible();
  await expect(page.locator(".detail-sidebar")).toBeVisible();
  await page.mouse.move(0, 0);
  const detailButtonIconAlignment = await page.locator(".detail-theme-control .ui-button, .detail-share").evaluateAll((controls) => controls.map((control) => {
    const style = getComputedStyle(control);
    const icon = control.querySelector("svg")!.getBoundingClientRect();
    const bounds = control.getBoundingClientRect();
    return {
      alignItems: style.alignItems,
      justifyContent: style.justifyContent,
      iconCenterY: Math.abs(icon.top + icon.height / 2 - (bounds.top + bounds.height / 2)),
    };
  }));
  const customAccentIconAlignment = await page.locator(".custom-accent").evaluate((control) => {
    const style = getComputedStyle(control);
    const icon = control.querySelector("svg")!.getBoundingClientRect();
    const bounds = control.getBoundingClientRect();
    return { display: style.display, placeItems: style.placeItems, iconCenterY: Math.abs(icon.top + icon.height / 2 - (bounds.top + bounds.height / 2)) };
  });
  expect(detailButtonIconAlignment).toMatchObject([
    { alignItems: "center", justifyContent: "center" },
    { alignItems: "center", justifyContent: "center" },
  ]);
  expect(detailButtonIconAlignment.every((item) => item.iconCenterY < 1)).toBe(true);
  expect(customAccentIconAlignment).toMatchObject({ display: "grid", placeItems: "center" });
  expect(customAccentIconAlignment.iconCenterY).toBeLessThan(1);
  const detailButtonContrast = () => page.locator(".detail-share").evaluate((button) => {
    const luminance = (color: string) => {
      const channels = color.match(/[\d.]+/g)!.slice(0, 3).map((channel) => Number(channel) / 255);
      const [red, green, blue] = channels.map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
      return .2126 * red + .7152 * green + .0722 * blue;
    };
    const style = getComputedStyle(button);
    const foreground = luminance(style.color);
    const background = luminance(style.backgroundColor);
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
  expect(await detailButtonContrast()).toBeGreaterThanOrEqual(4.5);
  const outlineSurfaces = await page.locator(".detail-theme-control .ui-button, .preview-expand").evaluateAll((buttons) => buttons.map((button) => getComputedStyle(button).backgroundColor));
  expect(outlineSurfaces.every((surface) => surface !== "rgba(0, 0, 0, 0)")).toBe(true);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await detailButtonContrast()).toBeGreaterThanOrEqual(4.5);
  const darkOutlineSurfaces = await page.locator(".detail-theme-control .ui-button, .preview-expand").evaluateAll((buttons) => buttons.map((button) => getComputedStyle(button).backgroundColor));
  expect(darkOutlineSurfaces.every((surface) => surface !== "rgba(0, 0, 0, 0)")).toBe(true);
  expect(darkOutlineSurfaces).not.toEqual(outlineSurfaces);

  for (const width of [375, 820, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, `detail overflow at ${width}px`).toBe(false);
    await expect(page.getByRole("button", { name: "Open large preview" })).toBeVisible();
  }
});

test("components page uses shared readable typography", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Components" }).click();
  await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();

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
