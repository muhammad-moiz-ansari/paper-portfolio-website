"use client";

/**
 * ThemeToggle — Switches between "paper" and "chalkboard" themes
 *
 * Uses CSS [data-theme] selectors for visual appearance so the
 * button renders identically on server and client regardless of
 * the stored theme. Text labels and aria-labels update after
 * hydration via React state without causing a mismatch.
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { DoodleSun, DoodleChalkboard } from "@/components/doodle-icons";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mount, render a neutral placeholder that matches
  // the server-rendered output exactly (always "paper" state).
  // After mount, React state is synced with the DOM attribute.
  const displayTheme = mounted ? theme : "paper";
  const isPaper = displayTheme === "paper";

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center gap-2 px-4 py-2 rounded-lg
        border-2 border-dashed transition-all duration-300
        ${isPaper
          ? "border-[var(--color-kraft)] bg-[var(--color-paper-warm)] text-[var(--color-ink)] hover:bg-[var(--color-paper-dark)]"
          : "border-[var(--color-chalk-line)] bg-[var(--color-chalk-bg-dark)] text-[var(--color-chalk-white)] hover:bg-[var(--color-chalk-bg)]"
        }
        ${className}
      `}
      aria-label={`Switch to ${isPaper ? "chalkboard" : "paper"} theme`}
      suppressHydrationWarning
    >
      <span className={`transition-transform duration-300 ${isPaper ? "rotate-0" : "-rotate-90 opacity-0 absolute"}`}>
        <DoodleSun size={20} />
      </span>
      <span className={`transition-transform duration-300 ${!isPaper ? "rotate-0" : "rotate-90 opacity-0 absolute"}`}>
        <DoodleChalkboard size={20} />
      </span>
      <span className="text-sm font-[family-name:var(--font-hand)]" suppressHydrationWarning>
        {isPaper ? "Paper" : "Chalkboard"}
      </span>
    </button>
  );
}
