"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

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
 * ThemeProvider reads the *current* data-theme attribute on mount
 * (which was already set by the blocking inline script in layout.tsx)
 * to avoid any server/client mismatch. Server always renders "paper",
 * and the blocking script may have changed it to "chalkboard" before
 * React hydrates.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with "paper" on the server. On the client, the
  // blocking script in <head> has already set data-theme, and we
  // sync to it below in a useEffect.
  const [theme, setThemeState] = useState<Theme>("paper");

  // On mount, sync React state with the DOM attribute that the
  // blocking inline script may have already set.
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "chalkboard") {
      setThemeState("chalkboard");
    }
  }, []);

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
