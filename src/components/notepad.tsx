"use client";

import React, { useState, useEffect, useReducer, useCallback, useRef } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { notepadPages, notepadPagesMobile } from "@/data/notepad-pages";
import { useVisibleTimeline } from "@/lib/use-visible-timeline";

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
}

type NotepadAction =
  | { type: "START_WRITING" }
  | { type: "ADVANCE_LINE" }
  | { type: "FINISH" }
  | { type: "RESET" };

function notepadReducer(state: NotepadState, action: NotepadAction): NotepadState {
  switch (action.type) {
    case "START_WRITING":
      return { phase: "writing", lineIndex: 0 };
    case "ADVANCE_LINE":
      return { ...state, lineIndex: state.lineIndex + 1 };
    case "FINISH":
      return { ...state, phase: "display" };
    case "RESET":
      return { phase: "idle", lineIndex: 0 };
    default:
      return state;
  }
}

/* Pencil animation speed and duration */
const LINE_WRITE_DURATION = 600;
const AUTO_ADVANCE_DELAY = 3000;

export function Notepad() {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pencilRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const clock = useVisibleTimeline(rootRef);

  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [state, dispatch] = useReducer(notepadReducer, {
    phase: "idle" as NotepadPhase,
    lineIndex: 0,
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
  const totalLines = page.lines.length;

  const animateLine = useCallback((onComplete: () => void) => {
    const text = textRefs.current[state.lineIndex];
    startRef.current = clock.now();
    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / LINE_WRITE_DURATION, 1);
      const bob = Math.sin((now / 120) * Math.PI * 2);
      if (text) text.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
      if (pencilRef.current) {
        pencilRef.current.style.left = `${Math.min(p * 0.8 * 100, 100)}%`;
        pencilRef.current.style.transform = `translateX(-50%) translateY(${bob * 4}px)`;
      }
      if (state.lineIndex === totalLines - 1 && markerRef.current) markerRef.current.style.visibility = "visible";
      if (p < 1) {
        animRef.current = clock.frame(step);
      } else {
        onComplete();
      }
    };
    animRef.current = clock.frame(step);
  }, [clock, state.lineIndex, totalLines]);

  useEffect(() => {
    if (reducedMotion) {
      dispatch({ type: "FINISH" });
      return;
    }
    if (state.phase === "idle") {
      const t = clock.timeout(() => dispatch({ type: "START_WRITING" }), 300);
      return () => clock.clearTimeout(t);
    }
    return undefined;
  }, [clock, state.phase, reducedMotion, currentPage]);

  useEffect(() => {
    if (state.phase !== "writing") return;

    if (state.lineIndex >= totalLines) {
      dispatch({ type: "FINISH" });
      return;
    }

    if (page.lines[state.lineIndex].trim() === "") {
      const t = clock.timeout(() => dispatch({ type: "ADVANCE_LINE" }), 80);
      return () => clock.clearTimeout(t);
    }

    animateLine(() => {
      dispatch({ type: "ADVANCE_LINE" });
    });

    return () => {
      if (animRef.current) clock.cancelFrame(animRef.current);
    };
  }, [state.phase, state.lineIndex, totalLines, page.lines, animateLine, clock]);

  const advancePage = useCallback(() => {
    setCurrentPage(page => (page + 1) % activePages.length);
    dispatch({ type: "RESET" });
    setIsFlipping(false);
  }, [activePages.length]);

  useEffect(() => {
    if (state.phase !== "display" || isFlipping) return;
    const timer = clock.timeout(() => {
      if (reducedMotion) advancePage();
      else setIsFlipping(true);
    }, AUTO_ADVANCE_DELAY);
    return () => clock.clearTimeout(timer);
  }, [clock, state.phase, currentPage, reducedMotion, isFlipping, advancePage]);

  useEffect(() => {
    if (!isFlipping) return;
    // Preference changes can hide the motion without cancelling the page turn.
    const timer = clock.timeout(advancePage, 600);
    return () => clock.clearTimeout(timer);
  }, [clock, isFlipping, advancePage]);

  const lineVisible = (i: number) => reducedMotion || state.phase === "display" || (state.phase === "writing" && i < state.lineIndex);
  const textColor = "text-[var(--section-ink)]";
  const linkColor = "text-[var(--notepad-link)]";

  return (
    // Outer wrapper is strictly 392px tall (40px tape + 352px paper)
    <div ref={rootRef} className="w-full max-w-xl mx-auto drop-shadow-xl relative h-[392px]" style={{ perspective: "1200px" }}>
      
      {/* 1. TOP BINDING (Glued Edge) - Absolute sibling so it doesn't trap z-indexes */}
      <div className="absolute top-0 left-0 w-full h-10 rounded-t-md z-20 overflow-hidden border-b-2 bg-[#5A1818] border-[#3A0F0F] [[data-theme=chalkboard]_&]:bg-[#2A1111] [[data-theme=chalkboard]_&]:border-[#1A0A0A]">
        <div className="absolute inset-0 opacity-30 mix-blend-multiply bg-[url('/textures/paper-light.jpg')] bg-cover pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-4 h-1.5 bg-gray-400/80 rounded-sm -translate-y-1/2 shadow-inner" />
        <div className="absolute top-1/2 right-1/4 w-4 h-1.5 bg-gray-400/80 rounded-sm -translate-y-1/2 shadow-inner" />
      </div>

      {/* 2. STATIC BACKGROUND PAGE (Layer underneath) */}
      <div className="absolute top-10 left-0 w-full h-[352px] bg-legal-pad rounded-b-md z-0 shadow-inner" />

      {/* 3. FLIPPING TOP PAGE (Current Page) */}
      <div 
        className={`absolute top-10 left-0 w-full h-[352px] bg-legal-pad rounded-b-md origin-top shadow-sm overflow-hidden ${
          isFlipping && !reducedMotion ? 'animate-page-flip z-30' : 'z-10'
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
                ref={element => { textRefs.current[i] = element; }}
                className={`font-mono text-sm whitespace-pre ${
                  line.startsWith("->") || line.startsWith("//") ? linkColor : textColor
                }`}
                style={{ clipPath: lineVisible(i) ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" }}
              >
                {line || " "}
              </span>

              {/* Pencil sprite flipped 180 degrees */}
              {state.phase === "writing" &&
                i === state.lineIndex &&
                !reducedMotion &&
                line.trim() !== "" && (
                  <span
                    ref={pencilRef}
                    className="absolute top-1"
                    style={{ left: "0%", transform: "translateX(-50%) translateY(0px)" }}
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
          {(lineVisible(totalLines - 1) || (state.phase === "writing" && state.lineIndex === totalLines - 1)) && (
            <span ref={markerRef} style={{ visibility: lineVisible(totalLines - 1) ? "visible" : "hidden" }} className={linkColor}>▊</span>
          )}
        </div>
      </div>

    </div>
  );
}

