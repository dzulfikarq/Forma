import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { root } from "./template-export.mjs";

const url = process.argv[2];
const expectedAccent = process.argv[3] ?? "12 68% 46%";
if (!url) throw new Error("Usage: node scripts/staywise-distribution.smoke.mjs <running-app-url> [\"<H S L accent>\"]");
const require = createRequire(path.join(root, "apps/showcase/package.json"));
const { chromium } = require("@playwright/test");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 1000 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

function typography(rootElement) {
  const exempt = '[data-type-exempt="decorative"]';
  const violations = [...rootElement.querySelectorAll("*")].flatMap((element) => {
    const hasText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    if ((!hasText && !element.matches("input, textarea, select")) || element.closest(exempt)) return [];
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (style.display === "none" || style.visibility === "hidden" || !rect.width || !rect.height) return [];
    const size = Number.parseFloat(style.fontSize);
    return size < 12 ? [`${element.tagName.toLowerCase()}: ${size}px`] : [];
  });
  return { body: Number.parseFloat(getComputedStyle(rootElement).fontSize), violations };
}

try {
  await page.goto(url, { waitUntil: "networkidle" });
  const dashboard = page.locator(".staywise-dashboard");
  await dashboard.waitFor();
  await page.getByRole("heading", { name: "My Bookings" }).waitFor();
  assert.match(await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily), /Plus Jakarta Sans/);
  assert.ok(await page.locator("link[href*='Plus+Jakarta+Sans']").count() >= 1);
  await page.waitForFunction((accent) => document.documentElement.style.getPropertyValue("--accent") === accent, expectedAccent);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.deepEqual(await dashboard.evaluate(typography), { body: 14, violations: [] });

  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await navigation.getByRole("button", { name: "Home" }).click();
  await page.getByRole("heading", { name: "Welcome back, Johathan" }).waitFor();
  await navigation.getByRole("button", { name: "Bookings" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.getByRole("heading", { name: "Lock this sample workspace?" }).waitFor();
  await page.getByRole("button", { name: "Stay here" }).click();
  await page.getByRole("heading", { name: "My Bookings" }).waitFor();

  await page.getByRole("button", { name: "Add reservation" }).click();
  await page.getByRole("heading", { name: "Add a direct booking" }).waitFor();
  await page.getByRole("spinbutton", { name: "Nights" }).fill("2");
  await page.getByRole("button", { name: "Add reservation" }).last().click();
  await page.getByText("New guest · 2 nights").waitFor();

  for (const width of [820, 375]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth, content: document.querySelector(".staywise-dashboard").scrollWidth, contentClient: document.querySelector(".staywise-dashboard").clientWidth }));
    assert.ok(dimensions.page <= dimensions.viewport, `document overflow at ${width}px: ${JSON.stringify(dimensions)}`);
    assert.ok(dimensions.content <= dimensions.contentClient, `template overflow at ${width}px: ${JSON.stringify(dimensions)}`);
    assert.deepEqual(await dashboard.evaluate(typography), { body: 14, violations: [] });
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  assert.equal(await page.getByRole("button", { name: "Close navigation" }).getAttribute("aria-expanded"), "true");
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Support" }).click();
  await page.getByRole("heading", { name: "Host support" }).waitFor();
  assert.deepEqual(pageErrors, []);
  console.log(`Staywise smoke passed at ${url}; font, accent, navigation, dialogs, theme, typography, and 820/375px layouts verified.`);
} finally {
  await browser.close();
}
