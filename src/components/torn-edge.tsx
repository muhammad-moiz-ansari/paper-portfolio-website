"use client";

import React, { useMemo } from "react";

interface TornEdgeProps {
  className?: string;
  seed?: number;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// 1. Made the base width massive to cover up to 4K monitors without stretching
const SVG_WIDTH = 6500; 
const SVG_HEIGHT = 40;
const BAND_BASELINE = SVG_HEIGHT / 2; 
const BAND_THICKNESS = 22; // Keeping the wider gap from our previous fix!

function buildWobble(rand: () => number, segments: number): number[] {
  const wobble: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const isBigTear = rand() > 0.7;
    const amplitude = isBigTear
      ? 6 + rand() * 10 
      : 1.5 + rand() * 4.5; 
    const direction = rand() > 0.5 ? -1 : 1;
    wobble.push(direction * amplitude);
  }
  return wobble;
}

export function TornEdge({ className = "", seed = 42 }: TornEdgeProps) {
  const path = useMemo(() => {
    const rand = mulberry32(seed);
    // 2. Scaled segments up from 90 to 300 so the teeth stay the exact same physical size
    const segments = 300; 
    const wobble = buildWobble(rand, segments);

    const xAt = (i: number) => (i / segments) * SVG_WIDTH;
    const topY = (i: number) => BAND_BASELINE - BAND_THICKNESS / 2 + wobble[i];
    const bottomY = (i: number) => BAND_BASELINE + BAND_THICKNESS / 2 + wobble[i];

    const parts: string[] = [];

    parts.push(`M${xAt(0).toFixed(1)},${topY(0).toFixed(1)}`);
    for (let i = 1; i <= segments; i++) {
      parts.push(`L${xAt(i).toFixed(1)},${topY(i).toFixed(1)}`);
    }

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
        zIndex: 20, 
        marginTop: `-${SVG_HEIGHT / 2}px`, 
        marginBottom: `-${SVG_HEIGHT / 2}px`,
      }}
    >
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        // 3. THE MAGIC FIX: Keeps aspect ratio perfectly 1:1 and crops the edges natively!
        preserveAspectRatio="xMidYMid slice" 
        className="absolute top-0 left-0 w-full h-full"
        style={{
          filter: "drop-shadow(0px 6px 4px var(--torn-edge-shadow))",
        }}
      >
        <path d={path} fill="var(--torn-edge-gap)" stroke="none" />
      </svg>
    </div>
  );
}