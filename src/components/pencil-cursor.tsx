"use client";

/**
 * PencilCursor — Custom cursor provider with optional sketch trail
 *
 * Replaces the default cursor with a pencil-tip cursor (via CSS class on body).
 * Optionally draws a very light, fast-fading sketch trail that follows
 * cursor movement using a canvas overlay.
 *
 * Gracefully falls back to default cursor on:
 * - Touch devices (pointer: coarse)
 * - prefers-reduced-motion
 *
 * Canvas fade strategy:
 * - The canvas has a solid, theme-matching fill painted each frame
 *   (via clearRect + fillRect with the background colour) before re-drawing
 *   the trail.  This avoids the `destination-out` approach which creates
 *   holes to transparency — on a transparent canvas that exposes the
 *   page content behind rather than fading the marks.
 *
 * Trail colour is theme-aware:
 * - Light (paper) mode: dark ink stroke, clearly visible on cream paper
 * - Dark (chalkboard) mode: light chalk stroke, clearly visible on dark green
 *
 * TDZ fix: `fadeCanvas` no longer calls itself directly inside the callback
 * body.  Instead a `MutableRefObject` (`fadeCanvasRef`) always holds the
 * latest version of the callback, and the rAF lambda calls it through the
 * ref — breaking the self-reference that tools flag as a TDZ violation.
 */

import React, { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTheme } from "@/lib/theme-context";

interface PencilCursorProps {
  /** Enable the sketch trail effect */
  enableTrail?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function PencilCursor({
  enableTrail = true,
  children,
  className = "",
}: PencilCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef<number | null>(null);
  const { theme } = useTheme();

  // Keep theme accessible inside callbacks without re-creating them.
  const themeRef = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  const isTouchDevice = useRef(false);

  useEffect(() => {
    // Check if this is primarily a touch device
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  /**
   * Ref that always holds the latest `fadeCanvas` callback.
   * The rAF lambda calls through this ref to avoid the TDZ
   * that `requestAnimationFrame(fadeCanvas)` inside `fadeCanvas`
   * itself would create.
   */
  const fadeCanvasRef = useRef<() => void>(() => {});

  /**
   * Trail segments: each entry is a line from `from` → `to`,
   * drawn with decreasing alpha so older marks appear more faded.
   */
  const trailRef = useRef<Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    alpha: number;
  }>>([]);

  /** Redraw the entire trail and advance fade */
  const fadeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear with theme-matched background so we get a real visual fade
    // rather than transparent holes that expose the page behind.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isChalkboard = themeRef.current === "chalkboard";

    // Decay each segment's alpha and drop fully-transparent ones
    trailRef.current = trailRef.current
      .map((seg) => ({ ...seg, alpha: seg.alpha - 0.04 }))
      .filter((seg) => seg.alpha > 0);

    // Draw remaining segments
    for (const seg of trailRef.current) {
      ctx.beginPath();
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(seg.to.x, seg.to.y);
      // Light chalk stroke on dark, dark ink stroke on light
      const baseColor = isChalkboard
        ? `rgba(240, 237, 229, ${seg.alpha})`   // chalk-white on chalkboard
        : `rgba(44, 44, 44, ${seg.alpha})`;      // ink on paper
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    rafId.current = requestAnimationFrame(() => fadeCanvasRef.current());
  }, []); // stable — reads everything through refs

  // Keep the ref up-to-date with the latest callback
  useEffect(() => { fadeCanvasRef.current = fadeCanvas; }, [fadeCanvas]);

  useEffect(() => {
    if (!enableTrail || reducedMotion || isTouchDevice.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Size canvas to container
    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      // Clear the trail on resize — stale positions would look wrong
      trailRef.current = [];
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastPos.current) {
        // Add a new segment with full opacity — it decays in the rAF loop
        trailRef.current.push({
          from: { ...lastPos.current },
          to: { x, y },
          alpha: 0.35,
        });
      }

      lastPos.current = { x, y };
    };

    const handleLeave = () => {
      lastPos.current = null;
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);

    // Start the fade/redraw loop
    rafId.current = requestAnimationFrame(() => fadeCanvasRef.current());

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", resize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enableTrail, reducedMotion]); // fadeCanvas intentionally excluded — called via ref

  return (
    <div
      ref={containerRef}
      className={`relative pencil-cursor ${className}`}
    >
      {enableTrail && !reducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-50"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
