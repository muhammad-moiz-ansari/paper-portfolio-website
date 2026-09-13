"use client";

import React, { useState, useEffect, useReducer, useCallback, useRef } from "react";
import { useTheme } from "@/lib/theme-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { notepadPages } from "@/data/notepad-pages";
import { EraseWriteText } from "@/components/erase-write-text";
import { PaperButton } from "@/components/paper-button";
import { DoodleGithub, DoodleLinkedin } from "@/components/doodle-icons";

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

const LINE_WRITE_DURATION = 600;
const AUTO_ADVANCE_DELAY = 3000;

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

  /** Auto-advance to next page after display phase */
  useEffect(() => {
    if (state.phase !== "display") return;

    const timer = setTimeout(() => {
      const next = (currentPage + 1) % notepadPages.length;

      if (animRef.current) cancelAnimationFrame(animRef.current);

      if (reducedMotion) {
        setCurrentPage(next);
        dispatch({ type: "RESET" });
      } else {
        setIsFlipping(true);
        setTimeout(() => {
          setCurrentPage(next);
          dispatch({ type: "RESET" });
          setIsFlipping(false);
        }, 400);
      }
    }, AUTO_ADVANCE_DELAY);

    return () => clearTimeout(timer);
  }, [state.phase, currentPage, reducedMotion]);

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

  // Wire color for spiral binding
  const wireColor = isChalkboard ? "rgba(240,237,229,0.25)" : "#908070";
  const wireShadow = isChalkboard ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)";
  const holeBg = isChalkboard ? "var(--color-chalk-bg)" : "#E8E0D0";
  const holeBorder = isChalkboard ? "rgba(240,237,229,0.15)" : "#C4B8A4";

  return (
    <div className="w-full max-w-xl mx-auto" style={{ perspective: "1000px" }}>
      {/* Spiral binding — half-rings protruding from the top edge of the notepad.
          Each ring is an SVG semicircle that sits above the notepad body,
          with a matching punch-hole at the top of the pad. */}
      <div className="relative" style={{ marginBottom: "-2px" }}>
        <div className="flex justify-center gap-8 px-8">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="relative flex flex-col items-center" style={{ width: "20px" }}>
              {/* Wire half-ring — arches above the notepad */}
              <svg
                width="20" height="14" viewBox="0 0 20 14"
                className="block"
                style={{
                  filter: `drop-shadow(0 1px 1px ${wireShadow})`,
                }}
              >
                <path
                  d="M2,14 A8,10 0 0,1 18,14"
                  fill="none"
                  stroke={wireColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              {/* Punch hole — sits at the top of the notepad body */}
              <div
                className="w-3 h-3 rounded-full border"
                style={{
                  background: holeBg,
                  borderColor: holeBorder,
                  marginTop: "-2px",
                  position: "relative",
                  zIndex: 3,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notepad body — with deckled edges and shadow */}
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
          boxShadow: isChalkboard
            ? "3px 4px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)"
            : "3px 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06), -1px 0 0 rgba(0,0,0,0.02), 1px 0 0 rgba(0,0,0,0.02)",
        }}
      >
        {/* Deckled right edge */}
        <div
          className="absolute top-0 bottom-0 right-0 w-[3px] pointer-events-none"
          style={{
            background: isChalkboard
              ? "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 10%, transparent 20%, rgba(255,255,255,0.02) 30%, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%, rgba(255,255,255,0.02) 70%, transparent 80%, rgba(255,255,255,0.03) 90%, transparent 100%)"
              : "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.03) 10%, transparent 20%, rgba(0,0,0,0.02) 30%, transparent 40%, rgba(0,0,0,0.04) 50%, transparent 60%, rgba(0,0,0,0.02) 70%, transparent 80%, rgba(0,0,0,0.03) 90%, transparent 100%)",
          }}
        />

        {/* Paper texture/grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
            opacity: isChalkboard ? 0.04 : 0.06,
            mixBlendMode: isChalkboard ? "overlay" : "multiply",
          }}
        />

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
                {line || " "}
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
    </div>
  );
}

/* ─── About section (merged Hero + About) ─────────────────── */

const TAGLINES = [
  "backend developer",
  "system designer",
  "CS student",
  "problem solver",
  "open-source tinkerer",
];

export function About() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  return (
    <section
      id="about"
      className={`relative px-6 py-20 scroll-mt-20 min-h-[85vh] flex items-center ${
        isChalkboard ? "bg-[var(--color-chalk-bg)]" : "bg-[var(--color-paper-warm)]"
      }`}
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side — intro */}
          <div>
            <h1
              className={`text-5xl sm:text-6xl md:text-7xl font-[family-name:var(--font-hand)] font-bold tracking-tight leading-tight ${
                isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
              }`}
            >
              Moiz Ansari
            </h1>

            {/* Cycling tagline */}
            <div className="mt-4 text-2xl sm:text-3xl text-[var(--text-secondary)]">
              <span className="font-[family-name:var(--font-hand)]">I&apos;m a </span>
              <EraseWriteText
                phrases={TAGLINES}
                displayDuration={2200}
                eraseDuration={1000}
                writeDuration={1000}
                className="text-2xl sm:text-3xl"
              />
            </div>

            {/* About paragraph */}
            <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg">
              CS undergrad at FAST NUCES who loves building backend systems that
              don&apos;t fall over at 3 AM. When I&apos;m not writing code, I&apos;m
              probably debugging someone else&apos;s.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <PaperButton
                variant="primary"
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Work →
              </PaperButton>
              <PaperButton
                variant="secondary"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Get in Touch
              </PaperButton>
            </div>

            {/* Social links */}
            <div className="mt-6 flex gap-4">
              <a
                href="https://github.com/muhammad-moiz-ansari"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                aria-label="GitHub"
              >
                <DoodleGithub size={28} />
              </a>
              <a
                href="https://linkedin.com/in/muhammad-moiz-ansari"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
                aria-label="LinkedIn"
              >
                <DoodleLinkedin size={28} />
              </a>
            </div>
          </div>

          {/* Right side — Notepad */}
          <div>
            <Notepad />
          </div>
        </div>
      </div>
    </section>
  );
}
