"use client";

/**
 * PaperCard — A project card styled like a folder/envelope
 *
 * Default state: looks like a closed manila folder with a tab at the top.
 * Hover: the folder "lifts" and tilts slightly, showing a peek of content.
 * Expanded/open: the envelope flap opens to reveal full project details.
 *
 * Uses CSS perspective and transform for the 3D open effect.
 */

import React, { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { PaperClip } from "./paper-clip";

interface PaperCardProps {
  title: string;
  description: string;
  /** Content revealed when the card is opened */
  details?: string;
  tags?: string[];
  className?: string;
  /** Force a specific state for style guide demos */
  forceState?: "default" | "hover" | "open";
}

export function PaperCard({
  title,
  description,
  details,
  tags = [],
  className = "",
  forceState,
}: PaperCardProps) {
  const [isOpen, setIsOpen] = useState(forceState === "open");
  const [isHovering, setIsHovering] = useState(forceState === "hover");
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  const showHover = forceState === "hover" || (isHovering && !isOpen && !forceState);
  const showOpen = forceState === "open" || (isOpen && !forceState);

  return (
    <div
      className={`
        relative w-full max-w-sm transition-all duration-300 ease-out
        ${showHover ? "-translate-y-1 rotate-[0.5deg]" : ""}
        ${className}
      `}
      style={{ perspective: "800px" }}
      onMouseEnter={() => !forceState && setIsHovering(true)}
      onMouseLeave={() => !forceState && setIsHovering(false)}
      onClick={() => !forceState && setIsOpen(!isOpen)}
    >
      {/* Folder tab at top */}
      <div
        className={`
          relative w-32 h-6 rounded-t-md ml-4
          ${isChalkboard
            ? "bg-[var(--color-chalk-bg-dark)] border border-b-0 border-[var(--color-chalk-line)]"
            : "bg-[var(--color-kraft)] border border-b-0 border-[var(--color-kraft-dark)]"
          }
        `}
      >
        <span className="text-xs px-2 py-0.5 font-[family-name:var(--font-hand)] text-[var(--text)]">
          Project
        </span>
      </div>

      {/* Main card body */}
      <div
        className={`
          relative rounded-md rounded-tl-none p-5 pb-6 transition-shadow duration-300
          ${isChalkboard
            ? "bg-[var(--color-chalk-bg-dark)] border border-[var(--color-chalk-line)]"
            : "bg-[var(--color-paper-warm)] border border-[var(--color-kraft)]"
          }
          ${showHover ? "shadow-xl" : "shadow-md"}
        `}
      >
        {/* Paperclip accent */}
        <div className="absolute -top-4 right-4">
          <PaperClip size={28} rotate={-10} />
        </div>

        <h3 className="text-xl font-bold font-[family-name:var(--font-hand)] mb-2 text-[var(--text)]">
          {title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          {description}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`
                  text-xs px-2 py-0.5 rounded-sm font-[family-name:var(--font-hand)]
                  ${isChalkboard
                    ? "bg-[var(--color-chalk-line)] text-[var(--color-chalk-white)]"
                    : "bg-[var(--color-highlight-yellow)]/30 text-[var(--color-ink)]"
                  }
                `}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expandable details section — slides open/closed */}
        <div
          className={`
            overflow-hidden transition-all duration-400 ease-out
            ${showOpen ? "max-h-48 opacity-100 mt-3 pt-3 border-t border-[var(--border-light)]" : "max-h-0 opacity-0"}
          `}
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {details || "More details about this project would go here. Click to expand/collapse."}
          </p>
        </div>

        {/* Click hint */}
        <div className="mt-3 text-xs text-[var(--text-faint)] font-[family-name:var(--font-hand)]">
          {showOpen ? "Click to close ↑" : "Click to peek inside →"}
        </div>
      </div>
    </div>
  );
}
