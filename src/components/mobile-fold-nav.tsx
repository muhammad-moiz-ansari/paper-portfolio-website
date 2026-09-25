"use client";

/**
 * MobileFoldNav — Paper-fold accordion navigation for mobile
 *
 * Collapsed: a single pushpin button centered at the top of the screen.
 * Open: a folded-paper strip unfolds downward panel by panel, revealing
 * stacked nav links. Each panel has a crease shadow at its fold line
 * and a tiny rotation variance for a handmade feel.
 *
 * Tapping a nav link scrolls to that section and folds the menu closed.
 * Tapping outside the open menu also closes it.
 *
 * Respects prefers-reduced-motion: falls back to a simple fade-in.
 * Fully themed for both paper (light) and chalkboard (dark) modes.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { PushPin } from "./push-pin";
import { useTheme } from "@/lib/theme-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface NavItem {
  label: string;
  href: string;
}

interface MobileFoldNavProps {
  items: NavItem[];
  activeIndex?: number;
  onItemClick?: (index: number, href: string) => void;
}

/**
 * Inline SVG of a rough highlighter shape — same as HighlightNav.
 * Reused here so the active tab highlighter matches the desktop nav.
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

/**
 * SVG feTurbulence grain filter as a data URI — matches the paper texture
 * used across the design system (buttons, cards, sections).
 */
const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E\")";

/**
 * Per-panel rotation tilts for handmade feel.
 * Small, physically plausible values (±1–2°).
 */
const PANEL_TILTS = [0.8, -0.6, 1.1, -0.9, 0.5, -1.2];

export function MobileFoldNav({
  items,
  activeIndex = 0,
  onItemClick,
}: MobileFoldNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const prefersReduced = useReducedMotion();

  const isChalkboard = theme === "chalkboard";

  // Highlighter colors — match HighlightNav exactly
  const activeColor = isChalkboard
    ? "rgba(255, 224, 102, 0.75)"
    : "rgba(255, 224, 102, 0.55)";

  const hoverColor = isChalkboard
    ? "rgba(167, 199, 231, 0.65)"
    : "rgba(167, 199, 231, 0.45)";

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    // Use a slight delay to avoid the same tap that opened it from closing it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleItemClick = useCallback(
    (index: number, href: string) => {
      setIsOpen(false);
      onItemClick?.(index, href);
    },
    [onItemClick],
  );

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Panel background and style tokens
  const panelBg = isChalkboard ? "var(--color-chalk-bg)" : "var(--color-paper)";
  const panelBorder = isChalkboard
    ? "rgba(240, 237, 229, 0.12)"
    : "rgba(196, 168, 130, 0.3)";
  const creaseShadow = isChalkboard
    ? "0 1px 0 rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.25)"
    : "0 1px 0 rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.1)";
  const grainBlend = isChalkboard ? "overlay" : "multiply";

  return (
    <div className="relative flex items-center justify-center">
      {/* MA Logo — sits to the left */}
      <a
        href="#about"
        aria-label="Back to top"
        className="absolute left-0 flex items-center hover:opacity-70 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <Image
          src="/ma-logo-light.png"
          alt="Moiz Ansari Logo"
          width={32}
          height={32}
          className={`w-8 h-8 object-contain ${isChalkboard ? "hidden" : "block"}`}
        />
        <Image
          src="/ma-logo-dark.png"
          alt="Moiz Ansari Logo"
          width={32}
          height={32}
          className={`w-8 h-8 object-contain ${isChalkboard ? "block" : "hidden"}`}
        />
      </a>

      {/* Pushpin toggle button — centered */}
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-fold-nav-menu"
        className={`
          relative z-50 p-1 transition-transform
          ${isOpen ? "-translate-y-0.5" : ""}
        `}
        style={{
          transitionDuration: prefersReduced ? "0ms" : "300ms",
        }}
      >
        <PushPin
          size={28}
          color={isChalkboard ? "#E8C84A" : "#D94F4F"}
        />
      </button>

      {/* Fold-out panel container */}
      {isOpen && (
        <div
          ref={menuRef}
          id="mobile-fold-nav-menu"
          role="navigation"
          aria-label="Main navigation"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-40"
          style={{ width: "min(280px, calc(100vw - 32px))" }}
        >
          {/* Backdrop shadow under the whole dropdown */}
          <div
            className="absolute inset-0 rounded-sm pointer-events-none"
            style={{
              boxShadow: isChalkboard
                ? "0 8px 32px rgba(0,0,0,0.5)"
                : "0 8px 32px rgba(0,0,0,0.15)",
              borderRadius: "4px",
            }}
            aria-hidden="true"
          />

          {items.map((item, i) => {
            const isActive = i === activeIndex;
            const isHovered = i === hoveredIndex && !isActive;
            const tilt = PANEL_TILTS[i % PANEL_TILTS.length];
            const isFirst = i === 0;
            const isLast = i === items.length - 1;

            // Stagger the unfold — each panel has an increasing delay
            const unfoldDelay = prefersReduced ? 0 : i * 60;
            const unfoldDuration = prefersReduced ? 0 : 280;

            return (
              <div
                key={i}
                className="relative"
                style={{
                  // Panel-by-panel unfold animation
                  animation: prefersReduced
                    ? "mobileFoldFadeIn 0.01ms ease-out forwards"
                    : `mobileFoldUnfold ${unfoldDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${unfoldDelay}ms both`,
                  transformOrigin: "top center",
                }}
              >
                {/* Crease shadow between panels */}
                {!isFirst && (
                  <div
                    className="absolute top-0 left-2 right-2 h-px pointer-events-none"
                    style={{ boxShadow: creaseShadow }}
                    aria-hidden="true"
                  />
                )}

                <a
                  href={item.href}
                  className={`
                    relative block w-full text-center py-3.5 px-6
                    text-lg font-[family-name:var(--font-hand)]
                    transition-colors duration-200
                    ${isActive ? "font-bold" : "font-medium"}
                    ${isChalkboard
                      ? "text-[var(--color-chalk-white)]"
                      : "text-[var(--color-ink)]"
                    }
                    ${isFirst ? "rounded-t-sm" : ""}
                    ${isLast ? "rounded-b-sm" : ""}
                  `}
                  style={{
                    backgroundColor: panelBg,
                    borderLeft: `1px solid ${panelBorder}`,
                    borderRight: `1px solid ${panelBorder}`,
                    borderTop: isFirst ? `1px solid ${panelBorder}` : "none",
                    borderBottom: `1px solid ${panelBorder}`,
                    transform: `rotate(${tilt}deg)`,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(i, item.href);
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onTouchStart={() => setHoveredIndex(i)}
                  onTouchEnd={() => setHoveredIndex(null)}
                >
                  {/* Paper grain texture overlay */}
                  <span
                    className="absolute inset-0 pointer-events-none rounded-sm"
                    style={{
                      backgroundImage: GRAIN_SVG,
                      backgroundSize: "200px 200px",
                      opacity: 0.12,
                      mixBlendMode: grainBlend as React.CSSProperties["mixBlendMode"],
                    }}
                    aria-hidden="true"
                  />

                  {/* Active highlighter effect */}
                  {isActive && <HighlighterShape color={activeColor} />}

                  {/* Hover highlighter effect */}
                  {!isActive && (
                    <div
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{ opacity: isHovered ? 1 : 0 }}
                    >
                      <HighlighterShape color={hoverColor} />
                    </div>
                  )}

                  {/* Label text + pushpin for active item */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {item.label}
                    {isActive && <PushPin size={14} className="inline-block -mt-0.5" />}
                  </span>
                </a>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
