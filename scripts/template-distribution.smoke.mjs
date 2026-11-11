import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { root } from "./template-export.mjs";

const url = process.argv[2];
if (!url) throw new Error("Usage: node scripts/template-distribution.smoke.mjs <running-app-url>");
const expectedAccent = process.argv[3] ?? "263 83% 62%";
const require = createRequire(path.join(root, "apps/showcase/package.json"));
const { chromium } = require("@playwright/test");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator(".admin-shell").waitFor();
  assert.match(await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily), /Plus Jakarta Sans/);
  assert.ok(await page.locator("link[href*='Plus+Jakarta+Sans']").count() >= 1, "Plus Jakarta Sans stylesheet link missing");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.equal(await page.locator("html").evaluate((element) => element.style.getPropertyValue("--accent")), expectedAccent);
  assert.equal(await page.locator(".admin-shell").evaluate((element) => getComputedStyle(element).backgroundColor), "rgb(31, 33, 35)");
  const desktopTypography = await page.locator(".admin-shell").evaluate((root) => {
    const exempt = '[data-type-exempt="decorative"]';
    const violations = [...root.querySelectorAll("*")].flatMap((element) => {
      const hasText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      if ((!hasText && !element.matches("input, textarea, select")) || element.closest(exempt)) return [];
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || !rect.width || !rect.height) return [];
      const size = Number.parseFloat(style.fontSize);
      return size < 12 ? [`${element.tagName.toLowerCase()}: ${size}px`] : [];
    });
    return { rootFontSize: Number.parseFloat(getComputedStyle(root).fontSize), violations };
  });
  assert.equal(desktopTypography.rootFontSize, 14);
  assert.deepEqual(desktopTypography.violations, []);

  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await navigation.getByRole("button", { name: /Orders/ }).click();
  await page.getByRole("heading", { name: "Orders", level: 1 }).waitFor();
  await page.getByRole("button", { name: "Pack", exact: false }).first().click();
  await page.getByRole("heading", { name: "Update order status?" }).waitFor();
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Pack", exact: false }).first().click();
  await page.getByRole("button", { name: "Update status" }).click();
  await page.getByRole("button", { name: "Ship", exact: false }).first().waitFor();

  await page.getByRole("button", { name: /New order/ }).first().click();
  await page.getByRole("heading", { name: "Create order" }).waitFor();
  await page.getByLabel("Customer name").fill("Portable Smoke Test");
  await page.getByRole("button", { name: "Create order" }).click();
  await page.getByText("Order created").waitFor();

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  const mobile = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(mobile.scrollWidth <= mobile.width, `mobile horizontal overflow: ${JSON.stringify(mobile)}`);
  const mobileTypography = await page.locator(".admin-shell").evaluate((root) => {
    const exempt = '[data-type-exempt="decorative"]';
    return [...root.querySelectorAll("*")].flatMap((element) => {
      const hasText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      if ((!hasText && !element.matches("input, textarea, select")) || element.closest(exempt)) return [];
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || !rect.width || !rect.height) return [];
      const size = Number.parseFloat(style.fontSize);
      return size < 12 ? [`${element.tagName.toLowerCase()}: ${size}px`] : [];
    });
  });
  assert.deepEqual(mobileTypography, []);
  assert.deepEqual(pageErrors, []);
  console.log(`Browser smoke passed at ${url}; font, ${expectedAccent} accent, navigation, confirm/create dialogs, and ${mobile.width}px layout verified.`);
} finally {
  await browser.close();
}
