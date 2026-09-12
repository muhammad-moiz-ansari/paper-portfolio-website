"use client";

/**
 * ThemeToggle — Switches between "paper" and "chalkboard" themes
 *
 * Displays a sun/paper icon for paper theme and a chalkboard icon
 * for chalkboard theme. Toggles the data-theme attribute on <html>.
 */

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { DoodleSun, DoodleChalkboard } from "@/components/doodle-icons";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center gap-2 px-4 py-2 rounded-lg
        border-2 border-dashed transition-all duration-300
        ${theme === "paper"
          ? "border-[var(--color-kraft)] bg-[var(--color-paper-warm)] text-[var(--color-ink)] hover:bg-[var(--color-paper-dark)]"
          : "border-[var(--color-chalk-line)] bg-[var(--color-chalk-bg-dark)] text-[var(--color-chalk-white)] hover:bg-[var(--color-chalk-bg)]"
        }
        ${className}
      `}
      aria-label={`Switch to ${theme === "paper" ? "chalkboard" : "paper"} theme`}
    >
      <span className={`transition-transform duration-300 ${theme === "paper" ? "rotate-0" : "-rotate-90 opacity-0 absolute"}`}>
        <DoodleSun size={20} />
      </span>
      <span className={`transition-transform duration-300 ${theme === "chalkboard" ? "rotate-0" : "rotate-90 opacity-0 absolute"}`}>
        <DoodleChalkboard size={20} />
      </span>
      <span className="text-sm font-[family-name:var(--font-hand)]">
        {theme === "paper" ? "Paper" : "Chalkboard"}
      </span>
    </button>
  );
}
