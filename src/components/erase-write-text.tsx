"use client";

/**
 * EraseWriteText — Animated text cycling with pencil/eraser sprites
 *
 * Instead of a standard typewriter effect:
 *
 * ERASING: A small eraser sprite moves across the text from right to left,
 * "rubbing out" characters as it passes. Faint eraser-crumb particles
 * trail behind the eraser. Implemented by sliding a clip-path mask
 * behind the eraser icon.
 *
 * WRITING: A pen/pencil sprite moves left to right, revealing characters
 * as if handwriting them. Implemented by sliding a clip-path reveal
 * with the pencil icon leading.
 *
 * Phases: display → erase → pause → write → display (loop)
 *
 * prefers-reduced-motion: falls back to a simple fade between phrases.
 *
 * --- Fix notes ---
 * 1. Eliminated synchronous setState calls inside useEffect:
 *    Previously `setProgress(0)` was called synchronously at the top of
 *    the branch handling "erasing"/"writing" phases, causing React to batch
 *    an extra render on every phase transition.  Now state is combined into
 *    a single reducer dispatch so both `phase` and `progress` change atomically.
 *
 * 2. Vertical bobbing on sprites:
 *    The eraser and pencil sprites now oscillate vertically using a
 *    sin-wave keyed to `performance.now()`, sampled every animation frame.
 *    This simulates the natural up-and-down wrist motion of handwriting.
 */

import React, { useReducer, useEffect, useCallback, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface EraseWriteTextProps {
  phrases: string[];
  /** Time each phrase stays visible (ms) */
  displayDuration?: number;
  /** Duration of erase animation (ms) */
  eraseDuration?: number;
  /** Duration of write animation (ms) */
  writeDuration?: number;
  className?: string;
}

type Phase = "display" | "erasing" | "pause" | "writing";

interface State {
  phraseIndex: number;
  phase: Phase;
  progress: number;
  /** Current vertical offset for sprite bobbing (-1 … 1 sin value) */
  bobY: number;
}

type Action =
  | { type: "START_ERASE" }
  | { type: "START_WRITE" }
  | { type: "ADVANCE_PAUSE" }
  | { type: "SET_DISPLAY" }
  | { type: "TICK"; progress: number; bobY: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_ERASE":
      // Atomically transition to erasing AND reset progress to 0
      return { ...state, phase: "erasing", progress: 0, bobY: 0 };
    case "START_WRITE":
      // Atomically transition to writing AND reset progress to 0
      return { ...state, phase: "writing", progress: 0, bobY: 0 };
    case "ADVANCE_PAUSE":
      return {
        ...state,
        phase: "pause",
        phraseIndex: (state.phraseIndex + 1) % 99999, // actual wrap handled by caller
        progress: 0,
        bobY: 0,
      };
    case "SET_DISPLAY":
      return { ...state, phase: "display", progress: 1, bobY: 0 };
    case "TICK":
      return { ...state, progress: action.progress, bobY: action.bobY };
    default:
      return state;
  }
}

/** A small SVG eraser icon */
function EraserSprite({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" className={className} aria-hidden="true">
      <rect x="2" y="4" width="24" height="12" rx="2" fill="#F5C6CB" stroke="#C9A0A0" strokeWidth="1" />
      <rect x="2" y="4" width="8" height="12" rx="2" fill="#E8A0A8" stroke="#C9A0A0" strokeWidth="1" />
      <line x1="10" y1="5" x2="10" y2="15" stroke="#C9A0A0" strokeWidth="0.5" />
    </svg>
  );
}

/** A small SVG pencil icon writing */
function PencilSprite({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className={className} aria-hidden="true">
      <g transform="rotate(-30 14 14)">
        <rect x="11" y="2" width="6" height="16" rx="1" fill="#E8C84A" stroke="#2C2C2C" strokeWidth="0.6" />
        <polygon points="11,18 17,18 14,25" fill="#F5E6C8" stroke="#2C2C2C" strokeWidth="0.6" />
        <polygon points="13,22 15,22 14,25" fill="#2C2C2C" />
        <rect x="11" y="2" width="6" height="3" rx="1" fill="#D94F4F" stroke="#2C2C2C" strokeWidth="0.4" />
      </g>
    </svg>
  );
}

/** Eraser crumb particle */
function Crumb({ left, delay }: { left: number; delay: number }) {
  return (
    <span
      className="absolute bottom-0 w-1 h-1 rounded-full bg-[var(--text-faint)] opacity-0"
      style={{
        left: `${left}%`,
        animation: `crumb-fade 0.6s ease-out ${delay}s forwards`,
      }}
      aria-hidden="true"
    />
  );
}

