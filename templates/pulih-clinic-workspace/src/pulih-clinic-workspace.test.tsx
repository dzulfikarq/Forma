import * as React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@design-templates/ui";
import { PulihClinicWorkspace } from "./pulih-clinic-workspace";

function renderWorkspace() {
  return render(<ThemeProvider><PulihClinicWorkspace /></ThemeProvider>);
}

describe("Pulih Clinic Workspace", () => {
  it("shows patient record and navigates to a matching search result", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    expect(screen.getByRole("heading", { name: "Patient record" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rina Kartika" })).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Search patient or MRN" }), "Budi");
    await user.click(screen.getByRole("option", { name: /Budi Santoso/ }));

    expect(screen.getByText(/Budi Santoso · PL-00641/)).toBeInTheDocument();
  });

  it("creates appointment and adds walk-in to queue", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Create new appointment" }));
    const appointmentDialog = screen.getByRole("dialog", { name: "New appointment" });
    await user.clear(within(appointmentDialog).getByRole("textbox", { name: "Patient name" }));
    await user.type(within(appointmentDialog).getByRole("textbox", { name: "Patient name" }), "Nadya Putri");
    await user.click(within(appointmentDialog).getByRole("button", { name: "Add appointment" }));
    await user.click(screen.getByRole("button", { name: "Appointments" }));
    const upcomingVisits = screen.getByRole("heading", { name: "Upcoming visits" }).closest<HTMLElement>(".ui-card");
    expect(within(upcomingVisits!).getByRole("button", { name: /Nadya Putri/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Today" }));
    await user.click(screen.getByRole("button", { name: "Check in patient" }));
    const checkInDialog = screen.getByRole("dialog", { name: "Check in patient" });
    await user.type(within(checkInDialog).getByRole("textbox", { name: "Patient name" }), "Sinta Dewi");
    await user.click(within(checkInDialog).getByRole("button", { name: "Check in" }));
    expect(screen.getByText("Sinta Dewi")).toBeInTheDocument();
  });

  it("switches schedule between provider day lanes and weekly overview", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Today" }));
    await user.click(screen.getByRole("button", { name: "Week view" }));
    expect(screen.getByRole("heading", { name: "Weekly clinic overview" })).toBeInTheDocument();
    expect(screen.getByText("42", { exact: true })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Day view" }));
    expect(screen.getAllByText("dr. Sarah Wibowo", { exact: true })).toHaveLength(2);
  });

  it("adds a prescription to pharmacy list", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Write prescription" }));
    const dialog = screen.getByRole("dialog", { name: "Write prescription" });
    await user.type(within(dialog).getByRole("textbox", { name: "Medication" }), "Vitamin D");
    await user.type(within(dialog).getByRole("textbox", { name: "Dose and instructions" }), "1000 IU daily");
    await user.click(within(dialog).getByRole("button", { name: "Save prescription" }));
    await user.click(screen.getByRole("button", { name: "Pharmacy" }));

    expect(screen.getByText("Vitamin D 1000 IU daily")).toBeInTheDocument();
  });
});
