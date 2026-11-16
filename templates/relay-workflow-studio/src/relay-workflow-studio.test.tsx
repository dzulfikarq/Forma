import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { RelayWorkflowStudio } from "./relay-workflow-studio";

function renderWorkspace() {
  return render(<ThemeProvider defaultTheme="light" defaultAccent="252 68% 54%"><RelayWorkflowStudio /></ThemeProvider>);
}

beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    hasPointerCapture: { configurable: true, value: () => false },
    setPointerCapture: { configurable: true, value: () => undefined },
    releasePointerCapture: { configurable: true, value: () => undefined },
    scrollIntoView: { configurable: true, value: () => undefined }
  });
});

describe("Relay Workflow Studio", () => {
  it("creates a workflow, edits a step, runs it, and shows run history", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    expect(screen.getByRole("textbox", { name: "Workflow name" })).toHaveValue("Invoice follow-up");
    await user.click(within(screen.getByRole("main")).getByRole("button", { name: /^Workflows$/ }));
    await user.click(screen.getByRole("button", { name: "Create workflow" }));
    const createDialog = screen.getByRole("dialog", { name: "Create a workflow" });
    await user.type(within(createDialog).getByRole("textbox", { name: "Workflow name" }), "Welcome sequence");
    await user.click(within(createDialog).getByRole("button", { name: "Create workflow" }));

    expect(screen.getByRole("textbox", { name: "Workflow name" })).toHaveValue("Welcome sequence");
    await user.click(screen.getByRole("button", { name: "Add a step" }));
    const stepDialog = screen.getByRole("dialog", { name: "Add a step" });
    await user.click(within(stepDialog).getByRole("combobox", { name: "Step type" }));
    await user.click(screen.getByRole("option", { name: "Condition" }));
    await user.click(within(stepDialog).getByRole("button", { name: "Add condition" }));

    const stepName = screen.getByRole("textbox", { name: "Step name" });
    await user.clear(stepName);
    await user.type(stepName, "Customer is new");
    expect(screen.getByRole("button", { name: /Customer is new/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Run now" }));
    expect(screen.getByText("Test run completed")).toBeInTheDocument();
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    await user.click(within(navigation).getByRole("button", { name: "Run history" }));
    expect(screen.getByRole("heading", { name: "Run history" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Welcome sequence/ })).toBeInTheDocument();
  });

  it("filters workflows by status and toggles a local app connection", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(within(screen.getByRole("main")).getByRole("button", { name: /^Workflows$/ }));
    await user.click(screen.getByRole("combobox", { name: "Filter workflows by status" }));
    await user.click(screen.getByRole("option", { name: "Paused" }));
    expect(screen.getByRole("row", { name: /Payment received/ })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Invoice follow-up/ })).not.toBeInTheDocument();

    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    await user.click(within(navigation).getByRole("button", { name: "Connections" }));
    const worklistCard = screen.getByRole("heading", { name: "Worklist" }).closest(".rws-connection-card");
    expect(worklistCard).not.toBeNull();
    await user.click(within(worklistCard as HTMLElement).getByRole("button", { name: "Connect" }));
    expect(screen.getByText("Worklist connected")).toBeInTheDocument();
  });
});