export function EraseWriteText({
  phrases,
  displayDuration = 2500,
  eraseDuration = 1200,
  writeDuration = 1200,
  className = "",
}: EraseWriteTextProps) {
  const [state, dispatch] = useReducer(reducer, {
    phraseIndex: 0,
    phase: "display" as Phase,
    progress: 0,
    bobY: 0,
  });

  const reducedMotion = useReducedMotion();
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const { phraseIndex, phase, progress, bobY } = state;
  const currentPhrase = phrases[phraseIndex % phrases.length];
  const nextPhrase = phrases[(phraseIndex + 1) % phrases.length];

  /**
   * Animate progress from 0 → 1 over `duration` ms.
   * Also samples a sin-wave for the vertical bob on each frame.
   */
  const animateProgress = useCallback((duration: number, onComplete: () => void) => {
    startTimeRef.current = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      // Bob amplitude: 3px equivalent converted to a normalised −1…1 value.
      // We expose it as a raw sin value; the consumer multiplies by px.
      const bob = Math.sin((now / 120) * Math.PI * 2);
      dispatch({ type: "TICK", progress: p, bobY: bob });
      if (p < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        onComplete();
      }
    };
    animationRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      // Simple cycle with no animation — just swap text with a delay
      const timer = setInterval(() => {
        dispatch({ type: "ADVANCE_PAUSE" });
        setTimeout(() => dispatch({ type: "SET_DISPLAY" }), 300);
      }, displayDuration + 500);
      return () => clearInterval(timer);
    }

    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "display") {
      timeout = setTimeout(() => dispatch({ type: "START_ERASE" }), displayDuration);

    } else if (phase === "erasing") {
      // progress and bobY start at 0 — already set atomically by START_ERASE
      animateProgress(eraseDuration, () => {
        dispatch({ type: "ADVANCE_PAUSE" });
      });

    } else if (phase === "pause") {
      timeout = setTimeout(() => dispatch({ type: "START_WRITE" }), 300);

    } else if (phase === "writing") {
      // progress and bobY start at 0 — already set atomically by START_WRITE
      animateProgress(writeDuration, () => {
        dispatch({ type: "SET_DISPLAY" });
      });
    }

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [phase, reducedMotion, displayDuration, eraseDuration, writeDuration, animateProgress]);

  if (reducedMotion) {
    return (
      <span className={`inline-block font-[family-name:var(--font-hand)] transition-opacity duration-500 ${className}`}>
        {currentPhrase}
      </span>
    );
  }

  /** Calculate clip-path based on current phase and progress */
  const getTextClip = () => {
    if (phase === "erasing") {
      // Hide text from right to left as eraser moves
      const visibleWidth = (1 - progress) * 100;
      return `inset(0 ${100 - visibleWidth}% 0 0)`;
    }
    if (phase === "writing") {
      // Reveal from left to right: show text as pen passes
      const visibleWidth = progress * 100;
      return `inset(0 ${100 - visibleWidth}% 0 0)`;
    }
    if (phase === "pause") {
      return "inset(0 100% 0 0)";
    }
    return "inset(0 0 0 0)"; // display — fully visible
  };

  /**
   * Vertical bob offset in pixels.
   * Amplitude: 3px for eraser (side-to-side scrubbing), 4px for pencil
   * (slightly more pronounced handwriting arc).
   */
  const eraserBobPx = bobY * 3;
  const pencilBobPx = bobY * 4;

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* The text — clipped during erase/write */}
      <span
        className="font-[family-name:var(--font-hand)] whitespace-nowrap"
        style={{
          clipPath: getTextClip(),
          transition: phase === "display" ? "clip-path 0.1s" : undefined,
        }}
      >
        {phase === "pause" || phase === "writing" ? nextPhrase : currentPhrase}
      </span>

      {/* Eraser sprite — moves right to left during erase phase */}
      {phase === "erasing" && (
        <span
          className="absolute -top-1"
          style={{
            left: `${(1 - progress) * 100}%`,
            // Horizontal centering + vertical sin-wave bob
            transform: `translateX(-50%) translateY(${eraserBobPx}px)`,
          }}
        >
          <EraserSprite />
          {/* Crumbs trailing below eraser */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Crumb key={i} left={50 + i * 15} delay={i * 0.1} />
          ))}
        </span>
      )}

      {/* Pencil sprite — moves left to right during write phase */}
      {phase === "writing" && (
        <span
          className="absolute -top-2"
          style={{
            left: `${progress * 100}%`,
            // Horizontal centering + vertical sin-wave bob
            transform: `translateX(-50%) translateY(${pencilBobPx}px)`,
          }}
        >
          <PencilSprite />
        </span>
      )}
    </span>
  );
}
