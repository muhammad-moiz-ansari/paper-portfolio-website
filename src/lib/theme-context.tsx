"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("paper");

  useEffect(() => {
    const stored = localStorage.getItem("paper-portfolio-theme") as Theme | null;
    if (stored === "chalkboard" || stored === "paper") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("paper-portfolio-theme", newTheme);
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
