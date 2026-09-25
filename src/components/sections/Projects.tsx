"use client";

import { useTheme } from "@/lib/theme-context";
import { PaperCard } from "@/components/paper-card";
import { projects } from "@/data/projects";
import { DoodleGithub } from "@/components/doodle-icons";

export function Projects() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  const realProjects = projects.filter((p) => !p.isPlaceholder);
  const placeholders = projects.filter((p) => p.isPlaceholder);

  return (
    <section
      id="projects"
      className={`relative px-6 py-20 scroll-mt-20 bg-halftone ${
        isChalkboard ? "bg-[var(--color-chalk-bg)]" : "bg-[var(--color-paper-warm)]"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <h2
          className={`text-4xl font-[family-name:var(--font-hand)] font-bold mb-2 ${
            isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
          }`}
        >
          Projects
        </h2>
        <div
          className="w-24 h-1 rounded-full mb-12"
          style={{
            background: "var(--color-highlight-yellow)",
            opacity: isChalkboard ? 0.6 : 0.8,
          }}
        />

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Real projects */}
          {realProjects.map((project) => (
            <div key={project.id} className="flex flex-col">
              <PaperCard
                title={project.title}
                description={project.description}
                details={project.bullets.slice(0, 2).join(" · ")}
                tags={project.techStack}
              />

              {/* Links row */}
              {project.githubLink && (
                <div className="mt-2 flex gap-3 pl-1">
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[var(--text-faint)] hover:text-[var(--color-link)] transition-colors"
                  >
                    <DoodleGithub size={14} />
                    <span>Source</span>
                  </a>
                </div>
              )}
            </div>
          ))}

          {/* Placeholder cards */}
          {placeholders.map((p) => (
            <div
              key={p.id}
              className={`relative rounded border-2 border-dashed p-6 flex items-center justify-center min-h-[160px] transition-all duration-300 hover:scale-[1.02] ${
                isChalkboard
                  ? "border-[var(--color-chalk-line)] text-[var(--color-chalk-white)]"
                  : "border-[var(--border)] text-[var(--text-faint)]"
              }`}
              style={{ opacity: 0.6 }}
            >
              <div className="text-center font-[family-name:var(--font-hand)]">
                <div className="text-2xl mb-1">✏️</div>
                <div className="text-lg">{p.title}</div>
                <div className="text-xs mt-1 opacity-70">{p.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
