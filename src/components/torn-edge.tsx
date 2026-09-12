/**
 * TornEdge — A torn/ripped paper edge divider
 *
 * Uses an inline SVG path with irregular peaks and valleys
 * to simulate a piece of paper torn along a horizontal line.
 */

import React from "react";

interface TornEdgeProps {
  className?: string;
  /** Flip the edge vertically (useful for top-of-section) */
  flip?: boolean;
  /** Color of the torn edge — defaults to using currentColor */
  color?: string;
}

export function TornEdge({ className = "", flip = false, color }: TornEdgeProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="w-full h-6 md:h-8"
        fill={color || "var(--bg)"}
      >
        {/*
          Irregular torn-paper edge path.
          Each segment varies slightly in height and angle
          to mimic a real tear.
        */}
        <path d="M0,20 L15,18 L30,22 L48,16 L62,24 L80,14 L95,20 L110,18 L128,26 L145,12 L160,22 L178,16 L195,24 L210,20 L230,14 L248,22 L265,18 L280,26 L298,12 L315,24 L330,18 L348,22 L365,14 L380,20 L398,24 L415,16 L430,22 L448,18 L465,26 L480,14 L498,20 L515,24 L530,16 L548,22 L565,18 L580,14 L598,24 L615,20 L630,16 L648,26 L665,12 L680,22 L698,18 L715,24 L730,14 L748,20 L765,22 L780,16 L798,26 L815,18 L830,24 L848,12 L865,20 L880,22 L898,14 L915,24 L930,18 L948,22 L965,16 L980,20 L998,14 L1015,24 L1030,18 L1048,26 L1065,12 L1080,22 L1098,20 L1115,16 L1130,24 L1148,14 L1165,22 L1180,18 L1200,20 L1200,40 L0,40 Z" />
      </svg>
    </div>
  );
}
