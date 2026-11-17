import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { AsterFinance } from "./aster-finance";

function renderLandingPage() {
  return render(<ThemeProvider defaultTheme="light" defaultAccent="224 82% 56%"><AsterFinance /></ThemeProvider>);
}

describe("Aster Finance landing page", () => {
  it("renders the original finance story and all primary landing sections", () => {
    renderLandingPage();

    expect(screen.getByRole("heading", { name: "Make room for what matters." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A better view of your everyday money." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Start simple. Choose your pace." })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByText(/All figures, plans, stories, and partner names are illustrative/)).toBeInTheDocument();
  });

  it("updates sample annual pricing and validates the local signup dialog", async () => {
    const user = userEvent.setup();
    renderLandingPage();

    await user.click(screen.getByRole("button", { name: /Yearly/ }));
    expect(screen.getByText("$15")).toBeInTheDocument();
    expect(screen.getAllByText("Billed yearly in this sample")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Choose Everyday" }));
    const dialog = screen.getByRole("dialog", { name: "Take your first step with Aster" });
    expect(within(dialog).getByText(/Everyday sample plan/)).toBeInTheDocument();
    await user.type(within(dialog).getByRole("textbox", { name: "Your name" }), "Ada Morgan");
    await user.type(within(dialog).getByRole("textbox", { name: "Email address" }), "ada@example.test");
    await user.click(within(dialog).getByRole("button", { name: "Continue with Everyday" }));

    expect(await screen.findByText("Thanks, Ada")).toBeInTheDocument();
    expect(screen.getByText("Your details stay in this local preview. Nothing was sent or saved.")).toBeInTheDocument();
  });

  it("keeps FAQ, story carousel, article detail, and mobile menu interactive", async () => {
    const user = userEvent.setup();
    renderLandingPage();

    const bankFaq = screen.getByText("Does Aster connect to my bank?").closest("details");
    expect(bankFaq).not.toHaveAttribute("open");
    await user.click(screen.getByText("Does Aster connect to my bank?"));
    expect(bankFaq).toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: "Next stories" }));
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Read the note" })[0]);
    expect(screen.getByRole("dialog", { name: "A gentle way to reset your monthly budget" })).toBeInTheDocument();
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
    await user.click(within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("link", { name: "Pricing" }));
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  });
});
