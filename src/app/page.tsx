"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PencilCursor } from "@/components/pencil-cursor";
import { HighlightNav } from "@/components/highlight-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { TornEdge } from "@/components/torn-edge";

import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Education } from "@/components/sections/Education";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "EXP", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const SECTION_IDS = NAV_ITEMS.map((item) => item.href.slice(1));

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);

  /** Smooth-scroll to the target section */
  const handleNavClick = useCallback((_index: number, href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  /**
   * IntersectionObserver tracks which section is most visible.
   *
   * Uses a low threshold (0.01) so even short sections fire callbacks,
   * then picks the section with the largest visible overlap area
   * (intersectionRatio × boundingHeight). Falls back to whichever
   * section's midpoint is closest to the viewport midpoint.
   */
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];

    if (sections.length === 0) return;

    // Track latest intersection ratios for all observed sections
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        // Find the section with the largest visible area
        let bestIndex = -1;
        let bestScore = 0;

        for (const section of sections) {
          const ratio = ratios.get(section.id) ?? 0;
          if (ratio <= 0) continue;

          // Score = ratio × section height → rewards actual visible pixels
          const score = ratio * section.getBoundingClientRect().height;
          const idx = SECTION_IDS.indexOf(section.id);
          if (score > bestScore && idx !== -1) {
            bestScore = score;
            bestIndex = idx;
          }
        }

        // Fallback for short sections: pick the one whose midpoint is
        // closest to the viewport's vertical midpoint
        if (bestIndex === -1) {
          const vpMid = window.innerHeight / 2;
          let closestDist = Infinity;

          for (const section of sections) {
            const rect = section.getBoundingClientRect();
            const secMid = rect.top + rect.height / 2;
            const dist = Math.abs(secMid - vpMid);
            const idx = SECTION_IDS.indexOf(section.id);
            if (dist < closestDist && idx !== -1) {
              closestDist = dist;
              bestIndex = idx;
            }
          }
        }

        if (bestIndex !== -1) {
          setActiveIndex(bestIndex);
        }
      },
      {
        // Very low threshold so even tiny sections fire the callback
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: "-80px 0px 0px 0px",
      },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <PencilCursor enableTrail>
      {/* Sticky nav header — uses CSS variables for theme-aware styling */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 backdrop-blur-md border-b bg-[var(--bg)]/90 border-[var(--border-light)]"
      >
        <div className="overflow-x-auto flex-1">
          <HighlightNav
            items={NAV_ITEMS}
            activeIndex={activeIndex}
            onItemClick={handleNavClick}
          />
        </div>
        <ThemeToggle className="ml-2 shrink-0" />
      </header>

      <main>
        <About />
        <TornEdge flip seed={1} />
        <Experience />
        <TornEdge seed={2} />
        <Skills />
        <TornEdge flip seed={3} />
        <Education />
        <TornEdge seed={4} />
        <Projects />
        <TornEdge flip seed={5} />
        <Contact />
      </main>

      {/* Simple footer — uses CSS variables for theme-aware styling */}
      <footer className="py-6 text-center text-xs text-[var(--text-faint)]">
        © {new Date().getFullYear()} Moiz Ansari · Built with paper & pixels
      </footer>
    </PencilCursor>
  );
}
