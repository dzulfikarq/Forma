import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { csvText, GroundworkFinance } from "./groundwork-finance";

describe("Groundwork Finance", () => {
  it("renders reference-inspired overview and provides working page navigation", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><GroundworkFinance /></ThemeProvider>);

    expect(screen.getByRole("heading", { name: /Good morning/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Sample cash balance over the last 90 days" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Autopay$/ }));
    expect(screen.getByRole("heading", { name: "Automatic payments" })).toBeInTheDocument();
    const ruleSwitch = screen.getByRole("switch", { name: "Pause Seasonal ingredients" });
    await user.click(ruleSwitch);
    expect(screen.getByRole("switch", { name: "Activate Seasonal ingredients" })).not.toBeChecked();
  });

  it("adds and approves a sample bill through an accessible dialog", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><GroundworkFinance /></ThemeProvider>);

    await user.click(within(screen.getByRole("navigation", { name: "Primary navigation" })).getByRole("button", { name: /^Bills/ }));
    await user.click(screen.getByRole("button", { name: "Add a bill" }));
    const dialog = screen.getByRole("dialog", { name: "Add a bill" });
    await user.type(within(dialog).getByRole("textbox", { name: "Supplier" }), "Pine & Finch Supply");
    await user.type(within(dialog).getByRole("textbox", { name: "What is this bill for?" }), "Sample paper order");
    await user.clear(within(dialog).getByRole("spinbutton", { name: "Amount" }));
    await user.type(within(dialog).getByRole("spinbutton", { name: "Amount" }), "725");
    await user.click(within(dialog).getByRole("button", { name: "Add bill" }));

    expect(screen.getByText("Pine & Finch Supply")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve Pine & Finch Supply bill" }));
    expect(screen.getAllByText("Approved")).toHaveLength(2);
  });

  it("quotes CSV values and neutralizes spreadsheet formulas", () => {
    expect(csvText([["Supplier", "Note"], ["=1+1", 'Said "hello"']])).toBe('\uFEFF"Supplier","Note"\r\n"\'=1+1","Said ""hello"""');
  });
});
