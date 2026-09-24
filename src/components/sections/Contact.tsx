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

// EDIT: CONTACT INFO — email address, LinkedIn handle, and GitHub username with links
const CONTACT_LINKS = [
  {
    platform: "email",
    icon: DoodleMail,
    label: "moizansari2005@gmail.com",
    href: "mailto:moizansari2005@gmail.com",
  },
  {
    platform: "linkedin",
    icon: DoodleLinkedin,
    label: "muhammad-moiz-ansari",
    href: "https://linkedin.com/in/muhammad-moiz-ansari",
  },
  {
    platform: "github",
    icon: DoodleGithub,
    label: "muhammad-moiz-ansari",
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
    <section id="contact" className="relative px-6 py-20 scroll-mt-20 paper-kraft">
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

        {/* Issue 2 fix: use --color-ink for kraft paper text in light mode
            so the contrast ratio against #C4A882 passes WCAG AA.
            --text-secondary (#5C5C5C) is too light on kraft. */}
        {/* EDIT: CONTACT INTRO — the introductory paragraph text in the Contact section */}
        <p
          className={`text-lg mb-10 max-w-2xl leading-relaxed ${
            isChalkboard
              ? "text-[var(--text-secondary)]"
              : "text-[var(--color-ink)]"
          }`}
        >
          Got a project idea, want to collaborate, or just want to say hi?
          Drop me a note below, or reach out through any of these channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EDIT: CONTACT FORM LABELS — field labels and placeholder text for the contact form */}
            <PaperInput label="Your Name" placeholder="Jane Doe" />
            <PaperInput label="Email" placeholder="jane@example.com" />
            <PaperTextarea label="Message" placeholder="Write something..." />
            {/* EDIT: CONTACT SUBMIT BUTTON — text shown on the form submit button */}
            <PaperButton variant="primary" pressStyle="press">
              Send Note ✉
            </PaperButton>
          </form>

          {/* Contact info sidebar */}
          <div className="flex flex-col gap-5 md:pt-4">
            {/* Issue: duplicate React key fixed — use `platform` instead of `label` */}
            {CONTACT_LINKS.map(({ platform, icon: Icon, label, href }) => (
              <a
                key={platform}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group transition-colors"
              >
                {/* Issue 3 fix: use transparent bg in both light and dark modes
                    to avoid visible background boxes on the kraft background */}
                <span
                  className={`shrink-0 p-2 rounded-sm border bg-transparent ${
                    isChalkboard
                      ? "border-[var(--color-chalk-line)]"
                      : "border-[var(--border-light)]"
                  }`}
                >
                  <Icon size={24} />
                </span>
                <span
                  className={`text-sm group-hover:text-[var(--color-link)] transition-colors break-all ${
                    isChalkboard
                      ? "text-[var(--text-secondary)]"
                      : "text-[var(--color-ink)]"
                  }`}
                >
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Sign-off */}
        <div className="mt-16 text-center">
          {/* EDIT: CONTACT SIGN-OFF — the closing message at the end of the Contact section */}
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
