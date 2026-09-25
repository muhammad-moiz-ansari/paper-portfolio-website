"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PencilCursor } from "@/components/pencil-cursor";
import { HighlightNav } from "@/components/highlight-nav";
import { MobileFoldNav } from "@/components/mobile-fold-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { TornEdge } from "@/components/torn-edge";
import { useTheme } from "@/lib/theme-context";

import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Education } from "@/components/sections/Education";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

// EDIT: NAV LABELS — the text labels for navigation tabs in the header
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

  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

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
      {/* Sticky nav header — responsive grid: logo absolute-centers on mobile, far-left on desktop */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 backdrop-blur-md border-b bg-[var(--bg)]/90 border-[var(--border-light)] min-h-[60px]">
        {/* Mobile Menu Toggle (Left on mobile, hidden on desktop) */}
        <div className="flex md:hidden w-1/3 justify-start">
          <MobileFoldNav items={NAV_ITEMS} activeIndex={activeIndex} onItemClick={handleNavClick} />
        </div>

        {/* EDIT: LOGO — single logo, absolute-centered on mobile, far-left on desktop */}
        {/* Single Logo (Centered on mobile, Far-Left on desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex md:w-1/3 md:justify-start z-50">
          <a
            href="#about"
            aria-label="Back to top"
            className="flex items-center hover:opacity-70 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Image src="/ma-logo-light.png" alt="Moiz Ansari Logo" width={36} height={36} className={`w-9 h-9 object-contain ${isChalkboard ? "hidden" : "block"}`} />
            <Image src="/ma-logo-dark.png" alt="Moiz Ansari Logo" width={36} height={36} className={`w-9 h-9 object-contain ${isChalkboard ? "block" : "hidden"}`} />
          </a>
        </div>

        {/* Desktop Nav (Hidden on mobile, Centered on desktop) */}
        <div className="hidden md:flex md:w-1/3 md:justify-center">
          <HighlightNav items={NAV_ITEMS} activeIndex={activeIndex} onItemClick={handleNavClick} />
        </div>

        {/* Theme Toggle (Right) */}
        <div className="flex w-1/3 justify-end z-50">
          <ThemeToggle />
        </div>
      </header>

      <main>
        <About />
        <TornEdge seed={1} />
        <Experience />
        <TornEdge seed={2} />
        <Skills />
        <TornEdge seed={3} />
        <Education />
        <TornEdge seed={4} />
        <Projects />
        <TornEdge seed={5} />
        <Contact />
      </main>

      {/* Simple footer — uses CSS variables for theme-aware styling */}
      {/* EDIT: FOOTER TEXT — copyright and footer message */}
      <footer className="py-6 text-center text-xs text-[var(--text-faint)]">
        © {new Date().getFullYear()} Moiz Ansari · Built with paper & pixels
      </footer>
    </PencilCursor>
  );
}
