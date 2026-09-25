"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/* ─── Types ─────────────────────────────────────────────────── */

interface Bloom {
  /** Center x (CSS px, not canvas px) */
  x: number;
  y: number;
  /** Base radius the bloom grows toward */
  targetRadius: number;
  /** Current radius (grows over time) */
  radius: number;
  /** Overall opacity multiplier (0→1→0 over lifetime) */
  opacity: number;
  /** Timestamp (seconds) when this bloom was born */
  birthTime: number;
  /** Total seconds from birth → fully faded out */
  lifetime: number;
  /** Color: {r,g,b} */
  color: { r: number; g: number; b: number };
  /** Maximum opacity at peak (randomized per bloom for variety) */
  peakOpacity: number;
  /** Phase offset for the organic wobble so each bloom drifts differently */
  wobblePhase: number;
  /** Drift speed multiplier */
  driftSpeed: number;
  /** How many "lobes" to draw (sub-circles) for organic shape */
  lobeCount: number;
  /** Per-lobe offsets (angle, distance, size multiplier) for irregular shape */
  lobes: Array<{ angle: number; dist: number; sizeMul: number }>;
  /** Whether this was spawned by the cursor (affects fade-out timing) */
  isCursorBloom: boolean;
}

/* ─── Constants ─────────────────────────────────────────────── */

// EDIT: INK WASH COLORS — bloom color palettes for light and dark themes
const LIGHT_BLOOM_COLORS = [
  { r: 50, g: 55, b: 110 },   // indigo-ink
  { r: 80, g: 65, b: 45 },    // warm sepia
  { r: 55, g: 85, b: 130 },   // slate-blue ink
];

const DARK_BLOOM_COLORS = [
  { r: 180, g: 175, b: 210 }, // light lavender-ink
  { r: 200, g: 190, b: 165 }, // pale parchment-ink
  { r: 165, g: 190, b: 220 }, // light steel-blue ink
];

/** How many ambient blooms to keep alive at any time (roughly) */
const AMBIENT_BLOOM_COUNT = 6;
/** Seconds between checks to spawn a new ambient bloom */
const AMBIENT_SPAWN_INTERVAL = 2.5;
/** Min time (ms) between cursor-triggered bloom spawns */
const CURSOR_SPAWN_THROTTLE_MS = 350;
/** How far the mouse must move (px) before a new cursor bloom can spawn */
const CURSOR_MOVE_THRESHOLD = 20;

/* ─── Bloom generation helpers ──────────────────────────────── */

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLobes(count: number) {
  const lobes: Bloom["lobes"] = [];
  for (let i = 0; i < count; i++) {
    lobes.push({
      angle: (Math.PI * 2 * i) / count + randomBetween(-0.4, 0.4),
      dist: randomBetween(0.15, 0.45),
      sizeMul: randomBetween(0.5, 0.9),
    });
  }
  return lobes;
}

function createBloom(
  x: number,
  y: number,
  time: number,
  colors: typeof LIGHT_BLOOM_COLORS,
  isCursorBloom: boolean
): Bloom {
  const targetRadius = isCursorBloom
    ? randomBetween(60, 120)
    : randomBetween(80, 180);
  const lobeCount = Math.floor(randomBetween(3, 6));

  return {
    x,
    y,
    targetRadius,
    radius: isCursorBloom ? 15 : randomBetween(10, 25),
    opacity: 0,
    birthTime: time,
    lifetime: isCursorBloom ? randomBetween(3, 5) : randomBetween(8, 16),
    color: pickRandom(colors),
    peakOpacity: isCursorBloom
      ? randomBetween(0.35, 0.55)
      : randomBetween(0.25, 0.45),
    wobblePhase: randomBetween(0, Math.PI * 2),
    driftSpeed: randomBetween(0.3, 1.0),
    lobeCount,
    lobes: generateLobes(lobeCount),
    isCursorBloom,
  };
}

/* ─── Draw a single bloom onto the canvas ───────────────────── */

