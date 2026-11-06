import type { ReactNode } from "react";

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 data-scroll-heading className="text-4xl font-[family-name:var(--font-hand)] font-bold mb-2 server-section-heading">
      <span className="scroll-heading-track">
        <span data-marker-ink>{children}</span>
        <span className="scroll-heading-marker" aria-hidden="true" data-marker-tip />
      </span>
    </h2>
  );
}
