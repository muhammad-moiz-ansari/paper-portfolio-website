import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";
import Image from "next/image";

// EDIT: CONTACT INFO — email address, LinkedIn handle, and GitHub username with links
const CONTACT_LINKS = [
  {
    platform: "email",
    iconSrc: "/icons/email-icon.png",
    label: "moizansari2005@gmail.com",
    href: "mailto:moizansari2005@gmail.com",
  },
  {
    platform: "linkedin",
    iconSrc: "/icons/linkedin-icon.png",
    label: "muhammad-moiz-ansari",
    href: "https://linkedin.com/in/muhammad-moiz-ansari",
  },
  {
    platform: "github",
    iconSrc: "/icons/github-icon.png",
    label: "muhammad-moiz-ansari",
    href: "https://github.com/muhammad-moiz-ansari",
  },
];

export function Contact() {

  return (
    <section id="contact" tabIndex={-1} className="relative px-6 py-20 scroll-mt-20 paper-kraft bg-crumpled">
      <div className="max-w-3xl mx-auto">
        {/* Section heading */}
        <SectionHeading>Get in Touch</SectionHeading>
        <div
          className="w-24 h-1 rounded-full mb-8"
          style={{
            background: "var(--color-highlight-yellow)",
            opacity: "var(--section-accent-opacity)",
          }}
        />

        {/* Issue 2 fix: use --color-ink for kraft paper text in light mode
            so the contrast ratio against #C4A882 passes WCAG AA.
            --text-secondary (#5C5C5C) is too light on kraft. */}
        {/* EDIT: CONTACT INTRO — the introductory paragraph text in the Contact section */}
        <p
          className="text-lg mb-10 max-w-2xl leading-relaxed text-[var(--color-ink)] [[data-theme='chalkboard']_&]:text-[var(--text-secondary)]"
        >
          Got a project idea, want to collaborate, or just want to say hi?
          Drop me a note below, or reach out through any of these channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact form */}
          <ContactForm />

          {/* Contact info sidebar */}
          <div className="flex flex-col gap-5 md:pt-4">
            {/* Issue: duplicate React key fixed — use `platform` instead of `label` */}
            {CONTACT_LINKS.map(({ platform, iconSrc, label, href }) => (
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
                  className="shrink-0 p-2 rounded-sm border bg-transparent border-[var(--border-light)] [[data-theme='chalkboard']_&]:border-[var(--color-chalk-line)]"
                >
                  <Image 
                    src={iconSrc} 
                    alt={platform} 
                    width={24} 
                    height={24} 
                    className="w-[24px] h-[24px] object-contain [[data-theme='chalkboard']_&]:invert" 
                  />
                </span>
                {/* EDIT: SOCIAL LINK TEXT — text color and hover for email/LinkedIn/GitHub links */}
                <span
                  className="text-sm group-hover:text-[var(--text)] transition-colors break-all text-[var(--text-secondary)]"
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
            className="text-xl font-[family-name:var(--font-hand)] server-section-heading"
          >
            Thanks for scrolling this far ✌️
          </p>
        </div>
      </div>
    </section>
  );
}
