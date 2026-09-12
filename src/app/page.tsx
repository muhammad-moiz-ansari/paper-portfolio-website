"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PencilCursor } from "@/components/pencil-cursor";
import { HighlightNav } from "@/components/highlight-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { TornEdge } from "@/components/torn-edge";
import { useTheme } from "@/lib/theme-context";

import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Education } from "@/components/sections/Education";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
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
  const observerRef = useRef<IntersectionObserver | null>(null);

  /** Smooth-scroll to the target section */
  const handleNavClick = useCallback((_index: number, href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  /** IntersectionObserver tracks which section is most visible */
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];

    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersection ratio
        let bestIndex = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            const idx = SECTION_IDS.indexOf(entry.target.id);
            if (idx !== -1) bestIndex = idx;
          }
        }
        if (bestIndex !== -1) {
          setActiveIndex(bestIndex);
        }
      },
      {
        threshold: [0.1, 0.3, 0.5],
        rootMargin: "-80px 0px 0px 0px",
      },
    );

    for (const section of sections) {
      observerRef.current.observe(section);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <PencilCursor enableTrail>
      {/* Sticky nav header */}
      <header
        className={`sticky top-0 z-40 flex items-center justify-between px-4 py-2 backdrop-blur-md border-b ${
          isChalkboard
            ? "bg-[var(--color-chalk-bg)]/90 border-[var(--color-chalk-line)]"
            : "bg-[var(--color-paper)]/90 border-[var(--border-light)]"
        }`}
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
        <Hero />
        <TornEdge />
        <About />
        <TornEdge flip />
        <Experience />
        <TornEdge />
        <Skills />
        <TornEdge flip />
        <Education />
        <TornEdge />
        <Projects />
        <TornEdge flip />
        <Contact />
      </main>

      {/* Simple footer */}
      <footer
        className={`py-6 text-center text-xs ${
          isChalkboard
            ? "text-[var(--color-chalk-white)] opacity-40"
            : "text-[var(--text-faint)]"
        }`}
      >
        © {new Date().getFullYear()} Moiz Ansari · Built with paper & pixels
      </footer>
    </PencilCursor>
  );
}
