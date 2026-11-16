import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { ClosingDesk } from "./closing-desk";

function renderWorkspace() {
  return render(<ThemeProvider defaultTheme="light"><ClosingDesk /></ThemeProvider>);
}

describe("Closing Desk", () => {
  it("routes dashboard alerts into inbox and filters issues", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    expect(screen.getByRole("heading", { name: "Good morning, Laura" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Review inbox" }));
    expect(screen.getByRole("heading", { name: "Inbox" })).toBeInTheDocument();
    expect(screen.getByText("6 things need you. Agents settled 47 others overnight.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Approvals 2/ }));
    expect(screen.getByRole("button", { name: /Addendum 2 moves closing/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Seller credit does not match/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /All 6/ }));
    expect(screen.getByRole("heading", { name: "Seller credit does not match" })).toBeInTheDocument();
  });

  it("keeps amount selection, local message send, and undo functional", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole("button", { name: "Review inbox" }));

    await user.click(screen.getByRole("button", { name: "Use $8,500" }));
    expect(screen.getByText(/Draft choice: use \$8,500/)).toBeInTheDocument();
    const composer = screen.getByRole("textbox", { name: "Message draft" });
    await user.clear(composer);
    await user.type(composer, "Please confirm the signed amount.");
    await user.click(screen.getByRole("button", { name: "Send to Sophia" }));

    expect(screen.getByText("5 things need you. Agents settled 47 others overnight.")).toBeInTheDocument();
    expect(screen.getByText(/Message sent · inbox count reduced to 5/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Rate lock ends before the new closing/ }));
    expect(screen.getByText("5 things need you. Agents settled 47 others overnight.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByText("6 things need you. Agents settled 47 others overnight.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Seller credit does not match" })).toBeInTheDocument();
    expect(composer).toHaveValue("Please confirm the signed amount.");
  });

  it("searches sample inbox issues and changes calendar day locally", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole("button", { name: "Search workspace" }));
    const dialog = within(screen.getByRole("dialog", { name: "Search closings" }));
    await user.type(dialog.getByRole("textbox", { name: "Name, property, or issue" }), "Mesa Verde");
    await user.click(dialog.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("heading", { name: "Seller credit does not match" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Activity" }));
    const activity = within(screen.getByRole("dialog", { name: "Recent activity" }));
    expect(activity.getByText("Fictional activity from this sample workspace. No live deal feed is connected.")).toBeInTheDocument();
    await user.click(activity.getByRole("button", { name: "Done" }));

    await user.click(screen.getByRole("button", { name: /Home/ }));
    await user.click(screen.getByRole("button", { name: /November 18, 2026/ }));
    expect(screen.getByText("Inspection response")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /November 18, 2026/ })).toHaveAttribute("aria-pressed", "true");
  });
});
