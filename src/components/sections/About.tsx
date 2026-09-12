"use client";

import React, { useState, useEffect, useReducer, useCallback, useRef } from "react";
import { useTheme } from "@/lib/theme-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { notepadPages } from "@/data/notepad-pages";

/* ─── Notepad sub-component ─────────────────────────────────── */

/** Small pencil SVG for the writing animation (adapted from erase-write-text) */
function NotepadPencil({ className = "" }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" className={className} aria-hidden="true">
      <g transform="rotate(-30 14 14)">
        <rect x="11" y="2" width="6" height="16" rx="1" fill="#E8C84A" stroke="#2C2C2C" strokeWidth="0.6" />
        <polygon points="11,18 17,18 14,25" fill="#F5E6C8" stroke="#2C2C2C" strokeWidth="0.6" />
        <polygon points="13,22 15,22 14,25" fill="#2C2C2C" />
        <rect x="11" y="2" width="6" height="3" rx="1" fill="#D94F4F" stroke="#2C2C2C" strokeWidth="0.4" />
      </g>
    </svg>
  );
}

/* ─── Writing animation state machine ──────────────────────── */

type NotepadPhase = "idle" | "writing" | "display";

interface NotepadState {
  phase: NotepadPhase;
  /** Which line is currently being written (0-based within the page) */
  lineIndex: number;
  /** 0→1 progress within the current line */
  lineProgress: number;
  /** sin-wave bob value for the pencil */
  bobY: number;
}

type NotepadAction =
  | { type: "START_WRITING" }
  | { type: "ADVANCE_LINE" }
  | { type: "FINISH" }
  | { type: "TICK"; lineProgress: number; bobY: number }
  | { type: "RESET" };

function notepadReducer(state: NotepadState, action: NotepadAction): NotepadState {
  switch (action.type) {
    case "START_WRITING":
      return { phase: "writing", lineIndex: 0, lineProgress: 0, bobY: 0 };
    case "ADVANCE_LINE":
      return { ...state, lineIndex: state.lineIndex + 1, lineProgress: 0, bobY: 0 };
    case "FINISH":
      return { ...state, phase: "display", lineProgress: 1, bobY: 0 };
    case "TICK":
      return { ...state, lineProgress: action.lineProgress, bobY: action.bobY };
    case "RESET":
      return { phase: "idle", lineIndex: 0, lineProgress: 0, bobY: 0 };
    default:
      return state;
  }
}

const LINE_WRITE_DURATION = 600; // ms per line

