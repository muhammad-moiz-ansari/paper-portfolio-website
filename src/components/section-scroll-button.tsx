"use client";

import { PaperButton } from "./paper-button";
import { scrollToSection } from "@/lib/scroll-to-section";
import type { ReactNode } from "react";

/** Interaction island; the route supplies server-rendered button content. */
export function SectionScrollButton({ target, variant, children }: {
  target: string;
  variant: "primary" | "secondary";
  children: ReactNode;
}) {
  return <PaperButton variant={variant} onClick={() => scrollToSection(target)}>{children}</PaperButton>;
}
