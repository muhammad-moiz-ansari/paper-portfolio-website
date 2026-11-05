import { PencilCursor } from "@/components/pencil-cursor";
import { SiteHeader } from "@/components/site-header";
import { TornEdge } from "@/components/torn-edge";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Education } from "@/components/sections/Education";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

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
