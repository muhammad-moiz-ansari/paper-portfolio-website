"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { PaperInput, PaperTextarea } from "@/components/paper-input";
import { PaperButton } from "@/components/paper-button";
import {
  DoodleMail,
  DoodleGithub,
  DoodleLinkedin,
} from "@/components/doodle-icons";
import emailjs from "@emailjs/browser";

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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      // Send email using EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: `Message from ${formData.name}`,
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      // Success
      setIsSuccess(true);
      setFormData({ name: "", email: "", message: "" });

      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("EmailJS error:", error);
      setIsError(true);

      // Reset error state after 3 seconds
      setTimeout(() => {
        setIsError(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative px-6 py-20 scroll-mt-20 paper-kraft bg-crumpled">
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
            <PaperInput
              label="Your Name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isSubmitting}
            />
            <PaperInput
              label="Email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isSubmitting}
            />
            <PaperTextarea
              label="Message"
              placeholder="Write something..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              disabled={isSubmitting}
            />
            {/* EDIT: CONTACT SUBMIT BUTTON — text shown on the form submit button */}
            <PaperButton
              variant="primary"
              pressStyle="press"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting
                ? "Sending..."
                : isSuccess
                  ? "Message Sent! ✓"
                  : "Send Note ✉"}
            </PaperButton>
            {/* Error message */}
            {isError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to send message. Please try again or email directly.
              </p>
            )}
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
                {/* EDIT: SOCIAL LINK TEXT — text color and hover for email/LinkedIn/GitHub links */}
                <span
                  className={`text-sm group-hover:text-[var(--text)] transition-colors break-all text-[var(--text-secondary)]`}
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
