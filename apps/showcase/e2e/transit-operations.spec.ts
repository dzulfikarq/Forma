import { expect, test } from "@playwright/test";

test("Transit Operations is registry-driven, interactive, and responsive", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/");
  const card = page.locator('[data-template-id="transit-operations"]');
  await expect(card).toBeVisible();
  await card.click();

  const preview = page.locator(".preview-stage .preview-viewport");
  const workspace = preview.locator(".transit-operations");
  await expect(workspace.getByRole("heading", { name: "TR-4827" })).toBeVisible();
  await expect(workspace.getByRole("img", { name: /Reefer temperature stayed near/ })).toBeVisible();

  const nav = workspace.getByRole("navigation", { name: "Operations navigation" });
  await nav.getByRole("button", { name: "Live map" }).click();
  await expect(workspace.getByRole("heading", { name: "Live fleet map" })).toBeVisible();
  await workspace.getByRole("button", { name: "Select map stop Pulo Market" }).click();
  await expect(workspace.getByRole("heading", { name: "TR-4827" })).toBeVisible();

  await nav.getByRole("button", { name: "Fleet" }).click();
  await expect(workspace.getByRole("heading", { name: "Fleet", exact: true })).toBeVisible();
  const serviceVehicle = workspace.locator(".to-vehicle-card").filter({ hasText: "Box truck 03" });
  await serviceVehicle.getByRole("button", { name: "Mark ready" }).click();
  await expect(serviceVehicle.locator(".to-status")).toHaveText("Ready");
  await nav.getByRole("button", { name: "Route planner" }).click();
  await workspace.getByRole("button", { name: "Optimize route" }).click();
  await expect(workspace.getByText("68.4 km")).toBeVisible();

  await workspace.getByRole("button", { name: "Dispatch" }).click();
  const dispatch = page.getByRole("dialog", { name: "Dispatch a shipment" });
  await dispatch.getByRole("textbox", { name: "Shipment ID" }).fill("TR-5902");
  await dispatch.getByRole("textbox", { name: "Customer" }).fill("Harbor Foods");
  await dispatch.getByRole("textbox", { name: "Destination" }).fill("North Depot");
  await dispatch.getByRole("button", { name: "Create shipment" }).click();
  await expect(workspace.getByRole("heading", { name: "TR-5902" })).toBeVisible();

  await page.getByRole("button", { name: "tablet preview" }).click();
  await page.setViewportSize({ width: 820, height: 1000 });
  const tablet = await workspace.evaluate((root) => ({ width: root.clientWidth, content: root.scrollWidth, document: document.documentElement.scrollWidth }));
  expect(tablet.content).toBeLessThanOrEqual(tablet.width);
  expect(tablet.document).toBeLessThanOrEqual(820);

  await page.getByRole("button", { name: "mobile preview" }).click();
  await page.setViewportSize({ width: 375, height: 844 });
  await expect(workspace.getByRole("heading", { name: "TR-4827" })).toBeVisible();
  const mobile = await workspace.evaluate((root) => ({ width: root.clientWidth, content: root.scrollWidth, document: document.documentElement.scrollWidth }));
  expect(mobile.width).toBeLessThanOrEqual(375);
  expect(mobile.content).toBeLessThanOrEqual(mobile.width);
  expect(mobile.document).toBeLessThanOrEqual(375);

  await workspace.getByRole("button", { name: "Open operations navigation" }).click();
  const mobileNav = page.getByRole("dialog", { name: "Navigation" }).getByRole("navigation", { name: "Responsive navigation" });
  await mobileNav.getByRole("button", { name: "Fuel & costs" }).click();
  await expect(workspace.getByRole("heading", { name: "Fuel & costs" })).toBeVisible();
});
