import { expect, test } from "@playwright/test";

test("CarePulse matches patient analytics and supports local review actions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.locator('[data-template-id="carepulse-dashboard"]').click();
  const workspace = page.locator(".preview-stage .preview-viewport .carepulse");
  await expect(workspace.getByRole("heading", { name: "Patients" })).toBeVisible();
  await expect(workspace.getByText("72.0%")).toBeVisible();
  await expect(workspace.getByRole("heading", { name: "Referral sources" })).toBeVisible();

  await workspace.getByRole("combobox", { name: "Date range" }).click();
  await page.getByRole("option", { name: "Last 7 days" }).click();
  await expect(workspace.getByText(/last 7 days/).first()).toBeVisible();
  await workspace.getByRole("combobox", { name: "Enrollment trend interval" }).click();
  await page.getByRole("option", { name: "Weekly" }).click();
  await expect(workspace.getByRole("group", { name: "Weekly enrollment trend" })).toBeVisible();
  await workspace.getByRole("button", { name: /Primary care referrals/ }).click();
  await expect(workspace.getByText(/Primary care referrals selected/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await workspace.getByRole("button", { name: "Export" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("carepulse-patients.csv");
  await workspace.getByRole("button", { name: /^Alerts/ }).click();
  const alertRow = workspace.locator(".cp-record-row").filter({ hasText: "Blood pressure above care threshold" });
  await alertRow.getByRole("button", { name: "Resolve" }).click();
  await expect(alertRow.getByText("Resolved")).toBeVisible();
  await alertRow.getByRole("button", { name: "Undo" }).click();
  await expect(alertRow.getByText("High")).toBeVisible();
});

test("CarePulse secondary pages and responsive navigation work", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 1000 });
  await page.goto("/");
  await page.locator('[data-template-id="carepulse-dashboard"]').click();
  const workspace = page.locator(".preview-stage .preview-viewport .carepulse");
  const nav = workspace.getByRole("navigation", { name: "Main menu" });
  for (const title of ["Overview", "Readings", "Alerts", "Care plans", "Billing", "Patient roster", "Devices", "Care teams", "Integrations", "Reports", "Protocols", "Learn", "Help center", "Settings"]) {
    await nav.getByRole("button", { name: new RegExp(`^${title}`) }).click();
    await expect(workspace.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  }

  await page.setViewportSize({ width: 820, height: 1000 });
  const tablet = await workspace.evaluate((root) => ({ width: root.clientWidth, content: root.scrollWidth, document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(tablet.content).toBeLessThanOrEqual(tablet.width);
  expect(tablet.document).toBeLessThanOrEqual(tablet.viewport);

  await page.getByRole("button", { name: "mobile preview" }).click();
  await page.setViewportSize({ width: 375, height: 844 });
  await workspace.getByRole("button", { name: "Open care navigation" }).click();
  await page.getByRole("dialog", { name: "Navigation" }).getByRole("button", { name: "Patient roster" }).click();
  await expect(workspace.getByRole("heading", { name: "Patient roster", level: 1 })).toBeVisible();
  const mobile = await workspace.evaluate((root) => ({ width: root.clientWidth, content: root.scrollWidth, document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(mobile.content).toBeLessThanOrEqual(mobile.width);
  expect(mobile.document).toBeLessThanOrEqual(mobile.viewport);
});
