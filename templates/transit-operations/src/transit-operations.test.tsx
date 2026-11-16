import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { TransitOperations } from "./transit-operations";

function renderWorkspace() {
  return render(<ThemeProvider defaultTheme="light"><TransitOperations /></ThemeProvider>);
}

describe("Transit Operations", () => {
  it("renders shipment route and updates the active handoff", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    expect(screen.getByRole("heading", { name: "TR-4827" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Reefer temperature stayed near/ })).toBeInTheDocument();
    expect(screen.getByText("4 of 6 stops · 22.4 km left")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Set current stop: Sunter Depot" }));
    expect(screen.getByText("5 of 6 stops · 0.0 km left")).toBeInTheDocument();
  });

  it("adds a local dispatch and can search another shipment", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole("button", { name: "Dispatch" }));
    const dialog = within(screen.getByRole("dialog", { name: "Dispatch a shipment" }));
    await user.type(dialog.getByRole("textbox", { name: "Shipment ID" }), "TR-5902");
    await user.type(dialog.getByRole("textbox", { name: "Customer" }), "Harbor Foods");
    await user.type(dialog.getByRole("textbox", { name: "Destination" }), "North Depot");
    await user.click(dialog.getByRole("button", { name: "Create shipment" }));
    expect(screen.getByRole("heading", { name: "TR-5902" })).toBeInTheDocument();

    const search = screen.getByRole("textbox", { name: "Search shipments" });
    await user.type(search, "TR-4828");
    await user.click(screen.getByRole("button", { name: /TR-4828/ }));
    expect(screen.getByRole("heading", { name: "TR-4828" })).toBeInTheDocument();
  });

  it("optimizes route estimate and toggles a local workspace preference", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    const navigation = screen.getByRole("navigation", { name: "Operations navigation" });
    await user.click(within(navigation).getByRole("button", { name: "Route planner" }));
    await user.click(screen.getByRole("button", { name: "Optimize route" }));
    expect(screen.getByText("68.4 km")).toBeInTheDocument();

    await user.click(within(navigation).getByRole("button", { name: "Settings" }));
    const reeferSwitch = screen.getByRole("switch", { name: "Reefer excursions" });
    expect(reeferSwitch).toHaveAttribute("aria-checked", "true");
    await user.click(reeferSwitch);
    expect(reeferSwitch).toHaveAttribute("aria-checked", "false");
  });
});
