"use client";

import { useEffect } from "react";
import { reducedMotionQuery } from "@/lib/use-reduced-motion";

const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export function PortfolioScroll() {
  useEffect(() => {
    const motion = window.matchMedia(reducedMotionQuery);
    let dispose: (() => void) | undefined;
    let revision = 0;

    async function sync() {
      const current = ++revision;
      dispose?.();
      dispose = undefined;
      if (motion.matches) return;

      const { default: Lenis } = await import("lenis").catch(() => ({ default: null }));
      if (!Lenis || current !== revision) return;

      const lenis = new Lenis({
        autoRaf: true,
        syncTouch: false,
        allowNestedScroll: true,
        anchors: false,
      });

      function cancelScroll() {
        if (lenis.isScrolling !== "smooth") return;
        lenis.stop();
        lenis.start();
      }

      function onKeyDown(event: KeyboardEvent) {
        if (scrollKeys.has(event.key)) cancelScroll();
      }

      function onClick(event: MouseEvent) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
        const hash = link?.getAttribute("href");
        if (!link || !hash || link.target || link.hasAttribute("download")) return;
        const section = document.getElementById(hash.slice(1));
        if (!section?.matches("main > section")) return;

        event.preventDefault();
        cancelScroll();
        if (window.location.hash !== hash) window.history.pushState(null, "", hash);
        section.focus({ preventScroll: true });
        // Sync after native scroll changes and layout shifts, then honor the section's scroll margin.
        lenis.resize();
        lenis.scrollTo(section, { duration: 0.65 });
      }

      document.addEventListener("click", onClick);
      window.addEventListener("pointerdown", cancelScroll, { capture: true, passive: true });
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("popstate", cancelScroll);
      window.addEventListener("hashchange", cancelScroll);
      document.addEventListener("visibilitychange", cancelScroll);
      dispose = () => {
        document.removeEventListener("click", onClick);
        window.removeEventListener("pointerdown", cancelScroll, true);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("popstate", cancelScroll);
        window.removeEventListener("hashchange", cancelScroll);
        document.removeEventListener("visibilitychange", cancelScroll);
        lenis.destroy();
      };
    }

    void sync();
    motion.addEventListener("change", sync);
    return () => {
      revision++;
      motion.removeEventListener("change", sync);
      dispose?.();
    };
  }, []);

  return null;
}
