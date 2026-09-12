"use client";

import { useTheme } from "@/lib/theme-context";
import { PaperCard } from "@/components/paper-card";
import { experienceEntries } from "@/data/experience";

export function Experience() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  return (
    <section id="experience" className="relative px-6 py-20 scroll-mt-20 paper-texture">
      <div className="max-w-3xl mx-auto">
        {/* Section heading */}
        <h2
          className={`text-4xl font-[family-name:var(--font-hand)] font-bold mb-2 ${
            isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
          }`}
        >
          Experience
        </h2>
        <div
          className="w-24 h-1 rounded-full mb-12"
          style={{
            background: "var(--color-highlight-yellow)",
            opacity: isChalkboard ? 0.6 : 0.8,
          }}
        />

        {/* Vertical timeline */}
        <div className="relative">
          {/* Timeline spine */}
          <div
            className="absolute left-4 top-0 bottom-0 w-[2px]"
            style={{
              background: isChalkboard
                ? "var(--color-chalk-line)"
                : "var(--border)",
            }}
          />

          <div className="flex flex-col gap-10">
            {experienceEntries.map((entry, i) => (
              <div key={entry.id} className="relative pl-12">
                {/* Timeline dot */}
                <div
                  className={`absolute left-2.5 top-4 w-4 h-4 rounded-full border-2 ${
                    isChalkboard
                      ? "border-[var(--color-chalk-white)] bg-[var(--color-chalk-bg)]"
                      : "border-[var(--color-ink)] bg-[var(--color-paper)]"
                  }`}
                  style={{ zIndex: 1 }}
                />

                {/* Date tag */}
                <span
                  className={`inline-block mb-2 text-xs font-mono px-2 py-0.5 rounded-sm ${
                    isChalkboard
                      ? "bg-[var(--color-chalk-bg-dark)] text-[var(--color-chalk-white)] border border-[var(--color-chalk-line)]"
                      : "bg-[var(--color-kraft-light)] text-[var(--color-brown-dark)] border border-[var(--border-light)]"
                  }`}
                >
                  {entry.date}
                </span>

                <PaperCard
                  title={`${entry.role} — ${entry.company}`}
                  description={entry.description}
                  details={entry.location}
                  tags={entry.bullets.length > 0 ? undefined : ["Details coming soon"]}
                />

                {entry.bullets.length > 0 && (
                  <ul className="mt-3 ml-4 space-y-1.5">
                    {entry.bullets.map((bullet, j) => (
                      <li
                        key={j}
                        className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: isChalkboard
                              ? "var(--color-chalk-white)"
                              : "var(--color-ink)",
                            opacity: 0.5,
                          }}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
