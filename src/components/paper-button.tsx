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
 *
 * --- Paper texture ---
 * The grain overlay uses an inline SVG feTurbulence + feColorMatrix filter
 * as a background-image data URI.  Opacity is 0.22 (was 0.03 — invisible).
 * To use a real photographed paper texture, swap the background-image
 * for url('/textures/paper-grain.webp') with background-size: 200px 200px.
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
  disabled?: boolean;
}

/**
 * SVG feTurbulence grain filter as a data URI.
 * baseFrequency ~1.2 gives a fine fibre texture like cardstock.
 * feColorMatrix saturate desaturates so the grain is neutral grey,
 * letting the button's own colour show through naturally.
 *
 * Can be replaced with a photographed texture via:
 *   background-image: url('/textures/paper-grain.webp');
 *   background-size: 200px 200px;
 */
const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E\")";

export function PaperButton({
  children,
  variant = "primary",
  pressStyle = "press",
  className = "",
  onClick,
  disabled = false,
}: PaperButtonProps) {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  // If disabled prop is true, treat as disabled regardless of variant
  const isDisabled = disabled || variant === "disabled";

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
    if (isDisabled) {
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
      type="submit"
      className={`${baseClasses} ${variantClasses()} ${className}`}
      style={{ clipPath: !isDisabled ? handCutClip : undefined }}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {/*
        Paper grain texture overlay.
        Opacity 0.22 — clearly visible fibre without washing out the button colour.
        mix-blend-mode: multiply lets the grain darken slightly into the
        button surface (light mode). On dark/chalkboard we use overlay
        so the chalk-dust noise brightens rather than darkens.

        To swap for a photographed texture:
          backgroundImage: "url('/textures/paper-grain.webp')"
          backgroundSize: "200px 200px"
      */}
      {!isDisabled && (
        <span
          className="absolute inset-0 pointer-events-none rounded-sm"
          style={{
            backgroundImage: GRAIN_SVG,
            backgroundSize: "200px 200px",
            opacity: 0.22,
            mixBlendMode: isChalkboard ? "overlay" : "multiply",
          }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
