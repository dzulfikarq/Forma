import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { CarepulseDashboard } from "./carepulse-dashboard";

function renderWorkspace() {
  return render(<ThemeProvider defaultTheme="light"><CarepulseDashboard /></ThemeProvider>);
}

describe("CarePulse Dashboard", () => {
  it("renders patient program analytics and selects chart days and referral sources", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    expect(screen.getByRole("heading", { name: "Patients" })).toBeInTheDocument();
    expect(screen.getByText("On-track rate")).toBeInTheDocument();
    expect(screen.getByText("72.0%")).toBeInTheDocument();
    expect(screen.getByText("6,284")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enroll patient" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nov 5: 4 enrollments" }));
    expect(screen.getByText(/Selected Nov 5/)).toBeInTheDocument();
    const referral = screen.getByRole("button", { name: /Primary care referrals/ });
    await user.click(referral);
    expect(referral).toHaveAttribute("aria-pressed", "true");
  });

  it("resolves and restores a local alert", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole("button", { name: /^Alerts/ }));
    expect(screen.getByRole("heading", { name: "Alerts" })).toBeInTheDocument();
    const firstAlert = screen.getByText("Blood pressure above care threshold").closest(".cp-record-row");
    expect(firstAlert).not.toBeNull();
    await user.click(within(firstAlert as HTMLElement).getByRole("button", { name: "Resolve" }));
    expect(within(firstAlert as HTMLElement).getByText("Resolved")).toBeInTheDocument();
    await user.click(within(firstAlert as HTMLElement).getByRole("button", { name: "Undo" }));
    expect(within(firstAlert as HTMLElement).getByText("High")).toBeInTheDocument();
  });

  it("enrolls a fictional patient through an accessible dialog", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole("button", { name: "Enroll patient" }));
    const dialog = within(screen.getByRole("dialog", { name: "Enroll patient" }));
    await user.type(dialog.getByRole("textbox", { name: "Patient name" }), "Alex Morgan");
    await user.type(dialog.getByRole("textbox", { name: "Clinic" }), "Juniper Health");
    await user.type(dialog.getByRole("textbox", { name: "Monitoring program" }), "Blood pressure");
    await user.click(dialog.getByRole("button", { name: "Enroll patient" }));
    expect(screen.getByText("Patient enrolled in local sample workspace")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Patient roster/ }));
    expect(screen.getByRole("button", { name: /Alex Morgan/ })).toBeInTheDocument();
  });

  it("opens a sample patient record and creates a care plan locally", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole("button", { name: /Patient roster/ }));
    await user.click(screen.getByRole("button", { name: /Maya Bennett/ }));
    expect(screen.getByRole("dialog", { name: "Maya Bennett" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Done" }));
    await user.click(screen.getByRole("button", { name: /Care plans/ }));
    await user.click(screen.getByRole("button", { name: "Create care plan" }));
    const dialog = within(screen.getByRole("dialog", { name: "Create care plan" }));
    await user.type(dialog.getByRole("textbox", { name: "Name" }), "New heart health pathway");
    await user.click(dialog.getByRole("button", { name: "Add to preview" }));
    expect(screen.getByText("New heart health pathway")).toBeInTheDocument();
    expect(screen.getByText(/Added in this preview session/)).toBeInTheDocument();
  });

  it("searches patients and simulates integration state", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.type(screen.getByRole("textbox", { name: "Search patients" }), "Maya");
    await user.click(screen.getByRole("option", { name: /Maya Bennett/ }));
    expect(screen.getByRole("dialog", { name: "Maya Bennett" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /Integrations/ }));
    const integration = screen.getByText("Atlas Claims").closest(".cp-record-row");
    expect(integration).not.toBeNull();
    await user.click(within(integration as HTMLElement).getByRole("button", { name: "Connect" }));
    expect(within(integration as HTMLElement).getByText("Connected")).toBeInTheDocument();
  });
});
