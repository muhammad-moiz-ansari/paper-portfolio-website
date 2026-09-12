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
 * The trail uses requestAnimationFrame for performance and fades
 * each line segment rapidly so it doesn't accumulate.
 */

import React, { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

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

  const isTouchDevice = useRef(false);

  useEffect(() => {
    // Check if this is primarily a touch device
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  /** Fade the canvas contents gradually */
  const fadeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply a semi-transparent overlay to fade existing content
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";

    rafId.current = requestAnimationFrame(fadeCanvas);
  }, []);

  useEffect(() => {
    if (!enableTrail || reducedMotion || isTouchDevice.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Size canvas to container
    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastPos.current) {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(44, 44, 44, 0.12)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      lastPos.current = { x, y };
    };

    const handleLeave = () => {
      lastPos.current = null;
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);

    // Start the fade loop
    rafId.current = requestAnimationFrame(fadeCanvas);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", resize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enableTrail, reducedMotion, fadeCanvas]);

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
