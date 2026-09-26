"use client";

import React, { useState, useEffect, useReducer, useCallback, useRef } from "react";
import { useTheme } from "@/lib/theme-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { notepadPages, notepadPagesMobile } from "@/data/notepad-pages";
import { EraseWriteText } from "@/components/erase-write-text";
import { PaperButton } from "@/components/paper-button";
import { InkWashBackground } from "@/components/ink-wash-background";
import Image from "next/image";

/* ─── Notepad sub-component ─────────────────────────────────── */

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

type NotepadPhase = "idle" | "writing" | "display";

interface NotepadState {
  phase: NotepadPhase;
  lineIndex: number;
  lineProgress: number;
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

/* Pencil animation speed and duration */
const LINE_WRITE_DURATION = 600;
const AUTO_ADVANCE_DELAY = 3000;

function Notepad() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";
  const reducedMotion = useReducedMotion();

  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [state, dispatch] = useReducer(notepadReducer, {
    phase: "idle" as NotepadPhase,
    lineIndex: 0,
    lineProgress: 0,
    bobY: 0,
  });

  // Check window size on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      // 640px matches Tailwind's 'sm' breakpoint
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile(); // Run immediately on client load
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const animRef = useRef<number | null>(null);
  const startRef = useRef(0);

  // Dynamically select the correct array based on screen width
  const activePages = isMobile ? notepadPagesMobile : notepadPages;
  
  const page = activePages[currentPage];
  const nextPage = activePages[(currentPage + 1) % activePages.length];
  const totalLines = page.lines.length;

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

  useEffect(() => {
    if (reducedMotion) {
      dispatch({ type: "FINISH" });
      return;
    }
    if (state.phase === "idle") {
      const t = setTimeout(() => dispatch({ type: "START_WRITING" }), 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [state.phase, reducedMotion, currentPage]);

  useEffect(() => {
    if (state.phase !== "writing") return;

    if (state.lineIndex >= totalLines) {
      dispatch({ type: "FINISH" });
      return;
    }

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

  useEffect(() => {
    if (state.phase !== "display") return;

    const timer = setTimeout(() => {
      const next = (currentPage + 1) % activePages.length;

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
        }, 600);
      }
    }, AUTO_ADVANCE_DELAY);

    return () => clearTimeout(timer);
  }, [state.phase, currentPage, reducedMotion]);

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

  /* Pencil bobbing animation (Up and Down) */
  const pencilBob = state.bobY * 4; // Bobbing amplitude in pixels
  const textColor = isChalkboard ? "text-[var(--color-chalk-white)]" : "text-[var(--color-ink)]";
  const linkColor = isChalkboard ? "text-[var(--color-highlight-green)]" : "text-[var(--color-link)]";

  return (
    // Outer wrapper is strictly 392px tall (40px tape + 352px paper)
    <div className="w-full max-w-xl mx-auto drop-shadow-xl relative h-[392px]" style={{ perspective: "1200px" }}>
      
      {/* 1. TOP BINDING (Glued Edge) - Absolute sibling so it doesn't trap z-indexes */}
      <div className={`absolute top-0 left-0 w-full h-10 rounded-t-md z-20 overflow-hidden border-b-2 ${
        isChalkboard ? "bg-[#2A1111] border-[#1A0A0A]" : "bg-[#5A1818] border-[#3A0F0F]"
      }`}>
        <div className="absolute inset-0 opacity-30 mix-blend-multiply bg-[url('/textures/paper-light.jpg')] bg-cover pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-4 h-1.5 bg-gray-400/80 rounded-sm -translate-y-1/2 shadow-inner" />
        <div className="absolute top-1/2 right-1/4 w-4 h-1.5 bg-gray-400/80 rounded-sm -translate-y-1/2 shadow-inner" />
      </div>

      {/* 2. STATIC BACKGROUND PAGE (Layer underneath) */}
      <div className="absolute top-10 left-0 w-full h-[352px] bg-legal-pad rounded-b-md z-0 shadow-inner" />

      {/* 3. FLIPPING TOP PAGE (Current Page) */}
      <div 
        className={`absolute top-10 left-0 w-full h-[352px] bg-legal-pad rounded-b-md origin-top shadow-sm overflow-hidden ${
          isFlipping ? 'animate-page-flip z-30' : 'z-10'
        }`}
      >
        <div className="pl-[40px] min-[420px]:pl-[64px] pr-6 pt-[32px]">
          {page.lines.map((line, i) => (
            <div
              key={`${currentPage}-${i}`}
              className="relative"
              style={{ height: "32px", lineHeight: "32px" }}
            >
              <span
                className={`font-mono text-sm whitespace-pre ${
                  line.startsWith("->") || line.startsWith("//") ? linkColor : textColor
                }`}
                style={{ clipPath: lineClip(i) }}
              >
                {line || " "}
              </span>

              {/* Pencil sprite flipped 180 degrees */}
              {state.phase === "writing" &&
                i === state.lineIndex &&
                !reducedMotion &&
                line.trim() !== "" && (
                  <span
                    className="absolute top-1"
                    style={{
                      /* 
                        Change 1.5 to adjust pencil horizontal speed!
                        - 1.5 makes the pencil move 50% faster than the text
                        - 0.8 makes the pencil move slower than the text 
                      */
                      left: `${Math.min(state.lineProgress * 0.8 * 100, 100)}%`,
                      transform: `translateX(-50%) translateY(${pencilBob}px)`,
                    }}
                  >
                    <NotepadPencil className="rotate-80" />
                  </span>
                )}
            </div>
          ))}
        </div>

        {/* Page indicator forced to the very last line segment at the bottom */}
        <div className="absolute bottom-0 h-[32px] left-[40px] min-[420px]:left-[64px] right-6 flex items-center justify-between text-xs text-[var(--text-faint)] font-mono">
          <span>page {currentPage + 1} / {activePages.length}</span>
          {lineVisible(totalLines - 1) && (
            <span className={linkColor}>▊</span>
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
      <InkWashBackground />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1
              className={`text-5xl sm:text-6xl md:text-7xl font-[family-name:var(--font-hand)] font-bold tracking-tight leading-tight ${
                isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
              }`}
            >
              Moiz Ansari
            </h1>

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

            <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg">
              CS undergrad at FAST NUCES who loves building backend systems that
              don&apos;t fall over at 3 AM. When I&apos;m not writing code, I&apos;m
              probably debugging someone else&apos;s.
            </p>

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

            <div className="mt-6 flex gap-4">
              <a
                href="https://github.com/muhammad-moiz-ansari"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-60 transition-opacity [[data-theme='chalkboard']_&]:invert"
                aria-label="GitHub"
              >
                <Image src="/icons/github-icon.png" alt="GitHub" width={28} height={28} className="w-[28px] h-[28px] object-contain" />
              </a>
              <a
                href="https://linkedin.com/in/muhammad-moiz-ansari"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-60 transition-opacity [[data-theme='chalkboard']_&]:invert"
                aria-label="LinkedIn"
              >
                <Image src="/icons/linkedin-icon.png" alt="LinkedIn" width={28} height={28} className="w-[28px] h-[28px] object-contain" />
              </a>
            </div>
          </div>

          <div>
            <Notepad />
          </div>
        </div>
      </div>
    </section>
  );
}