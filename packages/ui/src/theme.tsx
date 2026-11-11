import * as React from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; accent: string; setTheme: (theme: Theme) => void; toggleTheme: () => void; setAccent: (accent: string) => void };
const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, defaultTheme = "dark", defaultAccent = "24 95% 53%" }: { children: React.ReactNode; defaultTheme?: Theme; defaultAccent?: string }) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  const [accent, setAccent] = React.useState(defaultAccent);
  const value = React.useMemo(() => ({ theme, accent, setTheme, toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark"), setAccent }), [theme, accent]);
  React.useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.getAttribute("data-theme");
    const previousAccent = root.style.getPropertyValue("--accent");
    root.setAttribute("data-theme", theme);
    root.style.setProperty("--accent", accent);
    return () => {
      if (previousTheme) root.setAttribute("data-theme", previousTheme);
      else root.removeAttribute("data-theme");
      if (previousAccent) root.style.setProperty("--accent", previousAccent);
      else root.style.removeProperty("--accent");
    };
  }, [theme, accent]);
  return <ThemeContext.Provider value={value}><div data-theme={theme} style={{ "--accent": accent } as React.CSSProperties}>{children}</div></ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
