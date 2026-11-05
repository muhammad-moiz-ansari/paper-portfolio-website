"use client";

import { PaperButton } from "./paper-button";
import type { ReactNode } from "react";

/** Interaction island; the route supplies server-rendered button content. */
export function SectionScrollButton({ target, variant, children }: {
  target: string;
  variant: "primary" | "secondary";
  children: ReactNode;
}) {
  return <PaperButton variant={variant} onClick={() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" })}>{children}</PaperButton>;
}
