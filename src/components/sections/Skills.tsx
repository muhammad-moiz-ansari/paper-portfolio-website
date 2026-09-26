"use client";

import { useTheme } from "@/lib/theme-context";
import { StickyNote } from "@/components/sticky-note";
import { skillCategories } from "@/data/skills";

/** Rotation values that cycle so the notes look hand-scattered */
const ROTATIONS = [-3, 2, -1, 4, -2, 3, 0, -4, 1, -3, 2, -1];
/** Color cycle for sticky notes */
const COLORS = ["yellow", "pink", "blue"] as const;
/** Decoration cycle */
const DECOS = ["tape", "pin"] as const;

export function Skills() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  let chipIndex = 0;

  return (
    <section
      id="skills"
      // EDIT: FELT BOARD COLORS — felt memo board texture class; light/dark variants defined in globals.css
      className="relative px-6 py-20 scroll-mt-20 paper-felt"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <h2
          className={`text-4xl font-[family-name:var(--font-hand)] font-bold mb-2 ${
            isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
          }`}
        >
          Skills
        </h2>
        <div
          className="w-24 h-1 rounded-full mb-12"
          style={{
            background: "var(--color-highlight-yellow)",
            opacity: isChalkboard ? 0.6 : 0.8,
          }}
        />

        {skillCategories.map((cat, catIdx) => (
          <div key={cat.label} className={catIdx > 0 ? "mt-12" : ""}>
            {/* Category label */}
            <h3
              className={`text-xl font-[family-name:var(--font-hand)] mb-6 ${
                isChalkboard ? "text-[var(--color-chalk-white)]" : "text-[var(--color-ink)]"
              }`}
            >
              {cat.label}
            </h3>

            {/* Scattered sticky notes */}
            <div className="flex flex-wrap gap-4 justify-start">
              {cat.items.map((skill) => {
                const idx = chipIndex++;
                const rot = ROTATIONS[idx % ROTATIONS.length];
                const color = COLORS[idx % COLORS.length];
                const deco = DECOS[idx % DECOS.length];

                return (
                  <StickyNote
                    key={skill}
                    color={color}
                    rotate={rot}
                    decoration={deco}
                    className="!min-w-0 !p-3 !pt-4 text-sm"
                  >
                    {skill}
                  </StickyNote>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
