"use client";

/**
 * HighlightNav — Navbar with hand-drawn highlighter effects
 *
 * Active tab: highlighted with a rough, slightly uneven SVG shape
 * that looks like a real highlighter marker was dragged over the text.
 * Uses mix-blend-mode: multiply so text stays legible.
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
}

/**
 * Inline SVG of a rough highlighter shape.
 * Slightly wobbly edges simulate a hand-drawn marker stroke.
 */
function HighlighterShape({ color, className = "" }: { color: string; className?: string }) {
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
        style={{ mixBlendMode: "multiply" }}
      />
    </svg>
  );
}

export function HighlightNav({ items, activeIndex = 0, className = "" }: HighlightNavProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { theme } = useTheme();

  const activeColor = theme === "chalkboard"
    ? "rgba(255, 224, 102, 0.35)"
    : "rgba(255, 224, 102, 0.55)";
  const hoverColor = theme === "chalkboard"
    ? "rgba(167, 199, 231, 0.3)"
    : "rgba(167, 199, 231, 0.45)";

  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {items.map((item, i) => {
        const isActive = i === activeIndex;
        const isHovered = i === hoveredIndex && !isActive;

        return (
          <a
            key={item.href}
            href={item.href}
            className={`
              relative px-5 py-2 text-lg font-[family-name:var(--font-hand)]
              transition-colors duration-200
              ${isActive ? "font-bold" : ""}
              ${theme === "chalkboard" ? "text-[var(--color-chalk-white)]" : "text-[var(--color-ink)]"}
            `}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={(e) => e.preventDefault()}
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