function drawBloom(ctx: CanvasRenderingContext2D, bloom: Bloom, time: number) {
  const age = time - bloom.birthTime;
  if (age < 0 || age > bloom.lifetime) return;

  // Fade envelope: quick fade-in, long sustain, gradual fade-out
  const fadeInEnd = bloom.isCursorBloom ? 0.4 : 0.15; // fraction of lifetime
  const fadeOutStart = bloom.isCursorBloom ? 0.5 : 0.65;
  const t = age / bloom.lifetime;
  let envelope: number;
  if (t < fadeInEnd) {
    envelope = t / fadeInEnd; // 0→1
  } else if (t < fadeOutStart) {
    envelope = 1;
  } else {
    envelope = 1 - (t - fadeOutStart) / (1 - fadeOutStart); // 1→0
  }
  const alpha = bloom.peakOpacity * envelope;
  if (alpha < 0.005) return;

  // Growth: radius expands toward target following an ease-out curve
  const growthT = Math.min(t / 0.6, 1);
  const easedGrowth = 1 - (1 - growthT) * (1 - growthT);
  const currentRadius =
    bloom.radius + (bloom.targetRadius - bloom.radius) * easedGrowth;

  // Organic drift: slow movement
  const driftX =
    Math.sin(time * 0.15 * bloom.driftSpeed + bloom.wobblePhase) * 14;
  const driftY =
    Math.cos(time * 0.12 * bloom.driftSpeed + bloom.wobblePhase * 1.3) * 10;
  const cx = bloom.x + driftX;
  const cy = bloom.y + driftY;

  // Draw central soft gradient
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentRadius);
  grad.addColorStop(
    0,
    `rgba(${bloom.color.r}, ${bloom.color.g}, ${bloom.color.b}, ${alpha})`
  );
  grad.addColorStop(
    0.25,
    `rgba(${bloom.color.r}, ${bloom.color.g}, ${bloom.color.b}, ${alpha * 0.7})`
  );
  grad.addColorStop(
    0.55,
    `rgba(${bloom.color.r}, ${bloom.color.g}, ${bloom.color.b}, ${alpha * 0.3})`
  );
  grad.addColorStop(
    1,
    `rgba(${bloom.color.r}, ${bloom.color.g}, ${bloom.color.b}, 0)`
  );
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw lobe sub-circles for organic, non-circular shape
  for (const lobe of bloom.lobes) {
    // Each lobe's angle wobbles slowly over time
    const wobbledAngle =
      lobe.angle + Math.sin(time * 0.2 + bloom.wobblePhase + lobe.angle) * 0.15;
    const lobeDist = currentRadius * lobe.dist;
    const lobeRadius = currentRadius * lobe.sizeMul;
    const lx = cx + Math.cos(wobbledAngle) * lobeDist;
    const ly = cy + Math.sin(wobbledAngle) * lobeDist;

    const lobeGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lobeRadius);
    const lobeAlpha = alpha * 0.75;
    lobeGrad.addColorStop(
      0,
      `rgba(${bloom.color.r}, ${bloom.color.g}, ${bloom.color.b}, ${lobeAlpha * 0.85})`
    );
    lobeGrad.addColorStop(
      0.45,
      `rgba(${bloom.color.r}, ${bloom.color.g}, ${bloom.color.b}, ${lobeAlpha * 0.35})`
    );
    lobeGrad.addColorStop(
      1,
      `rgba(${bloom.color.r}, ${bloom.color.g}, ${bloom.color.b}, 0)`
    );
    ctx.fillStyle = lobeGrad;
    ctx.beginPath();
    ctx.arc(lx, ly, lobeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ─── Component ─────────────────────────────────────────────── */

export function InkWashBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const isChalkboard = theme === "chalkboard";

  // Mutable refs — avoids re-creating the animation loop on every render
  const bloomsRef = useRef<Bloom[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const lastMousePos = useRef({ x: -9999, y: -9999 });
  const lastCursorSpawnRef = useRef(0);
  const lastAmbientCheckRef = useRef(0);
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

  /* ─── Resize handler ──────────────────────────────────────── */

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
  }, []);

  /* ─── Draw loop (ref-based to avoid circular declaration) ── */

  const drawRef = useRef<(timestamp: number) => void>(() => {});

  useEffect(() => {
    drawRef.current = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = sizeRef.current;
      const time = timestamp / 1000;
      const isDark = isChalkboardRef.current;
      const noMotion = reducedMotionRef.current;
      const colors = isDark ? DARK_BLOOM_COLORS : LIGHT_BLOOM_COLORS;
      const blooms = bloomsRef.current;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      // ── Reduced motion: draw a static set, no animation ──
      if (noMotion) {
        // Seed a fixed set of blooms if empty
        if (blooms.length === 0) {
          for (let i = 0; i < AMBIENT_BLOOM_COUNT; i++) {
            const b = createBloom(
              randomBetween(w * 0.1, w * 0.9),
              randomBetween(h * 0.1, h * 0.9),
              0,
              colors,
              false
            );
            b.opacity = b.peakOpacity;
            b.radius = b.targetRadius;
            blooms.push(b);
          }
        }
        // Draw each at its peak state
        for (const bloom of blooms) {
          drawBloom(ctx, bloom, bloom.birthTime + bloom.lifetime * 0.4);
        }
        return; // no rAF loop
      }

      // ── Ambient bloom spawning ──
      if (time - lastAmbientCheckRef.current > AMBIENT_SPAWN_INTERVAL) {
        lastAmbientCheckRef.current = time;
        const ambientCount = blooms.filter((b) => !b.isCursorBloom).length;
        if (ambientCount < AMBIENT_BLOOM_COUNT) {
          blooms.push(
            createBloom(
              randomBetween(w * 0.05, w * 0.95),
              randomBetween(h * 0.05, h * 0.95),
              time,
              colors,
              false
            )
          );
        }
      }

      // ── Cursor bloom spawning (throttled) ──
      if (mouse.active) {
        const dx = mouse.x - lastMousePos.current.x;
        const dy = mouse.y - lastMousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const now = timestamp;

        if (
          dist > CURSOR_MOVE_THRESHOLD &&
          now - lastCursorSpawnRef.current > CURSOR_SPAWN_THROTTLE_MS
        ) {
          blooms.push(createBloom(mouse.x, mouse.y, time, colors, true));
          lastCursorSpawnRef.current = now;
          lastMousePos.current = { x: mouse.x, y: mouse.y };
        }
      }

      // ── Draw all blooms ──
      for (const bloom of blooms) {
        drawBloom(ctx, bloom, time);
      }

      // ── Prune expired blooms ──
      bloomsRef.current = blooms.filter(
        (b) => time - b.birthTime <= b.lifetime
      );

      // ── Continue loop ──
      if (isVisibleRef.current) {
        animFrameRef.current = requestAnimationFrame((t) =>
          drawRef.current?.(t)
        );
      }
    };
  }); // re-assign draw ref every render via effect

  /* ─── Lifecycle: setup, observers, pointer tracking ──────── */

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Initial size + seed ambient blooms
    handleResize();
    const { w, h } = sizeRef.current;
    const colors = isChalkboardRef.current
      ? DARK_BLOOM_COLORS
      : LIGHT_BLOOM_COLORS;

    // Seed initial ambient blooms with staggered birth times
    for (let i = 0; i < AMBIENT_BLOOM_COUNT; i++) {
      const b = createBloom(
        randomBetween(w * 0.1, w * 0.9),
        randomBetween(h * 0.1, h * 0.9),
        -randomBetween(0, 8), // negative birth = already partway through life
        colors,
        false
      );
      bloomsRef.current.push(b);
    }

    // Start animation loop
    const startLoop = () => {
      if (animFrameRef.current != null) return;
      animFrameRef.current = requestAnimationFrame((t) =>
        drawRef.current?.(t)
      );
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

    // Pointer tracking
    const handlePointerMove = (e: PointerEvent) => {
      // Skip touch pointers (coarse) — idle animation only on touch
      if (e.pointerType === "touch") return;
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

    // Resize observer
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);

    startLoop();

    return () => {
      stopLoop();
      observer.disconnect();
      ro.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      bloomsRef.current = [];
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
