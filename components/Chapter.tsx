"use client";

import { useEffect, useRef } from "react";
import type { Single } from "@/lib/catalog";
import { Player } from "./Player";
import { BuyButton } from "./BuyButton";

export function Chapter({ track, index }: { track: Single; index: number }) {
  const root = useRef<HTMLElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const section = root.current;
    const vid = video.current;
    if (!section || !vid) return;
    if (window.matchMedia("(max-width: 900px), (prefers-reduced-motion: reduce)").matches) {
      vid.loop = true;
      vid.muted = true;
      vid.play().catch(() => undefined);
      return;
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const traveled = Math.min(Math.max(-rect.top, 0), total);
        const p = traveled / total;
        const dur = vid.duration;
        if (Number.isFinite(dur) && dur > 0) {
          const next = p * (dur - 0.05);
          if (Math.abs(vid.currentTime - next) > 0.04) vid.currentTime = next;
        }
      });
    };

    vid.pause();
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={root}
      className={`chapter ${track.world}`}
      id={index === 0 ? "music" : undefined}
      data-track={track.id}
    >
      <div className="chapter-pin">
        <div className="chapter-media">
          <video
            ref={video}
            muted
            playsInline
            preload="auto"
            poster={track.plate}
          >
            <source src={track.plateVideo} type="video/mp4" />
          </video>
          <img src={track.plate} alt="" />
        </div>
        <div className="chapter-shade" />
        <div className="chapter-copy">
          <p className="kicker">Single 0{index + 1} · {track.vibe}</p>
          <h2>{track.title}</h2>
          {track.featured ? <div className="featured">{track.featured}</div> : null}
          <p className="blurb">{track.blurb}</p>
          <Player track={track} />
          <div className="actions">
            <BuyButton sku={track.sku} label={`Own it · ${track.price.label}`} />
            <a className="btn" href="#merch">
              Wear the world
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
