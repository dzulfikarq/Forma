import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./showcase";
import { registry } from "./registry";

describe("showcase catalog", () => {
  it("searches registry templates and opens live responsive preview", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(document.querySelector("[data-theme=light]")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Explore templates/ })).toBeInTheDocument();
    const frameworks = new Set(registry.templates.flatMap((template) => template.compatibility.map((item) => item.framework)));
    expect(screen.getByLabelText(`${registry.templates.length} templates, ${registry.categories.length} categories, ${frameworks.size} frameworks`)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filter by category" })).toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("textbox", { name: "Search templates" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: /^Admin & CMS/ }));
    await user.click(screen.getByRole("button", { name: /Modern Admin/ }));
    expect(screen.getByRole("heading", { name: "Modern Admin" })).toBeInTheDocument();
    expect(screen.getByText("Live preview")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "mobile preview" }));
    expect(screen.getByText(/mobile · 375px/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Violet accent" }));
    expect(document.querySelector("[data-theme=light]")).toHaveStyle({ "--accent": "263 83% 62%" });
  });

  it("shows component showcase and switches global theme", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole("button", { name: "Components" })[0]);
    expect(await screen.findByRole("heading", { name: "Components" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.querySelector("[data-theme=dark]")).toBeInTheDocument();
  });
});
