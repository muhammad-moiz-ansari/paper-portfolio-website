/**
 * PaperClip — Decorative paperclip SVG
 *
 * A metallic paperclip that can be placed on cards, images,
 * or other containers as a visual accent.
 */

import React from "react";

interface PaperClipProps {
  size?: number;
  className?: string;
  /** Rotation angle in degrees */
  rotate?: number;
  color?: string;
}

export function PaperClip({
  size = 48,
  className = "",
  rotate = -15,
  color = "#8C8C8C",
}: PaperClipProps) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 30 48"
      fill="none"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      {/*
        Wire-style paperclip with rounded corners.
        Slightly imperfect path to match the handcrafted theme.
      */}
      <path
        d="M10 4c-3.5 0-6.5 2.8-6.5 6.5v24c0 5 4 9 9 9s9-4 9-9V12.5c0-3.5-2.8-6.2-6.2-6.2S9 9 9 12.5v21c0 2.2 1.8 4 4 4s4-1.8 4-4V14"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
