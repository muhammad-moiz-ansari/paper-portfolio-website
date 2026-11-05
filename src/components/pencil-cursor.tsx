"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useTheme } from "@/lib/theme-context";

interface PencilCursorProps {
  enableTrail?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Viewport overlay. The original 0.04/frame fade is calibrated to 60Hz (2.4/s). */
export function PencilCursor({ enableTrail = true, children, className = "" }: PencilCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !enableTrail || reducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coarse = window.matchMedia("(pointer: coarse)");
    type Point = { x: number; y: number };
    let last: Point | null = null;
    let segments: { from: Point; to: Point; born: number }[] = [];
    let frame: number | null = null;
    const clear = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      segments = [];
      last = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    const resize = () => {
      clear();
      // Retain the original one backing pixel per CSS pixel appearance; no DPR inflation.
      canvas.width = coarse.matches ? 0 : window.innerWidth;
      canvas.height = coarse.matches ? 0 : window.innerHeight;
    };
    const draw = (now: number) => {
      frame = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      segments = segments.filter(s => 0.35 - (now - s.born) * 0.0024 > 0);
      const rgb = themeRef.current === "chalkboard" ? "240, 237, 229" : "44, 44, 44";
      for (const segment of segments) {
        ctx.beginPath();
        ctx.moveTo(segment.from.x, segment.from.y);
        ctx.lineTo(segment.to.x, segment.to.y);
        ctx.strokeStyle = `rgba(${rgb}, ${0.35 - (now - segment.born) * 0.0024})`;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      if (segments.length) frame = requestAnimationFrame(draw);
    };
    const move = (event: MouseEvent) => {
      if (coarse.matches || document.hidden) return;
      const point = { x: event.clientX, y: event.clientY };
      if (last) {
        segments.push({ from: last, to: point, born: performance.now() });
        if (frame === null) frame = requestAnimationFrame(draw);
      }
      last = point;
    };
    const leave = () => { last = null; };
    resize();
    container.addEventListener("mousemove", move);
    container.addEventListener("mouseleave", leave);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", clear, { passive: true });
    document.addEventListener("visibilitychange", clear);
    coarse.addEventListener("change", resize);
    return () => {
      clear();
      container.removeEventListener("mousemove", move);
      container.removeEventListener("mouseleave", leave);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", clear);
      document.removeEventListener("visibilitychange", clear);
      coarse.removeEventListener("change", resize);
    };
  }, [enableTrail, reducedMotion]);

  return (
    <div ref={containerRef} className={`relative pencil-cursor ${className}`}>
      {enableTrail && !reducedMotion && (
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
