import { PushPin } from "@/components/push-pin";
import { experienceEntries } from "@/data/experience";

/** Small rotation values for scattered-pinned look */
const ROTATIONS = [-1.5, 1, -0.5, 1.5];

export function Experience() {
  return (
    <section id="experience" className="relative px-6 py-20 scroll-mt-20 paper-texture bg-corkboard">
      <div className="max-w-3xl mx-auto">
        {/* Section heading */}
        <h2
          className="text-4xl font-[family-name:var(--font-hand)] font-bold mb-2 server-section-heading"
        >
          Experience
        </h2>
        <div
          className="w-24 h-1 rounded-full mb-12"
          style={{
            background: "var(--color-highlight-yellow)",
            opacity: "var(--section-accent-opacity)",
          }}
        />

        {/* Vertical timeline */}
        <div className="relative">
          {/* Timeline spine — pink accent like style guide blockquote */}
          <div
            className="absolute left-4 top-0 bottom-0 w-[3px] rounded-full"
            style={{
              background: "var(--timeline-spine)",
            }}
          />

          <div className="flex flex-col gap-10">
            {experienceEntries.map((entry, i) => (
              <div key={entry.id} className="relative pl-12">
                {/* Timeline dot */}
                <div
                  className="absolute left-[7px] top-4 w-5 h-5 rounded-full border-2 border-[#E8A0A8] bg-[var(--color-paper)] [[data-theme='chalkboard']_&]:border-[rgba(232,160,168,0.6)] [[data-theme='chalkboard']_&]:bg-[var(--color-chalk-bg)]"
                  style={{ zIndex: 1 }}
                />

                {/* Date tag */}
                <span
                  className="inline-block mb-2 text-xs font-mono px-2 py-0.5 rounded-sm bg-[var(--color-kraft-light)] text-[var(--color-brown-dark)] border border-[var(--border-light)] [[data-theme='chalkboard']_&]:bg-[var(--color-chalk-bg-dark)] [[data-theme='chalkboard']_&]:text-[var(--color-chalk-white)] [[data-theme='chalkboard']_&]:border [[data-theme='chalkboard']_&]:border-[var(--color-chalk-line)]"
                >
                  {entry.date}
                </span>

                {/* Index card — pinned notebook page style */}
                <div
                  className="relative p-5 rounded-sm transition-all duration-300 bg-[var(--color-paper)] border border-[var(--border-light)] [[data-theme='chalkboard']_&]:bg-[var(--color-chalk-bg-dark)] [[data-theme='chalkboard']_&]:border [[data-theme='chalkboard']_&]:border-[var(--color-chalk-line)]"
                  style={{
                    transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
                    boxShadow: "var(--experience-card-shadow)",
                  }}
                >
                  {/* Pin decoration */}
                  <div className="absolute -top-3 right-6">
                    <PushPin size={20} />
                  </div>

                  {/* Red ruled line at top — like an index card */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: "rgba(232, 160, 168, 0.5)" }}
                  />

                  {/* Left margin line removed — was rendering as a stray
                     artifact at the card edge. The top ruled line + pin
                     are enough to convey the index-card look. */}

                  <h3 className="text-lg font-bold font-[family-name:var(--font-hand)] mb-1 text-[var(--text)]">
                    {entry.role}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-1 font-[family-name:var(--font-hand)]">
                    {entry.company} · {entry.location}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] italic mb-3">
                    {entry.description}
                  </p>

                  {entry.bullets.length > 0 && (
                    <ul className="space-y-1.5 ml-6">
                      {entry.bullets.map((bullet, j) => (
                        <li
                          key={j}
                          className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                        >
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background: "var(--section-ink)",
                              opacity: 0.5,
                            }}
                          />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
