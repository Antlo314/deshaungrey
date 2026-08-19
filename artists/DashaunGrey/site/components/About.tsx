"use client";

import { useEffect, useRef } from "react";
import { artist, stats, timeline } from "@/lib/catalog";

export function About() {
  const photo = useRef<HTMLDivElement | null>(null);

  // gentle scroll parallax on the portrait (desktop)
  useEffect(() => {
    const el = photo.current;
    if (!el || !window.matchMedia("(min-width: 901px)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.setProperty("--py", Math.max(-1, Math.min(1, p)).toFixed(3));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="about" id="about">
      <div className="about-photo reveal-img" ref={photo}>
        <img
          src="/media/about/portrait-m.jpg"
          srcSet="/media/about/portrait-m.jpg 900w, /media/about/portrait.jpg 1600w, /media/about/portrait-4k.jpg 2560w"
          sizes="(max-width: 900px) 100vw, 50vw"
          alt="Dashaun Grey in a windowpane tuxedo"
          loading="lazy"
        />
        <span className="cap">Official portrait · 2026</span>
      </div>
      <div className="about-copy">
        <p className="kicker dot reveal">From Loris to the world</p>
        <h2 className="reveal" style={{ ["--d" as string]: "0.08s" }}>
          Different
          <br />
          shades.
        </h2>
        <p className="reveal" style={{ ["--d" as string]: "0.14s" }}>
          After a season of physical, emotional, and spiritual healing, {artist.name}, formerly{" "}
          {artist.formerly}, returns with a new name and a sound that holds every dimension of his life.
        </p>
        <p className="reveal" style={{ ["--d" as string]: "0.2s" }}>
          Born {artist.born} in {artist.hometown}. At fourteen he was already in FaSho — a Warner-adjacent
          deal, Billboard ink, a 2011 Grammy ballot. The group years built him. The solo chapter is his.
        </p>
        <p className="reveal" style={{ ["--d" as string]: "0.26s" }}>
          The singles introduce the album {artist.album} on {artist.label}, landing {artist.albumWhen}.
          R&amp;B, hip-hop, pop, reggae, dance, Afrocentric — love, culture, celebration, evolution.
        </p>
        <blockquote className="reveal" style={{ ["--d" as string]: "0.32s" }}>“{artist.quote}”</blockquote>

        <div className="stats reveal" style={{ ["--d" as string]: "0.38s" }}>
          {stats.map((s) => (
            <div key={s.label}>
              <b>{s.n}</b>
              <small>{s.label}</small>
            </div>
          ))}
        </div>

        <div className="timeline reveal" style={{ ["--d" as string]: "0.44s" }}>
          {timeline.map((t) => (
            <div key={t.when}>
              <b>{t.when}</b>
              <span>{t.what}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
