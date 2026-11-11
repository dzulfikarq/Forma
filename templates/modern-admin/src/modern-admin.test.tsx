import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { formatCsv, ModernAdmin } from "./modern-admin";

describe("Modern Admin interactions", () => {
  it("quotes CSV cells and neutralizes spreadsheet formulas", () => {
    expect(formatCsv([["Customer", "Note"], ["=1+1", 'Said "hello"']])).toBe('\uFEFF"Customer","Note"\r\n"\'=1+1","Said ""hello"""');
  });

  it("filters channel sales and updates chart series", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><ModernAdmin /></ThemeProvider>);
    await user.click(screen.getByRole("button", { name: "Sales" }));
    await user.click(screen.getByRole("tab", { name: "Channels" }));
    expect(screen.getByRole("img", { name: "Web shop sales over 14 days" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Stockists/ }));
    expect(screen.getByRole("button", { name: /Stockists/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: "Stockists sales over 14 days" })).toBeInTheDocument();
  });

  it("keeps settings drafts across sections in current preview session", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><ModernAdmin /></ThemeProvider>);
    await user.click(screen.getByRole("button", { name: "Settings" }));
    const workspaceName = screen.getByRole("textbox", { name: "Workspace name" });
    await user.clear(workspaceName);
    await user.type(workspaceName, "Heartwell Studio");
    const settingsNavigation = within(screen.getByRole("navigation", { name: "Settings sections" }));
    await user.click(settingsNavigation.getByRole("button", { name: "Notifications" }));
    await user.click(settingsNavigation.getByRole("button", { name: "General" }));
    expect(screen.getByRole("textbox", { name: "Workspace name" })).toHaveValue("Heartwell Studio");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Preferences saved")).toBeInTheDocument();
  });

  it("creates mock order, searches it, and confirms dispatch status change", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><ModernAdmin /></ThemeProvider>);
    await user.click(screen.getAllByRole("button", { name: /New order/ })[0]);
    await user.type(screen.getByRole("textbox", { name: "Customer name" }), "Taylor Reed");
    await user.click(screen.getByRole("button", { name: "Create order" }));
    expect(await screen.findByText("Taylor Reed")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Orders" }));
    await user.click(screen.getByRole("tab", { name: "All orders" }));
    const search = screen.getByRole("textbox", { name: "Search orders" });
    await user.type(search, "Taylor");
    const table = screen.getByRole("table");
    expect(within(table).getByText("Taylor Reed")).toBeInTheDocument();
    await user.clear(search);
    await user.click(screen.getByRole("tab", { name: /Dispatch board/ }));
    await user.click(screen.getAllByRole("button", { name: "Pack" })[0]);
    expect(screen.getByRole("alertdialog", { name: "Update order status?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Update status" }));
    expect(await screen.findByText("Order updated")).toBeInTheDocument();
  });
});
