/**
 * PushPin — Decorative pushpin SVG
 *
 * A colorful thumbtack/pushpin used to "pin" elements
 * like the active nav tab, sticky notes, or featured cards.
 */

import React from "react";

interface PushPinProps {
  size?: number;
  className?: string;
  /** Pin head color */
  color?: string;
}

export function PushPin({
  size = 24,
  className = "",
  color = "#D94F4F",
}: PushPinProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      {/* Pin head — slightly off-center circle for a handmade feel */}
      <circle cx="12" cy="8" r="6" fill={color} stroke="#2C2C2C" strokeWidth="0.8" />
      {/* Highlight on pin head */}
      <ellipse cx="10" cy="6.5" rx="2" ry="1.5" fill="rgba(255,255,255,0.3)" />
      {/* Pin needle */}
      <line x1="12" y1="14" x2="12" y2="22" stroke="#8C8C8C" strokeWidth="1.5" strokeLinecap="round" />
      {/* Small shadow where pin enters surface */}
      <ellipse cx="12" cy="14" rx="2.5" ry="1" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}
