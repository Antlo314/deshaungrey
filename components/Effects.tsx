"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useRevealObserver } from "@/lib/motion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Smooth-scroll a target id (falls back to native). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -8, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
}

/**
 * Root motion layer: Lenis smooth scroll (desktop, fine pointer only),
 * reveal-on-scroll observer, the top scroll-progress hairline, and a
 * scroll-to-top on route change (Lenis otherwise keeps the old position).
 */
export function Effects() {
  useRevealObserver();
  const bar = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | null = null;
    let raf = 0;

    if (fine && !reduced) {
      lenis = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 0.95,
        anchors: { offset: -8 },
        prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
      });
      window.__lenis = lenis;
      const loop = (t: number) => {
        lenis!.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    let pRaf = 0;
    const onScroll = () => {
      cancelAnimationFrame(pRaf);
      pRaf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        bar.current?.style.setProperty("--p", String(p));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(pRaf);
      cancelAnimationFrame(raf);
      if (lenis) {
        lenis.destroy();
        window.__lenis = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => scrollToId(id), 60);
      return;
    }
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return <div ref={bar} className="progress" aria-hidden />;
}
