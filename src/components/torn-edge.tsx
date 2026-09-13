"use client";

/**
 * TornEdge — A torn/ripped paper edge divider
 *
 * Renders a single dark torn "strip" sitting at the seam between two
 * sections. Both edges of the strip (the one touching the section above,
 * and the one touching the section below) are generated from the SAME
 * underlying jagged wobble, just offset by the strip's thickness — so they
 * read as the two edges of one continuous tear, not two unrelated shapes.
 *
 * This is a single closed, non-self-intersecting polygon: top edge traced
 * left-to-right, bottom edge traced right-to-left, closed.
 */

import React, { useMemo } from "react";

interface TornEdgeProps {
  className?: string;
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
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const SVG_WIDTH = 1200;
const SVG_HEIGHT = 40;
const BAND_BASELINE = SVG_HEIGHT / 2; // center of the torn strip
const BAND_THICKNESS = 10; // vertical distance between the two edges

/**
 * Generate ONE shared jagged wobble sampled across the width. Both the top
 * and bottom edges of the strip will be built from this same array, offset
 * by +/- half the band thickness — so they're guaranteed to be "the same
 * crack", just parallel copies of it, rather than two independently random
 * shapes that happen to sit near each other.
 */
function buildWobble(rand: () => number, segments: number): number[] {
  const wobble: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const isBigTear = rand() > 0.7;
    const amplitude = isBigTear
      ? 6 + rand() * 10 // big tear: 6-16px
      : 1.5 + rand() * 4.5; // small rip: 1.5-6px
    const direction = rand() > 0.5 ? -1 : 1;
    wobble.push(direction * amplitude);
  }
  return wobble;
}

export function TornEdge({ className = "", seed = 42 }: TornEdgeProps) {
  const path = useMemo(() => {
    const rand = mulberry32(seed);
    const segments = 90;
    const wobble = buildWobble(rand, segments);

    const xAt = (i: number) => (i / segments) * SVG_WIDTH;
    const topY = (i: number) =>
      BAND_BASELINE - BAND_THICKNESS / 2 + wobble[i];
    const bottomY = (i: number) =>
      BAND_BASELINE + BAND_THICKNESS / 2 + wobble[i];

    const parts: string[] = [];

    // Top edge, left -> right
    parts.push(`M${xAt(0).toFixed(1)},${topY(0).toFixed(1)}`);
    for (let i = 1; i <= segments; i++) {
      parts.push(`L${xAt(i).toFixed(1)},${topY(i).toFixed(1)}`);
    }

    // Bottom edge, right -> left (same wobble array, so it's the same
    // crack shape as the top edge, just shifted down by BAND_THICKNESS)
    for (let i = segments; i >= 0; i--) {
      parts.push(`L${xAt(i).toFixed(1)},${bottomY(i).toFixed(1)}`);
    }

    parts.push("Z");
    return parts.join(" ");
  }, [seed]);

  return (
    <div
      className={`relative w-full ${className}`}
      aria-hidden="true"
      style={{
        height: `${SVG_HEIGHT}px`,
        zIndex: 5,
        marginTop: "-1px",
        marginBottom: "-1px",
      }}
    >
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full h-full"
        style={{
          // Single color variable with a safe fallback — the previous
          // version split this into --torn-edge-top / --torn-edge-bottom /
          // --torn-edge-gap / --torn-edge-shadow with no fallback values,
          // so any one of them being undefined in the stylesheet caused
          // inconsistent/wrong colors. One variable, one fallback, always
          // renders correctly even before any theme CSS is wired up.
          filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
        }}
      >
        <path d={path} fill="var(--torn-edge-dark, #1a1a1a)" stroke="none" />
      </svg>
    </div>
  );
}