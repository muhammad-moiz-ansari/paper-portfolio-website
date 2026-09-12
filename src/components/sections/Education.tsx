"use client";

import { useTheme } from "@/lib/theme-context";
import { PaperCard } from "@/components/paper-card";
import { StickyNote } from "@/components/sticky-note";
import { educationEntries, awardEntries } from "@/data/education";

export function Education() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  return (
    <section id="education" className="relative px-6 py-20 scroll-mt-20 paper-graph">
      <div className="max-w-3xl mx-auto">
        {/* Section heading */}
        <h2
          className={`text-4xl font-[family-name:var(--font-hand)] font-bold mb-2 ${
            isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
          }`}
        >
          Education
        </h2>
        <div
          className="w-24 h-1 rounded-full mb-12"
          style={{
            background: "var(--color-highlight-yellow)",
            opacity: isChalkboard ? 0.6 : 0.8,
          }}
        />

        <div className="space-y-8">
          {educationEntries.map((entry) => (
            <PaperCard
              key={entry.id}
              title={`${entry.degree} — ${entry.institution}`}
              description={`${entry.location} · ${entry.date}`}
              details={entry.details.join(" • ")}
            />
          ))}
        </div>

        {/* Awards */}
        {/*
        Inshallah some day later
        
        {awardEntries.length > 0 && (
          <div className="mt-12">
            <h3
              className={`text-xl font-[family-name:var(--font-hand)] mb-6 ${
                isChalkboard ? "text-[var(--color-chalk-white)]" : "text-[var(--color-ink)]"
              }`}
            >
              Awards
            </h3>
            <div className="flex flex-wrap gap-4">
              {awardEntries.map((award, i) => (
                <StickyNote
                  key={award.id}
                  color={i % 2 === 0 ? "yellow" : "pink"}
                  rotate={i % 2 === 0 ? -2 : 3}
                  decoration="pin"
                >
                  <div className="font-bold text-sm">{award.title}</div>
                  <div className="text-xs mt-1 opacity-70">{award.issuer} · {award.date}</div>
                </StickyNote>
              ))}
            </div>
          </div>
        )}
        */}
      </div>
    </section>
  );
}
