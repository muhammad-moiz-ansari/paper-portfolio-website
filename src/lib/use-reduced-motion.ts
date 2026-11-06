"use client";

import { useSyncExternalStore } from "react";

export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(reducedMotionQuery).matches;
const getServerSnapshot = () => false;

/**
 * Hook that returns true when the user prefers reduced motion.
 * Used to disable or simplify animations throughout the design system.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
