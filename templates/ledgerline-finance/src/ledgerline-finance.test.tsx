import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { csvText, LedgerlineFinance } from "./ledgerline-finance";

describe("Ledgerline Finance", () => {
  it("renders the budget board and routes to analytics", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><LedgerlineFinance /></ThemeProvider>);

    expect(screen.getByRole("heading", { name: "Financial overview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Rent of April details" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Analytics$/ }));
    expect(screen.getByRole("heading", { name: "Analytics" })).toBeInTheDocument();
  });

  it("adds a local transaction through an accessible dialog", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><LedgerlineFinance /></ThemeProvider>);

    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    const dialog = screen.getByRole("dialog", { name: "Add a transaction" });
    await user.type(within(dialog).getByRole("textbox", { name: "Description" }), "Cedar Market refund");
    await user.type(within(dialog).getByRole("spinbutton", { name: "Amount" }), "42.50");
    await user.click(within(dialog).getByRole("button", { name: "Add transaction" }));

    expect(screen.getByRole("button", { name: "Open Cedar Market refund details" })).toBeInTheDocument();
  });

  it("quotes CSV cells and neutralizes spreadsheet formulas", () => {
    expect(csvText([["Description", "Note"], ["=1+1", "Said \"hello\""]])).toBe('\uFEFF"Description","Note"\r\n"\'=1+1","Said ""hello"""');
  });
});
