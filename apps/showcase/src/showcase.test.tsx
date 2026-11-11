import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./showcase";

describe("showcase catalog", () => {
  it("searches registry templates and opens live responsive preview", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("heading", { name: "Explore templates 1" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Admin & CMS" }));
    await user.click(screen.getByRole("button", { name: /Modern Admin/ }));
    expect(screen.getByRole("heading", { name: "Modern Admin" })).toBeInTheDocument();
    expect(screen.getByText("Live preview")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "mobile preview" }));
    expect(screen.getByText(/mobile · 390px/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Violet accent" }));
    expect(document.querySelector("[data-theme=dark]")).toHaveStyle({ "--accent": "263 83% 62%" });
  });

  it("shows component showcase and switches global theme", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole("button", { name: "Components" })[0]);
    expect(screen.getByRole("heading", { name: "Components" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(document.querySelector("[data-theme=light]")).toBeInTheDocument();
  });
});
