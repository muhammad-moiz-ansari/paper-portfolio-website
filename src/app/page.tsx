import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import { PencilCursor } from "@/components/pencil-cursor";
import { SiteHeader } from "@/components/site-header";
import { TornEdge } from "@/components/torn-edge";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Education } from "@/components/sections/Education";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

// EDIT: PAGE METADATA — homepage title and description for search and sharing
const title = "Moiz Ansari | Backend Development & Systems Portfolio";
const description = "Moiz Ansari is a computer science student at FAST-NUCES. Explore his work in backend development, systems design, and GPU-accelerated computing.";

// EDIT: SOCIAL PREVIEW — paper-themed image and alternative text for link previews
const preview = {
  url: new URL("/social-preview.jpg", siteUrl).href,
  width: 1200,
  height: 630,
  alt: "Moiz Ansari’s backend development and systems portfolio on ruled paper",
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: siteUrl },
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    images: [preview],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [preview],
  },
};

export default function Home() {
  return (
    <PencilCursor enableTrail>
      <SiteHeader />
      <main>
        <About />
        <TornEdge seed={1} />
        <Experience />
        <TornEdge seed={2} />
        <Skills />
        <TornEdge seed={3} />
        <Education />
        <TornEdge seed={4} />
        <Projects />
        <TornEdge seed={5} />
        <Contact />
      </main>

      {/* Simple footer — uses CSS variables for theme-aware styling */}
      {/* EDIT: FOOTER TEXT — copyright and footer message */}
      <footer className="py-6 text-center text-xs text-[var(--text-faint)]">
        © {new Date().getFullYear()} Moiz Ansari · Built with paper & pixels
      </footer>
    </PencilCursor>
  );
}
