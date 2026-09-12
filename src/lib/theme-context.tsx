"use client";

import { createContext, useContext, useState, useCallback } from "react";

type Theme = "paper" | "chalkboard";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "paper",
  toggleTheme: () => {},
  setTheme: () => {},
});

/**
 * Read the persisted theme from localStorage safely (SSR guard).
 * Used as a lazy useState initializer so we never trigger a
 * post-mount state update for the initial theme load.
 */
function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "paper";
  try {
    const stored = localStorage.getItem("paper-portfolio-theme");
    if (stored === "chalkboard" || stored === "paper") return stored;
  } catch {
    // localStorage blocked (private browsing, etc.)
  }
  return "paper";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer — runs once on mount, avoids a post-mount setState.
  // On the server `readStoredTheme` returns "paper" (SSR-safe guard inside).
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    try {
      localStorage.setItem("paper-portfolio-theme", newTheme);
    } catch {
      // localStorage blocked
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "paper" ? "chalkboard" : "paper");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
