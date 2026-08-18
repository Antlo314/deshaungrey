"use client";

import { useEffect, useRef } from "react";
import type { Single } from "@/lib/catalog";
import { useCinema } from "@/lib/useCinema";
import { Player } from "./Player";
import { BuyButton } from "./BuyButton";

export function Chapter({ track, index }: { track: Single; index: number }) {
  const cinema = useCinema();
  const root = useRef<HTMLElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const section = root.current;
    const vid = video.current;
    if (!cinema || !section || !vid) return;

    vid.loop = false;
    vid.pause();

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const dur = vid.duration;
        if (!Number.isFinite(dur) || dur <= 0) return;
        const total = section.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const traveled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), total);
        const next = (traveled / total) * (dur - 0.08);
        if (Math.abs(vid.currentTime - next) > 0.08) vid.currentTime = next;
      });
    };

    const ready = () => onScroll();
    vid.addEventListener("loadedmetadata", ready);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      vid.removeEventListener("loadedmetadata", ready);
      window.removeEventListener("scroll", onScroll);
    };
  }, [cinema]);

  return (
    <section
      ref={root}
      className={`chapter ${track.world}`}
      id={index === 0 ? "music" : undefined}
      data-track={track.id}
    >
      <div className="chapter-pin">
        <div className="chapter-media">
          {cinema ? (
            <video
              ref={video}
              muted
              playsInline
              preload="metadata"
              poster={track.plate}
            >
              <source src={track.plateVideo} type="video/mp4" />
            </video>
          ) : (
            <img
              src={track.plateMobile}
              srcSet={`${track.plateMobile} 1200w, ${track.plate} 1920w`}
              sizes="100vw"
              alt=""
            />
          )}
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
