"use client";

/**
 * StickyNote — A small square note with slight rotation, drop shadow,
 * and a tape or pin decoration at the top.
 *
 * Supports color variants: yellow, pink, blue.
 * Can be used as a tooltip/callout container.
 */

import React from "react";
import { useTheme } from "@/lib/theme-context";

interface StickyNoteProps {
  children: React.ReactNode;
  color?: "yellow" | "pink" | "blue";
  /** Rotation angle in degrees */
  rotate?: number;
  /** Show tape at top instead of default */
  decoration?: "tape" | "pin";
  className?: string;
}

const colorMap = {
  yellow: {
    paper: { bg: "#FFF9C4", border: "#F9E547", shadow: "rgba(249, 229, 71, 0.3)" },
    chalkboard: { bg: "rgba(255, 249, 196, 0.15)", border: "rgba(249, 229, 71, 0.4)", shadow: "rgba(0, 0, 0, 0.3)" },
  },
  pink: {
    paper: { bg: "#FCE4EC", border: "#F48FB1", shadow: "rgba(244, 143, 177, 0.3)" },
    chalkboard: { bg: "rgba(252, 228, 236, 0.12)", border: "rgba(244, 143, 177, 0.4)", shadow: "rgba(0, 0, 0, 0.3)" },
  },
  blue: {
    paper: { bg: "#E3F2FD", border: "#90CAF9", shadow: "rgba(144, 202, 249, 0.3)" },
    chalkboard: { bg: "rgba(227, 242, 253, 0.12)", border: "rgba(144, 202, 249, 0.4)", shadow: "rgba(0, 0, 0, 0.3)" },
  },
};

/** Tape decoration — a semi-transparent strip across the top */
function TapeStrip() {
  return (
    <div
      className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 rounded-sm opacity-70"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))",
        border: "1px solid rgba(200,200,200,0.3)",
        backdropFilter: "blur(1px)",
      }}
      aria-hidden="true"
    />
  );
}

/** Pin decoration — a small colored circle at top center */
function PinDot() {
  return (
    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2" aria-hidden="true">
      <div className="w-3 h-3 rounded-full bg-[#D94F4F] border border-[#2C2C2C]/30 shadow-sm" />
    </div>
  );
}

export function StickyNote({
  children,
  color = "yellow",
  rotate = -2,
  decoration = "tape",
  className = "",
}: StickyNoteProps) {
  const { theme } = useTheme();
  const colors = colorMap[color][theme === "chalkboard" ? "chalkboard" : "paper"];

  return (
    <div
      className={`relative inline-block p-5 pt-6 min-w-[160px] max-w-[260px] ${className}`}
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: `3px 3px 8px ${colors.shadow}`,
        transform: `rotate(${rotate}deg)`,
        fontFamily: "var(--font-hand)",
      }}
    >
      {decoration === "tape" ? <TapeStrip /> : <PinDot />}
      <div className="relative z-10 text-[var(--text)]">{children}</div>
      {/* Bottom curl effect — subtle gradient */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
