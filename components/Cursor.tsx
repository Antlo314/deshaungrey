"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "@/lib/motion";

/**
 * Gold dot + lagging ring. Elements with `data-cursor="Play"` show a label
 * inside a filled ring; any link/button expands the ring.
 */
export function Cursor() {
  const fine = useFinePointer();
  const root = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!fine) {
      document.documentElement.classList.remove("has-cursor");
      return;
    }
    document.documentElement.classList.add("has-cursor");
    const el = root.current;
    const rg = ring.current;
    if (!el || !rg) return;

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y;
    let raf = 0;
    let visible = false;

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      rg.style.transform = `translate3d(${rx - x}px, ${ry - y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        el.classList.remove("hidden");
      }
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      const interactive = t?.closest("a, button, [role=button], input, label, .card, .tilt");
      if (labelled) {
        setLabel(labelled.dataset.cursor || "");
        el.classList.add("label");
        el.classList.remove("hover");
      } else {
        el.classList.remove("label");
        el.classList.toggle("hover", Boolean(interactive));
      }
    };
    const onDown = () => el.classList.add("down");
    const onUp = () => el.classList.remove("down");
    const onLeave = () => { visible = false; el.classList.add("hidden"); };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [fine]);

  if (!fine) return null;
  return (
    <div ref={root} className="cursor hidden" aria-hidden>
      <div className="cursor-dot" />
      <div ref={ring} className="cursor-ring">
        <span>{label}</span>
      </div>
    </div>
  );
}
