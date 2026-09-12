"use client";

import { EraseWriteText } from "@/components/erase-write-text";
import { useTheme } from "@/lib/theme-context";
import { DoodleArrowRight } from "@/components/doodle-icons";

const TAGLINES = [
  "backend developer",
  "system designer",
  "CS student",
  "problem solver",
  "open-source tinkerer",
];

export function Hero() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 py-20 paper-texture scroll-mt-20"
    >
      {/* Name */}
      <h1
        className={`text-6xl sm:text-7xl md:text-8xl font-[family-name:var(--font-hand)] font-bold tracking-tight text-center leading-tight ${
          isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
        }`}
      >
        Moiz Ansari
      </h1>

      {/* Cycling tagline */}
      <div className="mt-6 text-2xl sm:text-3xl text-[var(--text-secondary)]">
        <span className="font-[family-name:var(--font-hand)]">I&apos;m a </span>
        <EraseWriteText
          phrases={TAGLINES}
          displayDuration={2200}
          eraseDuration={1000}
          writeDuration={1000}
          className="text-2xl sm:text-3xl"
        />
      </div>

      {/* Short intro line */}
      <p className="mt-8 max-w-md text-center text-lg text-[var(--text-secondary)] font-[family-name:var(--font-body)]">
        Building reliable backend systems &amp; exploring distributed computing
        — one commit at a time.
      </p>

      {/* Scroll hint */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2 text-[var(--text-faint)] animate-bounce">
        <span className="text-sm font-[family-name:var(--font-hand)]">scroll down</span>
        <DoodleArrowRight size={20} className="rotate-90" />
      </div>
    </section>
  );
}
