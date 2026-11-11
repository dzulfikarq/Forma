import { expect, test } from "@playwright/test";

test("Staywise booking, concierge, and mobile preview work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const templateCard = page.locator('[data-template-id="staywise-host-dashboard"]');
  await expect(templateCard).toBeVisible();
  await templateCard.click();
  await expect(page.getByRole("heading", { name: "Staywise Host Dashboard" })).toBeVisible();

  const preview = page.locator(".preview-stage .preview-viewport");
  const primaryNav = preview.getByRole("navigation", { name: "Primary navigation" });
  await expect(preview.getByRole("heading", { name: "My Bookings" })).toBeVisible();
  await preview.getByRole("combobox", { name: "Booking period" }).click();
  await page.getByRole("option", { name: "15 March – 28 March" }).click();
  await expect(preview.getByRole("button", { name: "Day 7 revenue $2,291" })).toHaveAttribute("aria-pressed", "true");
  await preview.getByRole("tab", { name: "Pending" }).click();
  await expect(preview.getByText(/Sofia Meyer/)).toBeVisible();
  await expect(preview.getByText(/Elena Rostova/)).toHaveCount(0);
  await preview.getByRole("tab", { name: "All" }).click();

  await preview.getByRole("button", { name: "Add reservation" }).click();
  const bookingDialog = page.getByRole("dialog", { name: "Add a direct booking" });
  await bookingDialog.getByRole("spinbutton", { name: "Nights" }).fill("2");
  await bookingDialog.getByRole("button", { name: "Add reservation" }).click();
  await expect(preview.getByText("New guest · 2 nights")).toBeVisible();

  await primaryNav.getByRole("button", { name: /^Support/ }).click();
  await preview.getByRole("button", { name: /Next payout/ }).click();
  await expect(preview.getByText(/Your sample payout of \$1,894.83/)).toBeVisible();

  await page.getByRole("button", { name: "mobile preview" }).click();
  await page.setViewportSize({ width: 375, height: 844 });
  await expect(preview).toHaveCSS("width", "375px");
  const mobileOverflow = await preview.locator(".staywise-dashboard").evaluate((root) => ({
    width: root.scrollWidth,
    clientWidth: root.clientWidth
  }));
  expect(mobileOverflow.width).toBeLessThanOrEqual(mobileOverflow.clientWidth);
});
