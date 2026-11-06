"use client";

import { useEffect } from "react";
import { reducedMotionQuery } from "@/lib/use-reduced-motion";

function writeHeading(heading: HTMLElement) {
  const ink = heading.querySelector<HTMLElement>("[data-marker-ink]");
  const tip = heading.querySelector<HTMLElement>("[data-marker-tip]");
  if (!ink || !tip) return [];

  const options = { duration: 440, easing: "cubic-bezier(.22,.61,.36,1)" };
  return [
    ink.animate([
      { clipPath: "inset(-.25em 88% -.25em -.25em)" },
      { clipPath: "inset(-.25em 0 -.25em -.25em)" },
    ], options),
    tip.animate([
      { transform: "translateX(-88%)", opacity: 0 },
      { opacity: 1, offset: 0.14 },
      { opacity: 1, offset: 0.8 },
      { transform: "translateX(0)", opacity: 0 },
    ], options),
  ];
}

function attachNote(note: HTMLElement, delay: number) {
  const animations = [note.animate([
    { translate: "0 -9px", rotate: "-2deg", opacity: 0.76 },
    { translate: "0 1px", rotate: ".35deg", opacity: 1, offset: 0.76 },
    { translate: "0 0", rotate: "0deg", opacity: 1 },
  ], { duration: 310, delay, fill: "backwards", easing: "ease-out" })];
  const pin = note.querySelector<HTMLElement>("[data-scroll-pin]");
  if (pin) {
    animations.push(pin.animate([
      { transform: "translateY(-6px) scale(1.16)", opacity: 0.65 },
      { transform: "translateY(1px) scale(.9)", opacity: 1, offset: 0.7 },
      { transform: "translateY(0) scale(1)", opacity: 1 },
    ], { duration: 190, delay: delay + 130, fill: "backwards", easing: "ease-out" }));
  }
  return animations;
}

export function SectionEntrances() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;
    const motion = window.matchMedia(reducedMotionQuery);
    const pending = new Set(document.querySelectorAll<HTMLElement>("[data-scroll-heading], [data-scroll-note]"));
    const active = new Map<HTMLElement, Animation[]>();

    function settle(node: HTMLElement) {
      pending.delete(node);
      observer.unobserve(node);
      const animations = active.get(node);
      active.delete(node);
      animations?.forEach(animation => animation.cancel());
    }

    function settleSection(section: Element | null) {
      if (!section) return;
      for (const node of [...pending, ...active.keys()]) {
        if (section.contains(node)) settle(node);
      }
    }

    function settleFragment() {
      settleSection(document.getElementById(window.location.hash.slice(1)));
    }

    const observer = new IntersectionObserver(entries => {
      let notesInGroup = 0;
      for (const { isIntersecting, target } of entries) {
        const node = target as HTMLElement;
        if (!isIntersecting || !pending.has(node)) continue;
        settle(node);
        if (motion.matches || document.hidden) continue;
        const animations = node.hasAttribute("data-scroll-heading")
          ? writeHeading(node)
          : attachNote(node, Math.min(notesInGroup++, 3) * 18);
        if (animations.length) {
          active.set(node, animations);
          const last = animations[animations.length - 1];
          last.onfinish = () => active.delete(node);
        }
      }
    }, { rootMargin: "-60px 0px -24px" });

    function onFocus(event: FocusEvent) {
      if (event.target instanceof Element) settleSection(event.target.closest("main > section"));
    }

    function onMotionChange() {
      if (motion.matches) for (const node of active.keys()) settle(node);
    }

    settleFragment();
    for (const node of pending) {
      const bounds = node.getBoundingClientRect();
      if (bounds.top < window.innerHeight) pending.delete(node);
      else observer.observe(node);
    }
    window.addEventListener("hashchange", settleFragment);
    window.addEventListener("popstate", settleFragment);
    document.addEventListener("focusin", onFocus);
    motion.addEventListener("change", onMotionChange);
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", settleFragment);
      window.removeEventListener("popstate", settleFragment);
      document.removeEventListener("focusin", onFocus);
      motion.removeEventListener("change", onMotionChange);
      for (const node of [...active.keys()]) settle(node);
    };
  }, []);

  return null;
}
