"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { company, record } from "@/lib/content";
import { letters, useFinePointer } from "@/lib/motion";
import { GoldField } from "./GoldField";
import { Profile } from "./Mark";
import { Arrow } from "./Icons";

const LINES: { text: string; em?: boolean }[] = [
  { text: "Independent music." },
  { text: "Developing artists." },
  { text: "Building brands." },
  { text: "Creating legacy.", em: true },
];

/**
 * 100svh cinema. A hero plate at /media/hero/hero.mp4 (+ hero-still.jpg
 * poster) plays under the gold field when present; if the file is missing the
 * section is still complete — the field, the mark and the type carry it.
 */
export function Hero() {
  const [mediaOn, setMediaOn] = useState(false);
  const [mediaDead, setMediaDead] = useState(false);
  const fine = useFinePointer();
  const vid = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      v.pause();
      return;
    }
    v.play().catch(() => {});
  }, [mediaDead]);

  return (
    <section className="hero" aria-label="MEG Enterprises">
      <div className={`hero-media ${mediaOn ? "on" : ""}`} aria-hidden>
        {!mediaDead ? (
          <video
            ref={vid}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster="/media/hero/hero-still.jpg"
            onCanPlay={() => setMediaOn(true)}
            onError={() => setMediaDead(true)}
          >
            <source src="/media/hero/hero.mp4" type="video/mp4" />
          </video>
        ) : null}
      </div>
      {fine ? <GoldField /> : null}
      <div className="hero-mark" aria-hidden>
        <Profile />
      </div>

      <div className="hero-side hero-fade" style={{ ["--d" as string]: "1.2s" }}>
        <span>{company.legal} — Independent record label</span>
      </div>

      <div className="hero-copy">
        <p className="kicker dot hero-fade" style={{ ["--d" as string]: "0.2s" }}>
          MEG Enterprises, LLC <span className="sep">·</span> Independent record label <span className="sep">·</span> Artist development <span className="sep">·</span> Management
        </p>
        <h1 className="hero-title">
          {LINES.map((l, li) => {
            const words = l.text.split(" ");
            let offset = 0; // letters stagger within a line; lines stagger by --d
            const lineDelay = `${0.3 + li * 0.14}s`;
            return (
              <span key={li} className={`line ${l.em ? "em" : ""}`}>
                {words.map((w, wi) => {
                  const ls = letters(w, offset);
                  offset += w.length + 1;
                  return (
                    <span key={wi} className="st" style={{ ["--d" as string]: lineDelay }}>
                      {ls.map((c) => (
                        <span key={c.key} style={{ ["--i" as string]: c.i }}>
                          {c.ch}
                        </span>
                      ))}
                      {wi < words.length - 1 ? <span style={{ ["--i" as string]: offset }}>&nbsp;</span> : null}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </h1>
        <p className="hero-sub hero-fade" style={{ ["--d" as string]: "1s" }}>
          A family-founded independent label with more than three decades in music, artist development, management and promotion — and a new generation of music ahead.
        </p>
        <div className="hero-cta hero-fade" style={{ ["--d" as string]: "1.15s" }}>
          <Link href="/artists" className="btn solid">
            Meet the roster <Arrow />
          </Link>
          <Link href="/contact" className="btn">
            Work with MEG
          </Link>
        </div>
        <div className="hero-strip hero-fade" style={{ ["--d" as string]: "1.4s" }}>
          <span className="kicker">Track record</span>
          {record.strip.map((s) => (
            <b key={s}>{s}</b>
          ))}
        </div>
      </div>

      <div className="hero-cue hero-fade" style={{ ["--d" as string]: "1.6s" }} aria-hidden>
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
