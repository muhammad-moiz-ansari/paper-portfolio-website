import { EraseWriteText } from "@/components/erase-write-text";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { InkWashBackground } from "@/components/ink-wash-background";
import { Notepad } from "@/components/notepad";
import Image from "next/image";

/* ─── About section (merged Hero + About) ─────────────────── */

const TAGLINES = [
  "backend developer",
  "system designer",
  "CS student",
  "problem solver",
  "open-source tinkerer",
];

export function About() {
  return (
    <section
      id="about"
      className="relative px-6 py-20 scroll-mt-20 min-h-[85vh] flex items-center server-section-background"
    >
      <InkWashBackground />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-[family-name:var(--font-hand)] font-bold tracking-tight leading-tight server-section-heading"
            >
              Moiz Ansari
            </h1>

            <div className="mt-4 text-2xl sm:text-3xl text-[var(--text-secondary)]">
              <span className="font-[family-name:var(--font-hand)]">I&apos;m a </span>
              <EraseWriteText
                phrases={TAGLINES}
                displayDuration={2200}
                eraseDuration={1000}
                writeDuration={1000}
                className="text-2xl sm:text-3xl"
              />
            </div>

            <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg">
              CS undergrad at FAST NUCES who loves building backend systems that
              don&apos;t fall over at 3 AM. When I&apos;m not writing code, I&apos;m
              probably debugging someone else&apos;s.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <SectionScrollButton
                variant="primary"
                target="projects"
              >
                View Work →
              </SectionScrollButton>
              <SectionScrollButton
                variant="secondary"
                target="contact"
              >
                Get in Touch
              </SectionScrollButton>
            </div>

            <div className="mt-6 flex gap-4">
              <a
                href="https://github.com/muhammad-moiz-ansari"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-60 transition-opacity [[data-theme='chalkboard']_&]:invert"
                aria-label="GitHub"
              >
                <Image src="/icons/github-icon.png" alt="GitHub" width={28} height={28} className="w-[28px] h-[28px] object-contain" />
              </a>
              <a
                href="https://linkedin.com/in/muhammad-moiz-ansari"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-60 transition-opacity [[data-theme='chalkboard']_&]:invert"
                aria-label="LinkedIn"
              >
                <Image src="/icons/linkedin-icon.png" alt="LinkedIn" width={28} height={28} className="w-[28px] h-[28px] object-contain" />
              </a>
            </div>
          </div>

          <div>
            <Notepad />
          </div>
        </div>
      </div>
    </section>
  );
}