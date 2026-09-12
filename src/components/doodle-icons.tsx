/**
 * DoodleIcons — Hand-drawn style SVG icons
 *
 * Each icon uses sketchy, slightly imperfect strokes to maintain
 * the handcrafted notebook aesthetic. Where a proper doodle icon
 * couldn't be created, a placeholder comment marks it for later.
 */

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const defaults = { size: 24, strokeWidth: 1.5 };

/** Sketchy home icon */
export function DoodleHome({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* Slightly wobbly house shape */}
      <path d="M3.5 10.5L12 3.5l8.5 7c0 0-0.2 0.1 0 0" />
      <path d="M5 9.5v10c0.1 0.3 0.2 0.5 0.5 0.5h4.5v-5.5c0-0.3 0.2-0.4 0.5-0.5h3c0.3 0.1 0.5 0.2 0.5 0.5V20h4.5c0.3 0 0.5-0.2 0.5-0.5v-10" />
    </svg>
  );
}

/** Sketchy user/person icon */
export function DoodleUser({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4.5" />
      <path d="M4 20.5c0.2-3.8 3.5-7 8-7s7.8 3.2 8 7" />
    </svg>
  );
}

/** Sketchy mail/envelope icon */
export function DoodleMail({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="M3.5 6l8 6.5c0.3 0.2 0.7 0.2 1 0l8-6.5" />
    </svg>
  );
}

/** Sketchy briefcase/work icon */
export function DoodleBriefcase({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="7.5" width="19" height="12.5" rx="1.5" />
      <path d="M8.5 7.5V5.5c0-1 0.8-1.8 1.8-1.8h3.4c1 0 1.8 0.8 1.8 1.8v2" />
      <line x1="2.5" y1="13" x2="21.5" y2="13" />
    </svg>
  );
}

/** Sketchy code/brackets icon */
export function DoodleCode({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18l-5.5-6L8 6" />
      <path d="M16 6l5.5 6L16 18" />
      <line x1="14.5" y1="4" x2="9.5" y2="20" />
    </svg>
  );
}

/** Sketchy star icon */
export function DoodleStar({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5l2.8 6.2 6.7 0.5-5 4.5 1.5 6.5L12 16.8l-6 3.4 1.5-6.5-5-4.5 6.7-0.5z" />
    </svg>
  );
}

/** Sketchy heart icon */
export function DoodleHeart({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C12 21 3.5 15 3.5 9c0-2.5 2-4.5 4.5-4.5 1.5 0 3 0.8 4 2.2 1-1.4 2.5-2.2 4-2.2 2.5 0 4.5 2 4.5 4.5 0 6-8.5 12-8.5 12z" />
    </svg>
  );
}

/** Sketchy external link icon */
export function DoodleExternalLink({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13.5v5c0 0.8-0.7 1.5-1.5 1.5h-12C3.7 20 3 19.3 3 18.5v-12C3 5.7 3.7 5 4.5 5h5" />
      <path d="M14 3.5h6.5V10" />
      <line x1="20" y1="4" x2="10.5" y2="13.5" />
    </svg>
  );
}

/** Sketchy sun icon (for theme toggle — paper mode) */
export function DoodleSun({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="7" y2="7" />
      <line x1="17" y1="17" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="7" y2="17" />
      <line x1="17" y1="7" x2="19.1" y2="4.9" />
    </svg>
  );
}

/** Sketchy chalkboard icon (for theme toggle) */
export function DoodleChalkboard({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="1" />
      <line x1="6" y1="21" x2="18" y2="21" />
      <line x1="10" y1="17" x2="10" y2="21" />
      <line x1="14" y1="17" x2="14" y2="21" />
      {/* Chalk writing on board */}
      <path d="M6 8h5" />
      <path d="M6 11h8" />
    </svg>
  );
}

/** Sketchy search/magnifying glass icon */
export function DoodleSearch({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" />
    </svg>
  );
}

/** Sketchy arrow-right icon */
export function DoodleArrowRight({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="20" y2="12" />
      <path d="M14 6l6.5 6-6.5 6" />
    </svg>
  );
}

/** Sketchy pencil icon */
export function DoodlePencil({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 3.5l4 4-12.5 12.5H4v-4z" />
      <line x1="14" y1="6" x2="18" y2="10" />
    </svg>
  );
}

/** Sketchy download/save icon */
export function DoodleDownload({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="16" />
      <path d="M7 12l5 5 5-5" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

/** Sketchy github icon (simplified cat silhouette) */
export function DoodleGithub({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5 0.1 0.7-0.2 0.7-0.5v-1.7c-2.8 0.6-3.4-1.3-3.4-1.3-0.5-1.1-1.1-1.4-1.1-1.4-0.9-0.6 0.1-0.6 0.1-0.6 1 0.1 1.5 1 1.5 1 0.9 1.5 2.3 1.1 2.8 0.8 0.1-0.6 0.3-1.1 0.6-1.3-2.2-0.3-4.6-1.1-4.6-5 0-1.1 0.4-2 1-2.7-0.1-0.3-0.4-1.3 0.1-2.7 0 0 0.8-0.3 2.7 1 0.8-0.2 1.7-0.3 2.5-0.3s1.7 0.1 2.5 0.3c1.9-1.3 2.7-1 2.7-1 0.5 1.4 0.2 2.4 0.1 2.7 0.6 0.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 0.4 0.3 0.7 0.9 0.7 1.9v2.8c0 0.3 0.2 0.6 0.7 0.5C19.1 20.2 22 16.4 22 12c0-5.5-4.5-10-10-10z" />
    </svg>
  );
}

/** Sketchy LinkedIn icon */
export function DoodleLinkedin({ size = defaults.size, className = "", strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="11" x2="8" y2="17" />
      <line x1="8" y1="7.5" x2="8" y2="8" />
      <path d="M12 17v-4c0-1.5 1-2.5 2.5-2.5S17 11.5 17 13v4" />
    </svg>
  );
}
