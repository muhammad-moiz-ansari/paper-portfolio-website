"use client";

/**
 * ============================================================
 * STYLE GUIDE — Paper Portfolio Design System
 * ============================================================
 *
 * This page showcases every reusable UI element and interaction
 * pattern in isolation. Each section shows the element in
 * relevant states (default, hover, active, etc.) side by side.
 *
 * ============================================================
 * PLACEHOLDER ICON CHECKLIST
 * ============================================================
 * All icons below are hand-drawn SVGs built into doodle-icons.tsx.
 * The following icons are simplified/stylized versions that may
 * benefit from being redrawn by a professional illustrator:
 *
 * - DoodleGithub: simplified cat silhouette (consider a more
 *   sketchy/doodled version)
 * - DoodleLinkedin: basic rectangle + lines (could be more
 *   hand-drawn looking)
 * - Eraser sprite in EraseWriteText: basic rectangle shape
 * - Pencil sprite in EraseWriteText: basic pencil shape
 *
 * No standard/corporate-style icon placeholders are used —
 * all icons are custom SVGs. If you add new icons, follow the
 * doodle-icons.tsx pattern and add a comment if it's a placeholder:
 * {/* ADD DOODLE ICON: [description] *\/ }
 * ============================================================
 */

import React, { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { HighlightNav } from "@/components/highlight-nav";
import { PaperButton } from "@/components/paper-button";
import { EraseWriteText } from "@/components/erase-write-text";
import { StickyNote } from "@/components/sticky-note";
import { PaperCard } from "@/components/paper-card";
import { PaperInput, PaperTextarea } from "@/components/paper-input";
import { PaperClip } from "@/components/paper-clip";
import { PushPin } from "@/components/push-pin";
import { PencilCursor } from "@/components/pencil-cursor";
import { TornEdge } from "@/components/torn-edge";
import {
  DoodleHome, DoodleUser, DoodleMail, DoodleBriefcase,
  DoodleCode, DoodleStar, DoodleHeart, DoodleExternalLink,
  DoodleSearch, DoodleArrowRight, DoodlePencil, DoodleDownload,
  DoodleGithub, DoodleLinkedin,
} from "@/components/doodle-icons";


/* ========== UTILITY: Section wrapper ========== */
function Section({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 px-4 md:px-8 ${className}`}>
      <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-hand)] text-[var(--text)] mb-2">
        {title}
      </h2>
      <div className="w-24 h-1 bg-[var(--color-highlight-yellow)] mb-8 rounded-full" />
      {children}
    </section>
  );
}

/* ========== UTILITY: Label under demos ========== */
function DemoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-sm text-[var(--text-faint)] italic">
      {children}
    </p>
  );
}

/* ========== Color swatch component ========== */
function ColorSwatch({
  name,
  hex,
  usage,
  className = "",
}: {
  name: string;
  hex: string;
  usage: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="w-20 h-20 rounded-lg border border-[var(--border-light)] shadow-sm mb-2"
        style={{ backgroundColor: hex }}
      />
      <span className="text-sm font-bold text-[var(--text)]">{name}</span>
      <code className="text-xs text-[var(--text-secondary)] font-mono">{hex}</code>
      <span className="text-xs text-[var(--text-faint)] mt-0.5">{usage}</span>
    </div>
  );
}

/**
 * TextureSwatch — shows a full texture swatch plus a 3× zoomed inset
 * so that fine grain is visible even at small preview sizes.
 */
function TextureSwatch({
  cssClass,
  label,
  description,
}: {
  cssClass: string;
  label: string;
  description: string;
}) {
  return (
    <div>
      <div className="relative">
        {/* Main swatch */}
        <div
          className={`${cssClass} h-40 rounded-lg border border-[var(--border-light)] flex items-center justify-center`}
        >
          <span className="text-[var(--text-secondary)] font-[family-name:var(--font-hand)] text-lg drop-shadow-sm">
            {label}
          </span>
        </div>

        {/*
          Zoomed inset — bottom-right corner.
          Uses the same CSS class but scaled 3× via transform: scale(3)
          with overflow hidden on the wrapper so only a small crop
          is visible.  This reveals fine grain that would otherwise be
          invisible at the swatch scale.
        */}
        <div
          className="absolute bottom-2 right-2 w-20 h-16 rounded border-2 border-white/60 overflow-hidden shadow-md"
          title="3× zoom preview of texture grain"
          style={{ backdropFilter: "none" }}
        >
          <div
            className={`${cssClass} w-full h-full`}
            style={{
              transform: "scale(3)",
              transformOrigin: "top left",
              width: "calc(100% / 3)",
              height: "calc(100% / 3)",
            }}
          />
        </div>

        {/* Zoom label */}
        <span className="absolute bottom-2 right-24 text-[10px] text-white/70 font-mono bg-black/30 px-1 rounded leading-none py-0.5 select-none">
          3×
        </span>
      </div>
      <p className="mt-2 text-sm text-[var(--text-faint)] italic">{description}</p>
    </div>
  );
}


export default function StyleGuidePage() {
  const { theme } = useTheme();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const navItems = [
    { label: "Home", href: "#" },
    { label: "Projects", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <div className="min-h-screen paper-texture">
      {/* ===== Page Header ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-[var(--bg)]/90 border-b border-[var(--border-light)] px-4 md:px-8 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-hand)] text-[var(--text)]">
          📓 Style Guide
        </h1>
        <ThemeToggle />
      </header>

      {/* ===== Placeholder Checklist ===== */}
      <div className="px-4 md:px-8 py-6 bg-[var(--color-highlight-yellow)]/10 border-b border-[var(--border-light)]">
        <h3 className="text-lg font-bold font-[family-name:var(--font-hand)] text-[var(--text)] mb-2">
          📋 Placeholder Icon Checklist
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-2">
          All icons are custom hand-drawn SVGs. The following may benefit from professional redrawing:
        </p>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1 ml-4">
          <li>☐ <code>DoodleGithub</code> — simplified cat silhouette, could be more sketchy</li>
          <li>☐ <code>DoodleLinkedin</code> — basic rectangle + lines, could be more hand-drawn</li>
          <li>☐ <code>EraserSprite</code> in EraseWriteText — basic rectangle eraser shape</li>
          <li>☐ <code>PencilSprite</code> in EraseWriteText — basic pencil shape</li>
        </ul>
      </div>

      <main className="max-w-6xl mx-auto">

        {/* ============================================
            1. BACKGROUNDS & PAPER TEXTURES
            ============================================ */}
        <Section id="backgrounds" title="1. Backgrounds & Paper Textures">
          <p className="text-[var(--text-secondary)] mb-6">
            Four background texture variants. Each can be applied as a CSS class.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextureSwatch
              cssClass="paper-texture"
              label="Paper Grain / Fiber Texture"
              description=".paper-texture — SVG feTurbulence noise. Inset shows 3× zoom of grain."
            />
            <TextureSwatch
              cssClass="paper-ruled"
              label="Ruled Notebook Lines"
              description=".paper-ruled — 24px repeating lines. Inset shows line density at 3×."
            />
            <TextureSwatch
              cssClass="paper-graph"
              label="Graph Paper Grid"
              description=".paper-graph — 20px grid, h + v. Inset shows grid intersections at 3×."
            />
            <TextureSwatch
              cssClass="paper-kraft"
              label="Kraft Paper"
              description=".paper-kraft — heavy fibrous grain. Dark mode shifts to #5C3D1E. Inset shows weave at 3×."
            />
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            2. TYPOGRAPHY
            ============================================ */}
        <Section id="typography" title="2. Typography">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Display / Heading Font — Caveat
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Caveat was chosen because it reads well at all sizes, has a natural handwritten feel
                without being illegible, and supports multiple weights. It&apos;s playful but not childish.
              </p>
              <div className="space-y-3">
                <h1 className="text-6xl font-bold font-[family-name:var(--font-hand)] text-[var(--text)]">
                  H1 — The quick brown fox
                </h1>
                <h2 className="text-5xl font-bold font-[family-name:var(--font-hand)] text-[var(--text)]">
                  H2 — Jumps over the lazy dog
                </h2>
                <h3 className="text-4xl font-bold font-[family-name:var(--font-hand)] text-[var(--text)]">
                  H3 — Pack my box with five
                </h3>
                <h4 className="text-3xl font-semibold font-[family-name:var(--font-hand)] text-[var(--text)]">
                  H4 — Dozen liquor jugs
                </h4>
                <h5 className="text-2xl font-semibold font-[family-name:var(--font-hand)] text-[var(--text)]">
                  H5 — How vexingly quick
                </h5>
                <h6 className="text-xl font-medium font-[family-name:var(--font-hand)] text-[var(--text)]">
                  H6 — Daft zebras jump
                </h6>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Body Font — Inter
              </h3>
              <p className="text-base text-[var(--text)] leading-relaxed max-w-prose mb-4">
                Body text uses Inter, a clean and highly readable sans-serif designed for screens.
                This ensures accessibility and legibility for longer content like project descriptions,
                blog posts, and form labels. The handwriting font is reserved for headings, labels,
                and decorative elements.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-prose">
                Smaller body text at 14px still maintains readability. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Blockquote — Margin Note Style
              </h3>
              <blockquote
                className="relative pl-6 py-3 ml-4 max-w-md border-l-4 border-[var(--color-highlight-pink)]"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                <span className="absolute -left-3 -top-2 text-[var(--color-highlight-pink)] text-3xl font-bold">
                  &ldquo;
                </span>
                <p className="text-lg text-[var(--text)] italic">
                  This is a handwritten margin note — the kind you&apos;d scribble in the side of a notebook.
                  Good for quotes, asides, and callouts.
                </p>
                <footer className="text-sm text-[var(--text-faint)] mt-1">
                  — A thoughtful designer
                </footer>
              </blockquote>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Caption Text
              </h3>
              <p className="text-xs text-[var(--text-faint)] italic">
                Fig. 1 — Small caption / fine print text for image descriptions, timestamps, and metadata.
              </p>
            </div>
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            3. COLOR PALETTE
            ============================================ */}
        <Section id="colors" title="3. Color Palette">
          <p className="text-[var(--text-secondary)] mb-6">
            Warm paper tones as the foundation, with ink colors for text and soft
            highlighter accents. All colors are defined as CSS custom properties
            and Tailwind theme tokens.
          </p>

          <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
            Backgrounds
          </h3>
          <div className="flex flex-wrap gap-6 mb-8">
            <ColorSwatch name="Paper" hex="#FDF6E3" usage="Page background" />
            <ColorSwatch name="Paper Warm" hex="#FAF0D7" usage="Card background" />
            <ColorSwatch name="Paper Dark" hex="#F5E6C8" usage="Button / accent bg" />
            <ColorSwatch name="Kraft" hex="#C4A882" usage="Borders, dividers" />
            <ColorSwatch name="Kraft Dark" hex="#A8896A" usage="Strong borders" />
          </div>

          <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
            Text / Ink
          </h3>
          <div className="flex flex-wrap gap-6 mb-8">
            <ColorSwatch name="Ink" hex="#2C2C2C" usage="Primary text" />
            <ColorSwatch name="Ink Light" hex="#5C5C5C" usage="Secondary text" />
            <ColorSwatch name="Ink Faint" hex="#8C8C8C" usage="Muted / caption" />
            <ColorSwatch name="Link" hex="#4A7BA7" usage="Links" />
            <ColorSwatch name="Error" hex="#D94F4F" usage="Error states" />
          </div>

          <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
            Highlighter Accents
          </h3>
          <div className="flex flex-wrap gap-6 mb-8">
            <ColorSwatch name="Yellow" hex="#FFE066" usage="Active highlight" />
            <ColorSwatch name="Pink" hex="#FFB3BA" usage="Accent highlight" />
            <ColorSwatch name="Green" hex="#B5EAD7" usage="Success / accent" />
            <ColorSwatch name="Blue" hex="#A7C7E7" usage="Link / info accent" />
          </div>

          <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
            Chalkboard Theme
          </h3>
          <div className="flex flex-wrap gap-6">
            <ColorSwatch name="Chalk BG" hex="#2A3B2A" usage="Board background" />
            <ColorSwatch name="Chalk Dark" hex="#1E2D1E" usage="Card / deep bg" />
            <ColorSwatch name="Chalk White" hex="#F0EDE5" usage="Chalk text" />
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            4. NAVBAR
            ============================================ */}
        <Section id="navbar" title="4. Navbar">
          <p className="text-[var(--text-secondary)] mb-6">
            Horizontal navbar with highlighter-effect tabs. The active tab has a
            rough, hand-drawn highlight shape with a pushpin. Hovering inactive
            tabs animates the highlighter stroke drawing on from left to right.
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Interactive Demo — Hover over the tabs
              </h3>
              <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-card)]">
                <HighlightNav items={navItems} activeIndex={0} />
              </div>
              <DemoLabel>
                &ldquo;Home&rdquo; is active (yellow highlight + pushpin). Hover other tabs to see the blue
                highlighter draw on from left to right.
              </DemoLabel>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                State Comparison — Side by side
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-card)]">
                  <HighlightNav items={[navItems[0]]} activeIndex={-1} />
                  <DemoLabel>Default (inactive)</DemoLabel>
                </div>
                <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-card)]">
                  <div className="relative">
                    <HighlightNav items={[navItems[1]]} activeIndex={-1} />
                    <span className="text-xs text-[var(--text-faint)] block mt-1">↑ hover me</span>
                  </div>
                  <DemoLabel>Hover (highlighter draws on)</DemoLabel>
                </div>
                <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-card)]">
                  <HighlightNav items={[navItems[0]]} activeIndex={0} />
                  <DemoLabel>Active (highlight + pushpin)</DemoLabel>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            5. ANIMATED TEXT — ERASE & REWRITE
            ============================================ */}
        <Section id="animated-text" title="5. Animated Text (Erase & Rewrite)">
          <p className="text-[var(--text-secondary)] mb-6">
            Text cycling component with eraser and pencil sprites. The eraser moves
            right-to-left &ldquo;rubbing out&rdquo; the text with crumb particles,
            then a pencil writes the new phrase left-to-right.
          </p>

          <div className="p-8 rounded-lg border border-[var(--border-light)] bg-[var(--bg-card)] text-center">
            <p className="text-[var(--text-secondary)] mb-2">I am a</p>
            <div className="text-4xl md:text-5xl font-bold text-[var(--text)] h-16 flex items-center justify-center">
              <EraseWriteText
                phrases={[
                  "Frontend Developer",
                  "UI Designer",
                  "Problem Solver",
                  "Creative Thinker",
                ]}
                displayDuration={2500}
                eraseDuration={1000}
                writeDuration={1000}
              />
            </div>
          </div>
          <DemoLabel>
            Cycles through phrases with eraser & pencil sprite animations.
            Falls back to simple text swap when prefers-reduced-motion is set.
          </DemoLabel>
        </Section>

        <TornEdge />

        {/* ============================================
            6. CUSTOM CURSOR
            ============================================ */}
        <Section id="cursor" title="6. Custom Cursor">
          <p className="text-[var(--text-secondary)] mb-6">
            Replaces the default cursor with a pencil-tip SVG cursor, with an
            optional light sketch trail that fades quickly. Move your mouse in
            the demo area below.
          </p>

          <PencilCursor enableTrail>
            <div className="h-64 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center">
              <p className="text-[var(--text-secondary)] font-[family-name:var(--font-hand)] text-xl text-center px-4">
                ✏️ Move your mouse here to see the pencil cursor + sketch trail
              </p>
            </div>
          </PencilCursor>
          <DemoLabel>
            Custom pencil-tip cursor with light sketch trail. Gracefully falls back
            to default cursor on touch devices and when prefers-reduced-motion is set.
          </DemoLabel>
        </Section>

        <TornEdge />

        {/* ============================================
            7. BUTTONS
            ============================================ */}
        <Section id="buttons" title="7. Buttons">
          <p className="text-[var(--text-secondary)] mb-6">
            Cardstock-style buttons with tactile hover/press interactions. Two active
            variants: &ldquo;press&rdquo; (clean pressed feel) and &ldquo;crumple&rdquo;
            (paper crumple effect). Hover lifts the button and rotates slightly.
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Press Variant (Clean Press Feel)
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                <PaperButton variant="primary" pressStyle="press">
                  Primary Button
                </PaperButton>
                <PaperButton variant="secondary" pressStyle="press">
                  Secondary Button
                </PaperButton>
                <PaperButton variant="disabled">
                  Disabled
                </PaperButton>
              </div>
              <DemoLabel>
                Hover: lifts + rotates ~2°. Active/click: presses down (shadow shrinks, scale down).
              </DemoLabel>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Crumple Variant (Paper Crumple Effect on Press)
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                <PaperButton variant="primary" pressStyle="crumple">
                  Primary Crumple
                </PaperButton>
                <PaperButton variant="secondary" pressStyle="crumple">
                  Secondary Crumple
                </PaperButton>
              </div>
              <DemoLabel>
                Same hover as above. Active/click: brief paper-crumple animation
                (scale wobble + slight brightness shift).
              </DemoLabel>
            </div>
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            8. STICKY NOTES, PAPER CLIPS & PINS
            ============================================ */}
        <Section id="sticky-notes" title="8. Sticky Notes, Paper Clips & Pins">
          <p className="text-[var(--text-secondary)] mb-6">
            Decorative components for callouts, tooltips, and visual accents.
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Sticky Notes — 3 Color Variants
              </h3>
              <div className="flex flex-wrap gap-8 items-start justify-center py-8">
                <StickyNote color="yellow" rotate={-3} decoration="tape">
                  <p className="text-sm">Remember to buy milk</p>
                </StickyNote>
                <StickyNote color="pink" rotate={2} decoration="pin">
                  <p className="text-sm">Call mom at 5pm 💕</p>
                </StickyNote>
                <StickyNote color="blue" rotate={-1} decoration="tape">
                  <p className="text-sm">Deploy v2.0 on Friday</p>
                </StickyNote>
              </div>
              <DemoLabel>
                Yellow (tape), Pink (pin), Blue (tape). Each has a slight rotation,
                drop shadow, and a bottom-right curl effect.
              </DemoLabel>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Paper Clips & Pushpins
              </h3>
              <div className="flex flex-wrap gap-12 items-end justify-center py-4">
                <div className="text-center">
                  <PaperClip size={48} rotate={-15} />
                  <DemoLabel>Paper Clip</DemoLabel>
                </div>
                <div className="text-center">
                  <PaperClip size={48} rotate={10} color="#A8896A" />
                  <DemoLabel>Paper Clip (rotated)</DemoLabel>
                </div>
                <div className="text-center">
                  <PushPin size={36} color="#D94F4F" />
                  <DemoLabel>Red Pushpin</DemoLabel>
                </div>
                <div className="text-center">
                  <PushPin size={36} color="#4A7BA7" />
                  <DemoLabel>Blue Pushpin</DemoLabel>
                </div>
                <div className="text-center">
                  <PushPin size={36} color="#B5EAD7" />
                  <DemoLabel>Green Pushpin</DemoLabel>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            9. CARDS (PROJECT CARDS)
            ============================================ */}
        <Section id="cards" title="9. Cards (Project Cards)">
          <p className="text-[var(--text-secondary)] mb-6">
            Folder/envelope style cards that open to reveal more content.
            The folder tab at the top reinforces the physical-object metaphor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <PaperCard
                title="Weather App"
                description="A clean weather dashboard built with React and OpenWeatherMap API."
                tags={["React", "API", "CSS"]}
                details="Features live weather data, 5-day forecasts, and location search. Built with modular components and responsive design."
                forceState="default"
              />
              <DemoLabel>Default state — closed folder</DemoLabel>
            </div>
            <div>
              <PaperCard
                title="Task Manager"
                description="Full-stack task management app with drag-and-drop kanban board."
                tags={["Next.js", "Prisma", "DnD"]}
                details="Includes real-time collaboration, file attachments, and sprint planning features."
                forceState="hover"
              />
              <DemoLabel>Hover state — lifted + slight rotate</DemoLabel>
            </div>
            <div>
              <PaperCard
                title="Portfolio Site"
                description="This very portfolio! A notebook-themed personal website."
                tags={["Next.js", "Tailwind", "TS"]}
                details="Custom design system with paper textures, hand-drawn icons, pencil cursor, and chalkboard dark mode."
                forceState="open"
              />
              <DemoLabel>Open/expanded state — details revealed</DemoLabel>
            </div>
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            10. FORM INPUTS
            ============================================ */}
        <Section id="form-inputs" title="10. Form Inputs">
          <p className="text-[var(--text-secondary)] mb-6">
            Inputs styled as fill-in-the-blank lines on ruled paper. The label
            floats up when the input is focused or has a value.
          </p>

          <div className="space-y-8 max-w-md">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Text Input States
              </h3>
              <div className="space-y-8">
                <PaperInput label="Your Name" placeholder="e.g. Jane Doe" forceState="default" />
                <DemoLabel>Default — empty line with floating label</DemoLabel>

                <PaperInput label="Your Email" placeholder="jane@example.com" forceState="focused" />
                <DemoLabel>Focused — line darkens, label shrinks up</DemoLabel>

                <PaperInput label="Your City" forceState="filled" value="San Francisco" />
                <DemoLabel>Filled — text sits naturally on the ruled line</DemoLabel>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Textarea (Ruled Notepad)
              </h3>
              <div className="space-y-6">
                <PaperTextarea label="Your Message" placeholder="Write something..." forceState="default" />
                <DemoLabel>Default — empty notepad with ruled lines</DemoLabel>

                <PaperTextarea label="Tell me about your project" forceState="filled" />
                <DemoLabel>Filled — text flows along the ruled lines</DemoLabel>
              </div>
            </div>
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            11. ICONS
            ============================================ */}
        <Section id="icons" title="11. Icons">
          <p className="text-[var(--text-secondary)] mb-6">
            Hand-drawn style SVG icons with sketchy, slightly imperfect strokes.
            All icons are custom-built in <code>doodle-icons.tsx</code>.
          </p>

          <div className="grid grid-cols-4 md:grid-cols-7 gap-6">
            {[
              { Icon: DoodleHome, name: "Home" },
              { Icon: DoodleUser, name: "User" },
              { Icon: DoodleMail, name: "Mail" },
              { Icon: DoodleBriefcase, name: "Work" },
              { Icon: DoodleCode, name: "Code" },
              { Icon: DoodleStar, name: "Star" },
              { Icon: DoodleHeart, name: "Heart" },
              { Icon: DoodleExternalLink, name: "External" },
              { Icon: DoodleSearch, name: "Search" },
              { Icon: DoodleArrowRight, name: "Arrow" },
              { Icon: DoodlePencil, name: "Pencil" },
              { Icon: DoodleDownload, name: "Download" },
              { Icon: DoodleGithub, name: "GitHub" },
              { Icon: DoodleLinkedin, name: "LinkedIn" },
            ].map(({ Icon, name }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-lg border border-[var(--border-light)] flex items-center justify-center text-[var(--text)]">
                  <Icon size={28} />
                </div>
                <span className="text-xs text-[var(--text-faint)]">{name}</span>
              </div>
            ))}
          </div>
          <DemoLabel>
            All icons use sketchy line strokes (not solid/filled) for the handcrafted feel.
            See the placeholder checklist at the top for icons that may need professional redrawing.
          </DemoLabel>
        </Section>

        <TornEdge />

        {/* ============================================
            12. DARK MODE — CHALKBOARD THEME
            ============================================ */}
        <Section id="dark-mode" title="12. Dark Mode — Chalkboard Theme">
          <p className="text-[var(--text-secondary)] mb-6">
            Instead of a generic dark mode, the chalkboard theme continues the
            notebook metaphor: dark green/black textured background, chalk-style
            text, and appropriately adapted components. Use the toggle in the
            header to switch themes, or compare below:
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Theme Toggle Control
              </h3>
              <ThemeToggle />
              <DemoLabel>
                Click to switch between Paper and Chalkboard themes.
                All components adapt automatically via CSS custom properties.
              </DemoLabel>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Side-by-Side Comparison
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Toggle the theme above and observe how navbar, buttons, and cards
                all transform. Key changes in chalkboard mode:
              </p>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1 ml-4 list-disc mb-4">
                <li>Background switches to dark green chalkboard with chalk-dust texture</li>
                <li>Text becomes chalky off-white with subtle text-shadow for graininess</li>
                <li>Highlighter effects become more transparent to work against dark backgrounds</li>
                <li>Buttons switch to chalk-drawn bordered style</li>
                <li>Sticky notes become semi-transparent with visible borders</li>
                <li>Scrollbar adapts to muted chalk tones</li>
              </ul>
            </div>

            {/* Mini comparison panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paper preview */}
              <div className="paper-texture rounded-lg p-6 border border-[rgba(196,168,130,0.3)]" style={{ backgroundColor: "#FDF6E3", color: "#2C2C2C" }}>
                <h4 className="text-xl font-bold font-[family-name:var(--font-hand)] mb-3">📝 Paper Theme</h4>
                <div className="flex gap-2 mb-3">
                  <span className="inline-block px-4 py-1.5 text-sm font-[family-name:var(--font-hand)] bg-[#F5E6C8] border border-[#A8896A] rounded-sm shadow-sm">
                    Button
                  </span>
                  <span className="inline-block px-4 py-1.5 text-sm font-[family-name:var(--font-hand)] border-2 border-[#C4A882] rounded-sm">
                    Outline
                  </span>
                </div>
                <div className="inline-block p-3 text-sm font-[family-name:var(--font-hand)]" style={{ backgroundColor: "#FFF9C4", border: "1px solid #F9E547", transform: "rotate(-1deg)" }}>
                  Sticky note
                </div>
              </div>

              {/* Chalkboard preview */}
              <div className="rounded-lg p-6 border border-[rgba(240,237,229,0.15)]" style={{ backgroundColor: "#2A3B2A", color: "#F0EDE5" }}>
                <h4 className="text-xl font-bold font-[family-name:var(--font-hand)] mb-3" style={{ textShadow: "0 0 1px rgba(240,237,229,0.6), 1px 0 2px rgba(240,237,229,0.15)" }}>
                  🖍️ Chalkboard Theme
                </h4>
                <div className="flex gap-2 mb-3">
                  <span className="inline-block px-4 py-1.5 text-sm font-[family-name:var(--font-hand)] border-2 border-[rgba(240,237,229,0.7)] rounded-sm" style={{ backgroundColor: "#1E2D1E" }}>
                    Button
                  </span>
                  <span className="inline-block px-4 py-1.5 text-sm font-[family-name:var(--font-hand)] border-2 border-[rgba(240,237,229,0.3)] rounded-sm">
                    Outline
                  </span>
                </div>
                <div className="inline-block p-3 text-sm font-[family-name:var(--font-hand)]" style={{ backgroundColor: "rgba(255,249,196,0.15)", border: "1px solid rgba(249,229,71,0.4)", transform: "rotate(-1deg)" }}>
                  Sticky note
                </div>
              </div>
            </div>
          </div>
        </Section>

        <TornEdge />

        {/* ============================================
            13. MISC DETAILS
            ============================================ */}
        <Section id="misc" title="13. Misc Details">
          <div className="space-y-12">
            {/* Custom Scrollbar */}
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Custom Scrollbar — Washi Tape Style
              </h3>
              <div className="h-40 overflow-y-scroll rounded-lg border border-[var(--border-light)] bg-[var(--bg-card)] p-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <p key={i} className="text-sm text-[var(--text-secondary)] mb-2">
                    Line {i + 1} — Scroll to see the washi-tape striped scrollbar →
                  </p>
                ))}
              </div>
              <DemoLabel>
                Scrollbar thumb uses diagonal stripes like washi tape.
                In paper mode it&apos;s yellow; in chalkboard it&apos;s chalky white.
              </DemoLabel>
            </div>

            {/* Torn Edge Divider */}
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Torn Paper Edge Divider
              </h3>
              <div className="border border-[var(--border-light)] rounded-lg overflow-hidden">
                <div className="bg-[var(--color-highlight-green)]/20 p-6 text-center text-[var(--text-secondary)]">
                  Section above
                </div>
                <TornEdge color="var(--color-highlight-green)" />
                <div className="bg-[var(--bg-card)] p-6 text-center text-[var(--text-secondary)]">
                  Section below
                </div>
              </div>
              <DemoLabel>
                TornEdge component — irregular SVG path simulating a paper tear.
                Accepts a color prop and can be flipped vertically.
              </DemoLabel>
            </div>

            {/* Tooltip as Mini Sticky Note */}
            <div>
              <h3 className="text-sm font-bold text-[var(--text-faint)] uppercase tracking-wider mb-4">
                Tooltip — Mini Sticky Note
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative inline-block">
                  <button
                    className="px-4 py-2 text-sm font-[family-name:var(--font-hand)] text-[var(--text)] border border-[var(--border)] rounded-sm hover:bg-[var(--bg-card)] transition-colors"
                    onMouseEnter={() => setTooltipVisible(true)}
                    onMouseLeave={() => setTooltipVisible(false)}
                  >
                    Hover me for a tooltip
                  </button>
                  {tooltipVisible && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10">
                      <StickyNote color="yellow" rotate={-2} decoration="pin">
                        <p className="text-xs whitespace-nowrap">This is a sticky-note tooltip! 📝</p>
                      </StickyNote>
                    </div>
                  )}
                </div>
                <DemoLabel>Tooltip appears as a mini sticky note on hover.</DemoLabel>
              </div>
            </div>
          </div>
        </Section>

      </main>

      {/* ===== Footer ===== */}
      <footer className="py-8 px-4 text-center border-t border-[var(--border-light)]">
        <p className="text-sm text-[var(--text-faint)] font-[family-name:var(--font-hand)]">
          📓 Paper Portfolio Style Guide — Review, tweak, approve, then build.
        </p>
      </footer>
    </div>
  );
}
