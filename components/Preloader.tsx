"use client";

import { useEffect, useState } from "react";
import { Profile } from "./Mark";

const KEY = "meg_intro";

/**
 * Cinematic intro — the lockup assembles itself once per session, then sets
 * `.ready` on <html> so the hero letter reveals fire. Returning visitors get
 * `.ready` immediately.
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
    const total = 2100;
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
        }, 300);
        setTimeout(() => setGone(true), 1100);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!show || gone) return null;

  const word = ["M", ".", "E", ".", "G"];
  return (
    <div className={`pre ${out ? "out" : ""}`} aria-hidden>
      <div className="pre-lockup">
        <Profile />
        <div className="pre-word">
          <div className="big">
            {word.map((ch, i) =>
              ch === "." ? (
                <span key={i} style={{ ["--i" as string]: i }}>
                  <i>.</i>
                </span>
              ) : (
                <span key={i} style={{ ["--i" as string]: i }}>
                  {ch}
                </span>
              )
            )}
          </div>
          <div className="bar">Enterprises</div>
        </div>
      </div>
      <div className="pre-foot">
        <div>
          Independent music
          <br />
          Developing artists
        </div>
        <b>{count}</b>
      </div>
      <div className="pre-line">
        <span style={{ ["--p" as string]: count / 100 }} />
      </div>
    </div>
  );
}
