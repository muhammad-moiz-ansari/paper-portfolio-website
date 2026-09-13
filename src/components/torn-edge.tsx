"use client";

/**
 * TornEdge — A torn/ripped paper edge divider
 *
 * Creates two interlocking torn halves with highly irregular, jagged paths
 * that look like actual ripped paper. The top half's bottom edge and the
 * bottom half's top edge are generated from the same base line — peaks on
 * one match valleys on the other — with a 10-20px gap between revealing
 * a dark background underneath.
 *
 * Uses CSS filter: drop-shadow() (not box-shadow) so shadows follow the
 * jagged contour. Works in both paper (light) and chalkboard (dark) themes.
 */

import React, { useMemo } from "react";

interface TornEdgeProps {
  className?: string;
  /** Flip the edge vertically */
  flip?: boolean;
  /** Deterministic seed for reproducible randomness */
  seed?: number;
}

/**
 * Seeded pseudo-random number generator (mulberry32).
 * Returns a function that produces deterministic values in [0, 1).
 */
function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6D2B79F5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a jagged torn-paper edge as an array of {x, y} points.
 * Highly irregular with varied step sizes and peak heights.
 */
function generateTornLine(
  width: number,
  baseY: number,
  rand: () => number,
  segments: number = 80,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [{ x: 0, y: baseY }];

  for (let i = 1; i < segments; i++) {
    // Irregular x spacing — not evenly distributed
    const baseX = (i / segments) * width;
    const xJitter = (rand() - 0.5) * (width / segments) * 0.6;
    const x = Math.max(1, Math.min(width - 1, baseX + xJitter));

    // Varied amplitude — mix of tiny rips and bigger tears
    const isBigTear = rand() > 0.75;
    const amplitude = isBigTear
      ? 8 + rand() * 14 // big tear: 8-22px
      : 2 + rand() * 7; // small rip: 2-9px
    const direction = rand() > 0.5 ? 1 : -1;
    const y = baseY + direction * amplitude;

    points.push({ x, y });
  }

  points.push({ x: width, y: baseY });
  return points;
}

/**
 * Convert a point array to an SVG path using line segments (L commands)
 * for a sharp, jagged look — no smooth curves.
 */
function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L${points[i].x.toFixed(1)},${points[i].y.toFixed(1)}`;
  }
  return d;
}

const SVG_WIDTH = 1200;
const TOP_HEIGHT = 40;
const BOTTOM_HEIGHT = 40;
const GAP = 14; // px gap between halves showing dark bg

export function TornEdge({ className = "", flip = false, seed = 42 }: TornEdgeProps) {
  const { topPath, bottomPath } = useMemo(() => {
    const rand = mulberry32(seed);
    const tornLine = generateTornLine(SVG_WIDTH, 28, rand, 90);

    // Top half: from 0,0 across the top edge → down to the torn line → back
    let top = `M0,0 L${SVG_WIDTH},0`;
    // Walk the torn line left to right for the bottom edge of the top half
    for (const pt of tornLine) {
      top += ` L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }
    top += " Z";

    // Bottom half: shifted down by GAP so peaks on top → valleys on bottom
    // Walk the torn line right to left (reversed) for the top edge of the bottom half
    let bottom = "";
    const reversed = [...tornLine].reverse();
    bottom = `M${reversed[0].x.toFixed(1)},${(reversed[0].y + GAP).toFixed(1)}`;
    for (let i = 1; i < reversed.length; i++) {
      bottom += ` L${reversed[i].x.toFixed(1)},${(reversed[i].y + GAP).toFixed(1)}`;
    }
    bottom += ` L0,${TOP_HEIGHT + GAP + BOTTOM_HEIGHT} L${SVG_WIDTH},${TOP_HEIGHT + GAP + BOTTOM_HEIGHT} Z`;

    return { topPath: top, bottomPath: bottom };
  }, [seed]);

  // Total height = top part + gap + bottom part
  const totalHeight = TOP_HEIGHT + GAP + BOTTOM_HEIGHT;

  return (
    <div
      className={`relative w-full ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
      style={{
        height: `${totalHeight}px`,
        zIndex: 5,
        marginTop: "-4px",
        marginBottom: "-4px",
      }}
    >
      {/* Dark gap background — visible between the two torn halves */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--torn-edge-gap, #1a1a1a)" }}
      />

      {/* Top torn half — bottom edge of the section above */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${TOP_HEIGHT + 10}`}
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full"
        style={{
          height: `${TOP_HEIGHT + 6}px`,
          filter: "drop-shadow(0 3px 3px var(--torn-edge-shadow))",
        }}
      >
        <path d={topPath} fill="var(--torn-edge-top)" />
      </svg>

      {/* Bottom torn half — top edge of the section below */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${TOP_HEIGHT + GAP + BOTTOM_HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: `${BOTTOM_HEIGHT + GAP + 6}px`,
          filter: "drop-shadow(0 -3px 3px var(--torn-edge-shadow))",
        }}
      >
        <path d={bottomPath} fill="var(--torn-edge-bottom)" />
      </svg>
    </div>
  );
}
