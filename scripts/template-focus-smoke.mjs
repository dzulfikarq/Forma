import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { root } from "./template-export.mjs";

const url = process.argv[2];
if (!url) throw new Error("Usage: node scripts/template-focus-smoke.mjs <running-app-url>");
const require = createRequire(path.join(root, "apps/showcase/package.json"));
const { chromium } = require("@playwright/test");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

function measureTypography(rootElement) {
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
  return { rootFontSize: Number.parseFloat(getComputedStyle(rootElement).fontSize), violations };
}

try {
  await page.goto(url, { waitUntil: "networkidle" });
  const app = page.locator(".focus-planner");
  await app.waitFor();
  await page.getByRole("heading", { name: "Make room for what matters." }).waitFor();
  assert.match(await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily), /Plus Jakarta Sans/);
  assert.ok(await page.locator("link[href*='Plus+Jakarta+Sans']").count() >= 1);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.equal(await page.locator("html").evaluate((element) => element.style.getPropertyValue("--accent")), "151 52% 38%");
  const desktopTypography = await app.evaluate(measureTypography);
  assert.equal(desktopTypography.rootFontSize, 14);
  assert.deepEqual(desktopTypography.violations, []);

  await page.getByRole("button", { name: "Add task" }).first().click();
  await page.getByRole("heading", { name: "Add a task" }).waitFor();
  await page.getByLabel("Task name").fill("Portable installation smoke");
  await page.getByRole("button", { name: "Add task" }).last().click();
  await page.getByText("Portable installation smoke").waitFor();
  await page.getByRole("tab", { name: /To do/ }).click();
  assert.equal(await page.getByText("Portable installation smoke").count(), 1);

  await page.setViewportSize({ width: 375, height: 812 });
  const mobile = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(mobile.scrollWidth <= mobile.width, `mobile horizontal overflow: ${JSON.stringify(mobile)}`);
  assert.deepEqual(await app.evaluate(measureTypography), { rootFontSize: 14, violations: [] });
  assert.deepEqual(pageErrors, []);
  console.log(`Browser smoke passed at ${url}; font, Moss accent, task dialog/filter, typography, and ${mobile.width}px layout verified.`);
} finally {
  await browser.close();
}
