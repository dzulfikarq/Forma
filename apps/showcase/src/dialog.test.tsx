import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, ConfirmDialog, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, ThemeProvider } from "@design-templates/ui";

describe("accessible dialogs", () => {
  it("traps focus, closes on Escape, and returns focus to trigger", async () => {
    const user = userEvent.setup();
    render(<ThemeProvider><Dialog><DialogTrigger asChild><Button>Open details</Button></DialogTrigger><DialogContent><DialogTitle>Details</DialogTitle><DialogDescription>Dialog content</DialogDescription></DialogContent></Dialog></ThemeProvider>);
    const trigger = screen.getByRole("button", { name: "Open details" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Details" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("requires explicit cancel or confirm for destructive action", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    function Harness() {
      const [open, setOpen] = React.useState(true);
      return <ConfirmDialog open={open} onOpenChange={setOpen} title="Delete item?" description="This cannot be undone." destructive onConfirm={confirm} />;
    }
    render(<ThemeProvider><Harness /></ThemeProvider>);
    expect(screen.getByRole("alertdialog", { name: "Delete item?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
