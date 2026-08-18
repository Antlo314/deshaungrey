"use client";

import { useEffect, useState } from "react";

const KEY = "dg_intro";
const WORD = "WORLD OF GREY";

/**
 * Cinematic intro. Plays once per session, then sets `.ready` on <html>
 * so hero letter reveals fire. Returning visitors get `.ready` immediately.
 */
export function Preloader() {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(true);

  useEffect(() => {
    const seen = (() => {
      try {
        return sessionStorage.getItem(KEY) === "1";
      } catch {
        return true;
      }
    })();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      requestAnimationFrame(() => document.documentElement.classList.add("ready"));
      return;
    }

    document.documentElement.classList.add("lenis-stopped");
    const total = 1700;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) {
        start = now;
        setShow(true);
        setGone(false);
      }
      const p = Math.min(1, (now - start) / total);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setOut(true);
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
        setTimeout(() => {
          document.documentElement.classList.add("ready");
          document.documentElement.classList.remove("lenis-stopped");
        }, 350);
        setTimeout(() => setGone(true), 1100);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!show || gone) return null;

  return (
    <div className={`preloader ${out ? "out" : ""}`} aria-hidden>
      <div className="preloader-presents">MEG Enterprises presents</div>
      <div className="preloader-word">
        {Array.from(WORD).map((ch, i) => (
          <span key={i} style={{ ["--i" as string]: i }} className={i >= 9 ? "g" : ""}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>
      <div className="preloader-sub">
        <div>
          Dashaun Grey
          <br />
          MEG Enterprises
        </div>
        <div className="preloader-count">{count}</div>
      </div>
      <div className="preloader-bar">
        <span style={{ ["--p" as string]: count / 100 }} />
      </div>
    </div>
  );
}
