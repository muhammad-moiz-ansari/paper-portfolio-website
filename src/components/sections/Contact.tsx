"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { PaperInput, PaperTextarea } from "@/components/paper-input";
import { PaperButton } from "@/components/paper-button";
import {
  DoodleMail,
  DoodleGithub,
  DoodleLinkedin,
} from "@/components/doodle-icons";

const CONTACT_LINKS = [
  {
    icon: DoodleMail,
    label: "moizansari2005@gmail.com",
    href: "mailto:moizansari2005@gmail.com",
  },
  {
    icon: DoodleLinkedin,
    label: "linkedin.com/in/muhammad-moiz-ansari",
    href: "https://linkedin.com/in/muhammad-moiz-ansari",
  },
  {
    icon: DoodleGithub,
    label: "github.com/muhammad-moiz-ansari",
    href: "https://github.com/muhammad-moiz-ansari",
  },
];

export function Contact() {
  const { theme } = useTheme();
  const isChalkboard = theme === "chalkboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend — form is presentational for now
  };

  return (
    <section id="contact" className="relative px-6 py-20 scroll-mt-20 paper-ruled">
      <div className="max-w-3xl mx-auto">
        {/* Section heading */}
        <h2
          className={`text-4xl font-[family-name:var(--font-hand)] font-bold mb-2 ${
            isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
          }`}
        >
          Get in Touch
        </h2>
        <div
          className="w-24 h-1 rounded-full mb-8"
          style={{
            background: "var(--color-highlight-yellow)",
            opacity: isChalkboard ? 0.6 : 0.8,
          }}
        />

        <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl leading-relaxed">
          Got a project idea, want to collaborate, or just want to say hi?
          Drop me a note below, or reach out through any of these channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaperInput label="Your Name" placeholder="Jane Doe" />
            <PaperInput label="Email" placeholder="jane@example.com" />
            <PaperTextarea label="Message" placeholder="Write something..." />
            <PaperButton variant="primary" pressStyle="press">
              Send Note ✉
            </PaperButton>
          </form>

          {/* Contact info sidebar */}
          <div className="flex flex-col gap-5 md:pt-4">
            {CONTACT_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group transition-colors"
              >
                <span
                  className={`shrink-0 p-2 rounded-sm border ${
                    isChalkboard
                      ? "border-[var(--color-chalk-line)] bg-[var(--color-chalk-bg-dark)]"
                      : "border-[var(--border-light)] bg-[var(--color-paper)]"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--color-link)] transition-colors break-all">
                  {label}
                </span>
              </a>
            ))}

            <div className="mt-4 text-xs text-[var(--text-faint)] font-[family-name:var(--font-hand)]">
              Phone: +92 315 468 6405
            </div>
          </div>
        </div>

        {/* Sign-off */}
        <div className="mt-16 text-center">
          <p
            className={`text-xl font-[family-name:var(--font-hand)] ${
              isChalkboard ? "chalk-text" : "text-[var(--color-ink)]"
            }`}
          >
            Thanks for scrolling this far ✌️
          </p>
        </div>
      </div>
    </section>
  );
}