function Notepad() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";
  const reducedMotion = useReducedMotion();

  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [state, dispatch] = useReducer(notepadReducer, {
    phase: "idle" as NotepadPhase,
    lineIndex: 0,
    lineProgress: 0,
    bobY: 0,
  });

  const animRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const page = notepadPages[currentPage];
  const totalLines = page.lines.length;

  /** Animate one line from 0→1 over LINE_WRITE_DURATION, then call onComplete */
  const animateLine = useCallback((onComplete: () => void) => {
    startRef.current = performance.now();
    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / LINE_WRITE_DURATION, 1);
      const bob = Math.sin((now / 120) * Math.PI * 2);
      dispatch({ type: "TICK", lineProgress: p, bobY: bob });
      if (p < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        onComplete();
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, []);

  /** Kick off the writing sequence whenever a page becomes active */
  useEffect(() => {
    if (reducedMotion) {
      dispatch({ type: "FINISH" });
      return;
    }
    // Start writing when idle (new page loaded)
    if (state.phase === "idle") {
      const t = setTimeout(() => dispatch({ type: "START_WRITING" }), 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [state.phase, reducedMotion, currentPage]);

  /** Drive line-by-line writing */
  useEffect(() => {
    if (state.phase !== "writing") return;

    if (state.lineIndex >= totalLines) {
      dispatch({ type: "FINISH" });
      return;
    }

    // Skip empty lines instantly
    if (page.lines[state.lineIndex].trim() === "") {
      const t = setTimeout(() => dispatch({ type: "ADVANCE_LINE" }), 80);
      return () => clearTimeout(t);
    }

    animateLine(() => {
      dispatch({ type: "ADVANCE_LINE" });
    });

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [state.phase, state.lineIndex, totalLines, page.lines, animateLine]);

  /** Page navigation */
  const goToPage = useCallback(
    (next: number) => {
      if (next < 0 || next >= notepadPages.length || isFlipping) return;
      if (animRef.current) cancelAnimationFrame(animRef.current);

      if (reducedMotion) {
        setCurrentPage(next);
        dispatch({ type: "RESET" });
        return;
      }

      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(next);
        dispatch({ type: "RESET" });
        setIsFlipping(false);
      }, 400);
    },
    [isFlipping, reducedMotion],
  );

  /** Is a given line fully or partially visible? */
  const lineVisible = (i: number) => {
    if (reducedMotion || state.phase === "display") return true;
    if (state.phase === "idle") return false;
    return i < state.lineIndex || (i === state.lineIndex && state.lineProgress > 0);
  };

  const lineClip = (i: number) => {
    if (reducedMotion || state.phase === "display") return "inset(0 0 0 0)";
    if (state.phase === "idle") return "inset(0 100% 0 0)";
    if (i < state.lineIndex) return "inset(0 0 0 0)";
    if (i === state.lineIndex) {
      const visible = state.lineProgress * 100;
      return `inset(0 ${100 - visible}% 0 0)`;
    }
    return "inset(0 100% 0 0)";
  };

  const pencilBob = state.bobY * 3;

  return (
    <div className="w-full max-w-xl mx-auto" style={{ perspective: "1000px" }}>
      {/* Spiral binding dots */}
      <div className="flex justify-center gap-6 mb-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border-2 ${
              isChalkboard
                ? "border-[var(--color-chalk-line)] bg-[var(--color-chalk-bg-dark)]"
                : "border-[var(--color-kraft)] bg-white"
            }`}
          />
        ))}
      </div>

      {/* Notepad body */}
      <div
        className={`relative rounded-sm border overflow-hidden ${
          isChalkboard
            ? "border-[var(--color-chalk-line)] bg-[var(--color-chalk-bg-dark)]"
            : "border-[var(--border)] bg-[var(--color-paper)]"
        }`}
        style={{
          transform: isFlipping ? "rotateY(-90deg)" : "rotateY(0deg)",
          transition: "transform 0.4s ease-in-out",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Red margin line */}
        <div
          className="absolute top-0 bottom-0 left-12 w-[2px]"
          style={{
            background: isChalkboard
              ? "rgba(220, 80, 80, 0.3)"
              : "rgba(220, 80, 80, 0.45)",
          }}
        />

        {/* Ruled lines background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isChalkboard
              ? "repeating-linear-gradient(transparent, transparent 23px, rgba(240,237,229,0.15) 23px, rgba(240,237,229,0.15) 24px)"
              : "repeating-linear-gradient(transparent, transparent 23px, rgba(160,130,100,0.35) 23px, rgba(160,130,100,0.35) 24px)",
            backgroundSize: "100% 24px",
          }}
        />

        {/* Page content */}
        <div className="relative pl-16 pr-6 py-6 min-h-[220px]">
          {page.lines.map((line, i) => (
            <div
              key={`${currentPage}-${i}`}
              className="relative"
              style={{ height: "24px", lineHeight: "24px" }}
            >
              <span
                className={`font-mono text-sm whitespace-pre ${
                  line.startsWith("->") || line.startsWith("//")
                    ? isChalkboard
                      ? "text-[var(--color-highlight-green)]"
                      : "text-[var(--color-link)]"
                    : isChalkboard
                      ? "text-[var(--color-chalk-white)]"
                      : "text-[var(--color-ink)]"
                }`}
                style={{ clipPath: lineClip(i) }}
              >
                {line || " "}
              </span>

              {/* Pencil sprite on current writing line */}
              {state.phase === "writing" &&
                i === state.lineIndex &&
                !reducedMotion &&
                line.trim() !== "" && (
                  <span
                    className="absolute -top-1"
                    style={{
                      left: `${state.lineProgress * 100}%`,
                      transform: `translateX(-50%) translateY(${pencilBob}px)`,
                    }}
                  >
                    <NotepadPencil />
                  </span>
                )}
            </div>
          ))}
        </div>

        {/* Page indicator */}
        <div className="px-6 pb-3 flex items-center justify-between text-xs text-[var(--text-faint)] font-mono">
          <span>page {currentPage + 1} / {notepadPages.length}</span>
          {lineVisible(totalLines - 1) && (
            <span className={isChalkboard ? "text-[var(--color-highlight-green)]" : "text-[var(--color-link)]"}>
              ▊
            </span>
          )}
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0 || isFlipping}
          className={`px-4 py-1.5 text-sm font-[family-name:var(--font-hand)] rounded-sm border transition-all duration-200
            ${
              currentPage === 0 || isFlipping
                ? "opacity-40 cursor-not-allowed border-[var(--border-light)] text-[var(--text-faint)]"
                : isChalkboard
                  ? "border-[var(--color-chalk-line)] text-[var(--color-chalk-white)] hover:-translate-y-0.5 hover:shadow-md"
                  : "border-[var(--border)] text-[var(--color-ink)] hover:-translate-y-0.5 hover:shadow-md"
            }`}
          aria-label="Previous page"
        >
          ← prev
        </button>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === notepadPages.length - 1 || isFlipping}
          className={`px-4 py-1.5 text-sm font-[family-name:var(--font-hand)] rounded-sm border transition-all duration-200
            ${
              currentPage === notepadPages.length - 1 || isFlipping
                ? "opacity-40 cursor-not-allowed border-[var(--border-light)] text-[var(--text-faint)]"
                : isChalkboard
                  ? "border-[var(--color-chalk-line)] text-[var(--color-chalk-white)] hover:-translate-y-0.5 hover:shadow-md"
                  : "border-[var(--border)] text-[var(--color-ink)] hover:-translate-y-0.5 hover:shadow-md"
            }`}
          aria-label="Next page"
        >
          next →
        </button>
      </div>
    </div>
  );
}

/* ─── About section ─────────────────────────────────────────── */

export function About() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  return (
    <section
      id="about"
      className={`relative px-6 py-20 scroll-mt-20 ${
        isChalkboard ? "bg-[var(--color-chalk-bg)]" : "bg-[var(--color-paper-warm)]"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section heading */}
        <h2
          className={`text-4xl font-[family-name:var(--font-hand)] font-bold mb-2 ${
            isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
          }`}
        >
          About Me
        </h2>
        <div
          className="w-24 h-1 rounded-full mb-8"
          style={{
            background: isChalkboard
              ? "var(--color-highlight-yellow)"
              : "var(--color-highlight-yellow)",
            opacity: isChalkboard ? 0.6 : 0.8,
          }}
        />

        <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl leading-relaxed">
          CS undergrad at FAST NUCES who loves building backend systems that
          don&apos;t fall over at 3 AM. When I&apos;m not writing code, I&apos;m
          probably debugging someone else&apos;s.
        </p>

        <Notepad />
      </div>
    </section>
  );
}
