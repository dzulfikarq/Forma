import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { FocusPlanner } from "./focus-planner";

describe("Focus Planner", () => {
  it("adds tasks through the shared dialog, filters them, and updates completion", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><FocusPlanner /></ThemeProvider>);

    await user.click(screen.getAllByRole("button", { name: "Add task" })[0]);
    const dialog = within(screen.getByRole("dialog", { name: "Add a task" }));
    await user.type(dialog.getByRole("textbox", { name: "Task name" }), "Send the project update");
    await user.click(dialog.getByRole("button", { name: "Add task" }));
    expect(await screen.findByText("Send the project update")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "All 4" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "To do 3" }));
    expect(screen.getByText("Send the project update")).toBeInTheDocument();
    expect(screen.queryByText("Review project brief")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "All 4" }));
    await user.click(screen.getByRole("checkbox", { name: "Mark Send the project update complete" }));
    expect(screen.getByRole("tab", { name: "Done 2" })).toBeInTheDocument();
  });
});
