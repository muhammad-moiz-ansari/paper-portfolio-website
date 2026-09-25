"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/* ─── Types ─────────────────────────────────────────────────── */

interface Dot {
  x: number;
  y: number;
  /** Phase offset for the idle sine-wave glow (0→2π) */
  phaseOffset: number;
  /** How many seconds a full idle cycle takes (randomized per dot) */
  cycleDuration: number;
  /** Base maximum brightness when this dot is at its "lit" peak (0→1) */
  maxBrightness: number;
  /** Minimum brightness when idle and dim (very faint pinprick) */
  minBrightness: number;
  /** Radius of the dot in px */
  radius: number;
}

/* ─── Dot generation ────────────────────────────────────────── */

/**
 * Generate a set of irregularly scattered dot positions.
 * Uses Poisson-disk-ish rejection sampling to keep dots from clumping
 * while avoiding a rigid grid look.
 */
function generateDots(
  width: number,
  height: number,
  density: number = 0.0018
): Dot[] {
  const count = Math.floor(width * height * density);
  // Cap at a reasonable ceiling to avoid performance problems on huge screens
  const maxDots = Math.min(count, 600);

  const dots: Dot[] = [];
  const minDistance = 18; // px — minimum separation so dots don't overlap

  for (let attempt = 0; dots.length < maxDots && attempt < maxDots * 10; attempt++) {
    // Add slight jitter by using a noisy grid base
    const x = Math.random() * width;
    const y = Math.random() * height;

    // Rejection: skip if too close to an existing dot
    let tooClose = false;
    for (const d of dots) {
      const dx = d.x - x;
      const dy = d.y - y;
      if (dx * dx + dy * dy < minDistance * minDistance) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    dots.push({
      x,
      y,
      phaseOffset: Math.random() * Math.PI * 2,
      cycleDuration: 4 + Math.random() * 6, // 4–10 seconds per cycle
      maxBrightness: 0.35 + Math.random() * 0.45, // 0.35→0.80
      minBrightness: 0.03 + Math.random() * 0.05, // barely visible pinprick
      radius: 1.2 + Math.random() * 0.8, // 1.2–2.0 px — tiny pinholes
    });
  }

  return dots;
}

/* ─── Component ─────────────────────────────────────────────── */

// EDIT: PINHOLE GLOW COLORS — the glow color/intensity for the pinhole dots in light and dark themes
const LIGHT_GLOW_COLOR = { r: 255, g: 210, b: 120 }; // warm amber
const DARK_GLOW_COLOR = { r: 220, g: 195, b: 150 }; // softer warm on dark

/** Radius in px within which the mouse brightens dots */
const MOUSE_INFLUENCE_RADIUS = 160;
/** Extra brightness boost when the mouse is right on top of a dot */
const MOUSE_MAX_BOOST = 0.6;
/** How quickly the mouse-boost interpolates toward target (0→1 per frame lerp) */
const MOUSE_LERP_SPEED = 0.08;

export function PinholePaperBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const isChalkboard = theme === "chalkboard";

  // Mutable refs to avoid re-creating the animation loop on every state change
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  /** Per-dot current mouse-boost, smoothly interpolated */
  const mouseBoostRef = useRef<Float32Array>(new Float32Array(0));
  const animFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const isChalkboardRef = useRef(isChalkboard);
  const reducedMotionRef = useRef(reducedMotion);
  const sizeRef = useRef({ w: 0, h: 0 });

  // Keep refs in sync
  useEffect(() => {
    isChalkboardRef.current = isChalkboard;
  }, [isChalkboard]);
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  /* ─── Resize: regenerate dots when canvas dimensions change ─── */

  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w === sizeRef.current.w && h === sizeRef.current.h) return;
    sizeRef.current = { w, h };

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    dotsRef.current = generateDots(w, h);
    mouseBoostRef.current = new Float32Array(dotsRef.current.length);
  }, []);

  /* ─── Draw loop (ref-based to avoid circular declaration) ─── */

  const drawRef = useRef<(timestamp: number) => void>(() => {});

  useEffect(() => {
    drawRef.current = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    const dots = dotsRef.current;
    const mouseBoosts = mouseBoostRef.current;
    const mouse = mouseRef.current;
    const isDark = isChalkboardRef.current;
    const noMotion = reducedMotionRef.current;
    const timeSeconds = timestamp / 1000;

    ctx.clearRect(0, 0, w, h);

    const glowColor = isDark ? DARK_GLOW_COLOR : LIGHT_GLOW_COLOR;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      // ── Idle brightness via sine wave ──
      let idleBrightness: number;
      if (noMotion) {
        // Static: use the phase offset to pick a fixed subset of "lit" dots
        idleBrightness =
          dot.phaseOffset > Math.PI * 1.2 && dot.phaseOffset < Math.PI * 1.8
            ? dot.maxBrightness * 0.7
            : dot.minBrightness;
      } else {
        const sineVal =
          Math.sin(
            (timeSeconds / dot.cycleDuration) * Math.PI * 2 + dot.phaseOffset
          ) *
            0.5 +
          0.5; // 0→1
        idleBrightness =
          dot.minBrightness +
          sineVal * (dot.maxBrightness - dot.minBrightness);
      }

      // ── Mouse proximity boost ──
      let targetBoost = 0;
      if (mouse.active && !noMotion) {
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_INFLUENCE_RADIUS) {
          // Smooth quadratic falloff
          const t = 1 - dist / MOUSE_INFLUENCE_RADIUS;
          targetBoost = t * t * MOUSE_MAX_BOOST;
        }
      }

      // Smoothly interpolate boost each frame
      mouseBoosts[i] += (targetBoost - mouseBoosts[i]) * MOUSE_LERP_SPEED;

      const brightness = Math.min(idleBrightness + mouseBoosts[i], 1);

      if (brightness < 0.02) continue; // skip invisible dots

      // ── Draw the dot ──
      const alpha = brightness;
      const glowRadius = dot.radius + brightness * 4; // halo grows with brightness

      // Outer glow (soft halo)
      if (brightness > 0.08) {
        const gradient = ctx.createRadialGradient(
          dot.x,
          dot.y,
          0,
          dot.x,
          dot.y,
          glowRadius
        );
        gradient.addColorStop(
          0,
          `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${alpha * 0.6})`
        );
        gradient.addColorStop(
          0.4,
          `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${alpha * 0.2})`
        );
        gradient.addColorStop(
          1,
          `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, 0)`
        );
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core bright point
      ctx.fillStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${Math.min(
        alpha * 1.2,
        1
      )})`;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isVisibleRef.current) {
      animFrameRef.current = requestAnimationFrame((t) => drawRef.current?.(t));
    }
  };
  }); // re-assign draw every render via effect

  /* ─── Lifecycle: setup, intersection observer, mouse tracking ── */

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Initial size
    handleResize();

    // Start animation loop
    const startLoop = () => {
      if (animFrameRef.current != null) return;
      animFrameRef.current = requestAnimationFrame((t) => drawRef.current?.(t));
    };
    const stopLoop = () => {
      if (animFrameRef.current != null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    // Intersection observer — pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 }
    );
    observer.observe(container);

    // Mouse / pointer tracking
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    // Window resize
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);

    startLoop();

    return () => {
      stopLoop();
      observer.disconnect();
      ro.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [handleResize]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-auto"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
