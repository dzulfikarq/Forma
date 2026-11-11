import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "@design-templates/ui";

function ThemeProbe() {
  const { theme, toggleTheme, setAccent } = useTheme();
  return <><span>{theme}</span><button onClick={toggleTheme}>Toggle theme</button><button onClick={() => setAccent("263 83% 62%")}>Set violet</button></>;
}

describe("theme provider", () => {
  it("switches theme and exposes accent as a token", async () => {
    const user = userEvent.setup();
    const { container } = render(<ThemeProvider defaultTheme="light"><ThemeProbe /></ThemeProvider>);
    expect(screen.getByText("light")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(screen.getByText("dark")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Set violet" }));
    expect(container.querySelector("[data-theme=dark]")).toHaveStyle({ "--accent": "263 83% 62%" });
  });
});
