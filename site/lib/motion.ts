"use client";

import { useEffect, useRef, useState } from "react";

/** True when the visitor prefers reduced motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

/** True on devices with a fine pointer (mouse / trackpad). */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setFine(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return fine;
}

/**
 * Global reveal observer. Any element with `.reveal`, `.reveal-clip`,
 * `.reveal-x`, `.reveal-img`, `.reveal-lines`, `.st` or `.process-step` gets
 * `.in` once it enters the viewport. Call once at the root.
 */
export function useRevealObserver() {
  useEffect(() => {
    const selector = ".reveal, .reveal-clip, .reveal-x, .reveal-img, .reveal-lines, .st, .process-step, .draw-host";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      // threshold 0 + isIntersecting: clip-path'd targets report ratio 0 in Chrome
      { rootMargin: "0px 0px -4% 0px", threshold: 0 }
    );
    const scan = () =>
      document.querySelectorAll(selector).forEach((el) => {
        if (!el.classList.contains("in")) io.observe(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}

/** Magnetic hover for buttons: pass the returned ref to a wrapper `.mag`. */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transition = "transform 0.2s ease-out";
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transition = "transform 0.7s cubic-bezier(0.34,1.56,0.64,1)";
      el.style.transform = "translate(0,0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);
  return ref;
}

/** Splits text into per-letter spans for the `.st` reveal. */
export function letters(text: string, offset = 0) {
  return Array.from(text).map((ch, i) => ({ ch, i: i + offset, key: `${ch}-${i + offset}` }));
}
