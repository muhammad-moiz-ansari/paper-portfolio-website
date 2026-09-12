"use client";

/**
 * PaperButton — Styled like cut cardstock with tactile interactions
 *
 * Primary: solid, textured with a subtle drop shadow and slightly
 * irregular border to mimic hand-cut paper.
 *
 * Hover: button lifts (translateY up, shadow increases, slight rotation).
 * Active: two variants —
 *   "press": clean pressed feel (shadow shrinks, translateY down, scale down)
 *   "crumple": subtle paper-crumple effect on press
 *
 * Also supports secondary (outline) and disabled states.
 */

import React from "react";
import { useTheme } from "@/lib/theme-context";

interface PaperButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "disabled";
  /** Active/press style: "press" = clean press, "crumple" = paper crumple effect */
  pressStyle?: "press" | "crumple";
  className?: string;
  onClick?: () => void;
}

export function PaperButton({
  children,
  variant = "primary",
  pressStyle = "press",
  className = "",
  onClick,
}: PaperButtonProps) {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  const baseClasses = `
    relative inline-flex items-center justify-center
    px-6 py-3 text-base font-[family-name:var(--font-hand)] font-semibold
    rounded-sm transition-all duration-200 ease-out
    select-none
  `;

  /**
   * Slightly irregular border radius via clip-path to simulate
   * a hand-cut edge. The polygon coordinates are slightly off-grid.
   */
  const handCutClip = "polygon(1% 3%, 98% 0%, 100% 97%, 2% 100%)";

  const variantClasses = () => {
    if (variant === "disabled") {
      return isChalkboard
        ? "bg-[var(--color-chalk-bg-dark)] text-[var(--text-faint)] border-2 border-dashed border-[var(--color-chalk-line)] cursor-not-allowed opacity-60"
        : "bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)] border-2 border-dashed border-[var(--border-light)] cursor-not-allowed opacity-60";
    }

    if (variant === "secondary") {
      return isChalkboard
        ? `bg-transparent text-[var(--color-chalk-white)] border-2 border-[var(--color-chalk-line)]
           hover:-translate-y-0.5 hover:rotate-1 hover:shadow-lg
           ${pressStyle === "crumple"
              ? "active:[animation:paper-crumple_0.15s_ease-out]"
              : "active:translate-y-0.5 active:rotate-0 active:scale-[0.97] active:shadow-sm"
           }`
        : `bg-transparent text-[var(--color-ink)] border-2 border-[var(--color-kraft)]
           hover:-translate-y-0.5 hover:rotate-1 hover:shadow-lg
           ${pressStyle === "crumple"
              ? "active:[animation:paper-crumple_0.15s_ease-out]"
              : "active:translate-y-0.5 active:rotate-0 active:scale-[0.97] active:shadow-sm"
           }`;
    }

    // Primary
    return isChalkboard
      ? `bg-[var(--color-chalk-bg-dark)] text-[var(--color-chalk-white)]
         border-2 border-[var(--color-chalk-white)]
         shadow-md
         hover:-translate-y-1 hover:rotate-[2deg] hover:shadow-xl
         ${pressStyle === "crumple"
            ? "active:[animation:paper-crumple_0.15s_ease-out]"
            : "active:translate-y-0.5 active:rotate-0 active:scale-[0.97] active:shadow-sm"
         }`
      : `bg-[var(--color-paper-dark)] text-[var(--color-ink)]
         border border-[var(--color-kraft-dark)]
         shadow-md
         hover:-translate-y-1 hover:rotate-[2deg] hover:shadow-xl
         ${pressStyle === "crumple"
            ? "active:[animation:paper-crumple_0.15s_ease-out]"
            : "active:translate-y-0.5 active:rotate-0 active:scale-[0.97] active:shadow-sm"
         }`;
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses()} ${className}`}
      style={{ clipPath: variant !== "disabled" ? handCutClip : undefined }}
      onClick={variant === "disabled" ? undefined : onClick}
      disabled={variant === "disabled"}
      aria-disabled={variant === "disabled"}
    >
      {/* Paper grain texture overlay */}
      {variant !== "disabled" && (
        <span
          className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-sm"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
