import { reducedMotionQuery } from "./use-reduced-motion";

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia(reducedMotionQuery).matches ? "instant" : "smooth",
  });
}
