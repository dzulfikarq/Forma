import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { StaywiseHostDashboard } from "./staywise-host-dashboard";

function renderDashboard() {
  return render(<ThemeProvider defaultTheme="light"><StaywiseHostDashboard /></ThemeProvider>);
}

function primaryNavigation() {
  return within(screen.getByRole("navigation", { name: "Primary navigation" }));
}

describe("Staywise Host Dashboard", () => {
  it("selects a chart day, filters bookings, and adds a local reservation", async () => {
    const user = userEvent.setup();
    renderDashboard();
    expect(screen.getByRole("heading", { name: "My Bookings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Day 9 revenue $1,895" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Day 7 revenue $940" }));
    expect(screen.getByRole("button", { name: "Day 7 revenue $940" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Day 7 earnings")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Pending" }));
    expect(screen.getByText(/Sofia Meyer/)).toBeInTheDocument();
    expect(screen.queryByText("Elena Rostova")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "All" }));
    await user.click(screen.getByRole("button", { name: "Add reservation" }));
    const dialog = within(screen.getByRole("dialog", { name: "Add a direct booking" }));
    await user.clear(dialog.getByRole("spinbutton", { name: "Nights" }));
    await user.type(dialog.getByRole("spinbutton", { name: "Nights" }), "2");
    await user.click(dialog.getByRole("button", { name: "Add reservation" }));
    expect(await screen.findByText("New guest · 2 nights")).toBeInTheDocument();
    expect(screen.getByText("Sample reservation added for Valencia apartment.")).toBeInTheDocument();
  }, 15_000);

  it("cycles housekeeping, rate plans, and apartment status through their controls", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(primaryNavigation().getByRole("button", { name: "Home" }));
    const turnover = screen.getByText("Valencia apartment").closest(".housekeeping-row") as HTMLElement;
    await user.click(within(turnover).getByRole("button", { name: "Update Valencia apartment status" }));
    expect(within(turnover).getByRole("button", { name: "Update Valencia apartment status" })).toHaveTextContent("Cleaning");

    await user.click(primaryNavigation().getByRole("button", { name: "Rate plans" }));
    await user.click(screen.getByRole("switch", { name: "Pause Standard flexible" }));
    expect(screen.getByRole("switch", { name: "Activate Standard flexible" })).toBeInTheDocument();
    const fridayRate = screen.getByRole("button", { name: "Valencia apartment, Friday rate $195" });
    await user.click(fridayRate);
    expect(screen.getByRole("button", { name: "Valencia apartment, Friday rate $224, surge" })).toBeInTheDocument();

    await user.click(primaryNavigation().getByRole("button", { name: "Apartments" }));
    await user.click(screen.getByRole("tab", { name: /Available/ }));
    expect(screen.getByRole("heading", { name: "Palm Breeze Loft" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Valencia apartment" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mark Palm Breeze Loft occupied" }));
    expect(screen.queryByRole("heading", { name: "Palm Breeze Loft" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Occupied" }));
    expect(screen.getByRole("heading", { name: "Palm Breeze Loft" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark Palm Breeze Loft available" })).toHaveTextContent("Occupied");
  }, 15_000);

  it("updates the pricing forecast and simulates concierge replies", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(primaryNavigation().getByRole("button", { name: "Pricing" }));
    const forecast = screen.getByLabelText("Base nightly rate");
    const before = screen.getByText(/Projected 30-day revenue/i).parentElement?.querySelector("strong")?.textContent;
    fireEvent.change(forecast, { target: { value: "230" } });
    expect(forecast).toHaveValue("230");
    const after = screen.getByText(/Projected 30-day revenue/i).parentElement?.querySelector("strong")?.textContent;
    expect(after).not.toBe(before);

    await user.click(primaryNavigation().getByRole("button", { name: /^Support/ }));
    await user.click(screen.getByRole("button", { name: "How does guest keypad access work?" }));
    expect(screen.getByText(/In a connected product, an approved reservation/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Next payout/ }));
    expect(screen.getByText(/Your sample payout of \$1,894.83/)).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Message demo concierge" }), "Can you help?");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText("Can you help?")).toBeInTheDocument();
    expect(screen.getByText(/no support ticket was sent/)).toBeInTheDocument();
  }, 15_000);

  it("creates a sample rate plan and keeps modal actions accessible", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(primaryNavigation().getByRole("button", { name: "Rate plans" }));
    await user.click(screen.getByRole("button", { name: "Create rate plan" }));
    const dialog = within(screen.getByRole("dialog", { name: "Create a rate plan" }));
    await user.type(dialog.getByRole("textbox", { name: "Plan name" }), "Spring long stay");
    await user.click(dialog.getByRole("button", { name: "Add sample plan" }));
    expect(await screen.findByRole("heading", { name: "Spring long stay" })).toBeInTheDocument();
  }, 15_000);
});
