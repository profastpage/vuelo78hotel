"use client";

/**
 * Entrance animation system using IntersectionObserver.
 * Respects prefers-reduced-motion automatically via CSS.
 *
 * Usage: call `initAnimations()` once on mount (in a Client Component or useEffect).
 * Elements with `data-animate` receive `.is-visible` when they enter the viewport.
 *
 * CSS companion: see `.data-animate` and `.is-visible` classes in globals.css.
 *
 * Delay staggering: add `data-animate-delay="150"` (ms) to stagger items in a list.
 */
export function initAnimations() {
  if (typeof window === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = parseInt(el.dataset.animateDelay ?? "0", 10) || 0;

          if (delay > 0) {
            setTimeout(() => {
              el.classList.add("is-visible");
            }, delay);
          } else {
            el.classList.add("is-visible");
          }

          observer.unobserve(el);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
  );

  const elements = document.querySelectorAll("[data-animate]");
  elements.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}
