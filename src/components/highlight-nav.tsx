"use client";

/**
 * HighlightNav — Navbar with hand-drawn highlighter effects
 *
 * Active tab: highlighted with a rough, slightly uneven SVG shape
 * that looks like a real highlighter marker was dragged over the text.
 *
 * In light (paper) mode:  mix-blend-mode: multiply so highlight colour
 *   blends into the paper background naturally.
 * In dark (chalkboard) mode: blend mode switched to "screen" so the
 *   yellow/blue highlights brighten rather than darken, making them
 *   clearly visible on the dark green chalkboard surface.
 *
 * Hover: the highlighter stroke animates drawing on from left to right,
 * using a clip-path transition that reveals the highlight shape.
 *
 * A small pushpin icon appears next to the active tab.
 */

import React, { useState } from "react";
import { PushPin } from "./push-pin";
import { useTheme } from "@/lib/theme-context";

interface NavItem {
  label: string;
  href: string;
}

interface HighlightNavProps {
  items: NavItem[];
  activeIndex?: number;
  className?: string;
  /** When provided, called on click instead of the default preventDefault */
  onItemClick?: (index: number, href: string) => void;
}

/**
 * Inline SVG of a rough highlighter shape.
 * Slightly wobbly edges simulate a hand-drawn marker stroke.
 *
 * Blend mode is driven by the CSS variable --highlight-blend
 * (set in globals.css per data-theme) so the server-rendered
 * markup matches the client — no hydration mismatch.
 */
function HighlighterShape({
  color,
  className = "",
}: {
  color: string;
  className?: string;
}) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M4,8 Q6,4 20,6 L60,5 Q100,3 140,7 L180,5 Q196,4 198,10 L199,18 Q198,28 190,30 L160,32 Q120,35 80,31 L40,33 Q10,35 4,30 L2,20 Q1,14 4,8Z"
        fill={color}
        style={{ mixBlendMode: "var(--highlight-blend)" as React.CSSProperties["mixBlendMode"] }}
      />
    </svg>
  );
}

export function HighlightNav({ items, activeIndex = 0, className = "", onItemClick }: HighlightNavProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  const isChalkboard = theme === "chalkboard";

  /**
   * Chalkboard: use higher-opacity colours so "screen" blend produces a
   * clearly visible glow. Light mode keeps the softer multiply values.
   * Blend mode is handled by the CSS variable --highlight-blend.
   */
  const activeColor = isChalkboard
    ? "rgba(255, 224, 102, 0.75)"   // bright yellow — screen-blends visibly on dark green
    : "rgba(255, 224, 102, 0.55)";  // softer yellow on paper

  const hoverColor = isChalkboard
    ? "rgba(167, 199, 231, 0.65)"   // light blue — screen-blends as a cool glow
    : "rgba(167, 199, 231, 0.45)";  // softer blue on paper

  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {items.map((item, i) => {
        const isActive = i === activeIndex;
        const isHovered = i === hoveredIndex && !isActive;

        return (
          <a
            // Use index as key — item.href is "#" for all style-guide items,
            // which causes React's duplicate-key warning.
            key={i}
            href={item.href}
            className={`
              relative px-5 py-2 text-lg font-[family-name:var(--font-hand)]
              transition-colors duration-200
              ${isActive ? "font-bold" : ""}
              ${isChalkboard ? "text-[var(--color-chalk-white)]" : "text-[var(--color-ink)]"}
            `}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={(e) => {
              e.preventDefault();
              onItemClick?.(i, item.href);
            }}
          >
            {/* Active highlight — always visible */}
            {isActive && (
              <HighlighterShape color={activeColor} />
            )}

            {/* Hover highlight — clip-path animation draws it on from left to right */}
            {!isActive && (
              <div
                className="absolute inset-0 transition-[clip-path] duration-500 ease-out"
                style={{
                  clipPath: isHovered
                    ? "inset(0 0 0 0)"
                    : "inset(0 100% 0 0)",
                }}
              >
                <HighlighterShape color={hoverColor} />
              </div>
            )}

            {/* Tab text — sits above the highlight */}
            <span className="relative z-10 flex items-center gap-1.5">
              {item.label}
              {isActive && <PushPin size={16} className="inline-block -mt-1" />}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
