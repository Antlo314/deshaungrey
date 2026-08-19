"use client";

import { useEffect, useRef } from "react";

/**
 * Gold dust — a few hundred slow particles with depth and a soft mouse drift.
 * Desktop + fine pointer only, paused when the tab is hidden, off for reduced
 * motion. Cheap enough to sit under the hero forever; the real hero video (when
 * supplied) plays beneath it.
 */
export function GoldField({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = 0, running = true;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    type P = { x: number; y: number; z: number; r: number; vx: number; vy: number; a: number; tw: number };
    let parts: P[] = [];

    const seed = () => {
      const n = Math.round(Math.min(220, (w * h) / 6500) * density);
      parts = Array.from({ length: n }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 0.4 + z * 1.6,
          vx: (Math.random() - 0.5) * 0.08 * (0.4 + z),
          vy: -(0.05 + Math.random() * 0.12) * (0.4 + z),
          a: 0.15 + Math.random() * 0.55,
          tw: Math.random() * Math.PI * 2,
        };
      });
    };
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    let t = 0;
    const draw = () => {
      if (!running) return;
      t += 0.016;
      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;
      ctx.clearRect(0, 0, w, h);
      const px = (mouse.x - 0.5) * 24;
      const py = (mouse.y - 0.5) * 16;
      for (const p of parts) {
        p.x += p.vx + Math.sin(t * 0.4 + p.tw) * 0.05;
        p.y += p.vy;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        const tw = 0.6 + 0.4 * Math.sin(t * (1 + p.z) + p.tw);
        const alpha = p.a * tw;
        const x = p.x + px * p.z;
        const y = p.y + py * p.z;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 199, 120, ${alpha})`;
        ctx.fill();
        if (p.z > 0.8) {
          ctx.beginPath();
          ctx.arc(x, y, p.r * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 199, 120, ${alpha * 0.08})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = e.clientY / window.innerHeight;
    };
    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return <canvas ref={ref} className="hero-field" aria-hidden />;
}
