"use client";

/**
 * PaperButton — Realistic torn-paper button with SVG displacement-map edges
 *
 * Uses an invisible inline SVG filter (`feTurbulence` + `feDisplacementMap`)
 * to create organic, torn-paper edges on the button shape.  Paired with
 * `drop-shadow()` (not `box-shadow`) so the shadow follows the irregular
 * torn outline.
 *
 * Active press hooks up the `paper-crumple` keyframes from globals.css
 * for a satisfying tactile squish.
 *
 * Variants:
 *   primary   – solid warm-paper background, full torn-edge filter + drop-shadow
 *   secondary – transparent background, 1px border, lighter torn-edge shadow
 *   disabled  – muted, dashed border, no torn edge
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
 */
const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E\")";

// EDIT: BUTTON TORN EDGE — SVG filter values that control the torn-paper edge roughness
/** Unique filter ID so multiple buttons on the page don't clash */
const FILTER_ID = "torn-edge";

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

  /* ─── Drop shadow that follows the torn edge ────────────────── */

  // EDIT: BUTTON SHADOWS — drop-shadow values for primary and secondary variants
  const primaryDropShadow = isChalkboard
    ? "drop-shadow(2px 3px 4px rgba(0,0,0,0.5))"
    : "drop-shadow(2px 3px 4px rgba(0,0,0,0.18))";
  const secondaryDropShadow = isChalkboard
    ? "drop-shadow(1px 2px 3px rgba(0,0,0,0.35))"
    : "drop-shadow(1px 2px 3px rgba(0,0,0,0.12))";

  const primaryHoverShadow = isChalkboard
    ? "drop-shadow(3px 5px 8px rgba(0,0,0,0.55))"
    : "drop-shadow(3px 5px 8px rgba(0,0,0,0.22))";
  const secondaryHoverShadow = isChalkboard
    ? "drop-shadow(2px 3px 5px rgba(0,0,0,0.4))"
    : "drop-shadow(2px 3px 5px rgba(0,0,0,0.15))";

  /* ─── Compose the torn-edge filter + shadow ─────────────────── */

  const tornFilter = (shadow: string) =>
    `url(#${FILTER_ID}) ${shadow}`;

  /* ─── Classes ───────────────────────────────────────────────── */

  const baseClasses = `
    relative inline-flex items-center justify-center
    px-6 py-3 text-base font-[family-name:var(--font-hand)] font-semibold
    rounded-sm transition-all duration-200 ease-out
    select-none
  `;

  /**
   * Active press: hooks into `paper-crumple` keyframes from globals.css
   * via Tailwind's arbitrary animation syntax.
   */
  const activePress =
    pressStyle === "crumple"
      ? "active:animate-[paper-crumple_0.15s_ease-out_forwards]"
      : "active:translate-y-0.5 active:rotate-0 active:scale-[0.97]";

  const variantClasses = (): string => {
    if (isDisabled) {
      return isChalkboard
        ? "bg-[var(--color-chalk-bg-dark)] text-[var(--text-faint)] border-2 border-dashed border-[var(--color-chalk-line)] cursor-not-allowed opacity-60"
        : "bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)] border-2 border-dashed border-[var(--border-light)] cursor-not-allowed opacity-60";
    }

    if (variant === "secondary") {
      return isChalkboard
        ? `bg-transparent text-[var(--color-chalk-white)] border border-[var(--color-chalk-line)]
           hover:-translate-y-0.5 hover:rotate-1
           ${activePress}`
        : `bg-transparent text-[var(--color-ink)] border border-[var(--color-kraft)]
           hover:-translate-y-0.5 hover:rotate-1
           ${activePress}`;
    }

    // Primary
    return isChalkboard
      ? `bg-[var(--color-chalk-bg-dark)] text-[var(--color-chalk-white)]
         border border-[var(--color-chalk-white)]
         hover:-translate-y-1 hover:rotate-[2deg]
         ${activePress}`
      : `bg-[var(--color-paper-warm)] text-[var(--color-ink)]
         border border-[var(--color-kraft-dark)]
         hover:-translate-y-1 hover:rotate-[2deg]
         ${activePress}`;
  };

  /* ─── Inline styles for the torn-edge + drop-shadow filter ── */

  const buttonStyle: React.CSSProperties = isDisabled
    ? {}
    : {
        filter:
          variant === "secondary"
            ? tornFilter(secondaryDropShadow)
            : tornFilter(primaryDropShadow),
      };

  return (
    /*
      Wrap in a span so we can embed the SVG filter defs as a hidden child
      without breaking flex/grid parent layouts that count direct children.
      `inline-flex` makes it behave identically to the button for layout.
    */
    <span className="inline-flex" style={{ position: "relative" }}>
      {/* ── Invisible SVG torn-edge filter definition ────────── */}
      {!isDisabled && (
        <svg
          aria-hidden="true"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        >
          <defs>
            <filter id={FILTER_ID}>
              {/* EDIT: TORN EDGE TURBULENCE — baseFrequency and numOctaves control edge roughness */}
              <feTurbulence
                type="turbulence"
                baseFrequency="0.04"
                numOctaves="4"
                result="noise"
                seed="2"
              />
              {/* EDIT: TORN EDGE DISPLACEMENT — scale controls how far the edge is displaced */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="6"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* ── The button itself ────────────────────────────────── */}
      <button
        type="submit"
        className={`${baseClasses} ${variantClasses()} ${className}`}
        style={buttonStyle}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        /* Swap filter on hover for the lifted shadow */
        onMouseEnter={(e) => {
          if (isDisabled) return;
          const shadow =
            variant === "secondary"
              ? secondaryHoverShadow
              : primaryHoverShadow;
          e.currentTarget.style.filter = tornFilter(shadow);
        }}
        onMouseLeave={(e) => {
          if (isDisabled) return;
          const shadow =
            variant === "secondary"
              ? secondaryDropShadow
              : primaryDropShadow;
          e.currentTarget.style.filter = tornFilter(shadow);
        }}
      >
        {/*
          Paper grain texture overlay.
          Opacity 0.22 — clearly visible fibre without washing out the button colour.
          mix-blend-mode: multiply lets the grain darken slightly into the
          button surface (light mode). On dark/chalkboard we use overlay
          so the chalk-dust noise brightens rather than darkens.
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
    </span>
  );
}
