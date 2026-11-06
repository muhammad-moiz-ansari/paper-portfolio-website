import type { Metadata } from "next";
import type { ReactNode } from "react";

// EDIT: STYLE GUIDE METADATA — title for the design system reference
export const metadata: Metadata = {
  title: "Paper Portfolio Style Guide",
  robots: { index: false, follow: true },
};

export default function StyleGuideLayout({ children }: { children: ReactNode }) {
  return children;
}
