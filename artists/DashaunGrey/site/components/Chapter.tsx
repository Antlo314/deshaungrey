"use client";

import { useEffect, useRef, useState } from "react";
import type { Single } from "@/lib/catalog";
import { dsps } from "@/lib/catalog";
import { useCinema } from "@/lib/useCinema";
import { Player } from "./Player";
import { BuyButton } from "./BuyButton";
import { Icon } from "./Icons";
import { scrollToId } from "./Effects";

export function Chapter({ track, index }: { track: Single; index: number }) {
  const cinema = useCinema();
  const root = useRef<HTMLElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const tilt = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  // scroll-scrubbed plate on desktop
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

  // 3D tilt on the cover
  useEffect(() => {
    const el = tilt.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const wrap = el.parentElement!;
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const rx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ry = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.setProperty("--rx", rx.toFixed(3));
      el.style.setProperty("--ry", ry.toFixed(3));
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0");
      el.style.setProperty("--ry", "0");
    };
    wrap.addEventListener("mousemove", onMove, { passive: true });
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  async function share() {
    const url = `${location.origin}/#${track.id}`;
    const data = { title: `${track.title} — Dashaun Grey`, text: track.blurb, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const num = `0${index + 1}`;
  const badgeText = `${track.title} · Dashaun Grey · 30 sec preview · `;

  return (
    <section
      ref={root}
      className={`chapter ${track.world}`}
      id={index === 0 ? "music" : track.id}
      data-track={track.id}
    >
      {index === 0 ? <span id={track.id} style={{ position: "absolute", top: 0 }} aria-hidden /> : null}
      <div className="chapter-pin">
        <div className="chapter-media">
          {cinema ? (
            <video ref={video} muted playsInline preload="metadata" poster={track.plate}>
              <source src={track.plateVideo} type="video/mp4" />
            </video>
          ) : (
            <img
              src={track.plateMobile}
              srcSet={`${track.plateMobile} 1200w, ${track.plate} 1920w, ${track.plate4k} 3840w`}
              sizes="100vw"
              alt=""
              loading="lazy"
            />
          )}
        </div>
        <div className="chapter-shade" />
        <div className="chapter-num" aria-hidden>{num}</div>

        <div
          className="chapter-cover reveal"
          style={{ ["--d" as string]: "0.2s" }}
          aria-hidden
          onClick={() => root.current?.querySelector<HTMLButtonElement>(".player .play")?.click()}
        >
          <div className="tilt" ref={tilt}>
            <img src={track.coverMobile} srcSet={`${track.coverMobile} 800w, ${track.cover} 2048w`} sizes="300px" alt="" loading="lazy" />
            <svg className="badge-rot" viewBox="0 0 112 112">
              <defs>
                <path id={`ring-${track.id}`} d="M56,56 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
              </defs>
              <circle cx="56" cy="56" r="52" />
              <text>
                <textPath href={`#ring-${track.id}`}>{badgeText.toUpperCase()}</textPath>
              </text>
            </svg>
          </div>
        </div>

        <div className="chapter-copy">
          <p className="kicker dot reveal">Single {num} · {track.vibe}</p>
          <h2 className="reveal" style={{ ["--d" as string]: "0.08s" }}>{track.title}</h2>
          {track.featured ? <div className="featured reveal" style={{ ["--d" as string]: "0.14s" }}>{track.featured}</div> : null}
          <p className="blurb reveal" style={{ ["--d" as string]: "0.2s" }}>{track.blurb}</p>
          <div className="reveal" style={{ ["--d" as string]: "0.26s" }}>
            <Player track={track} />
          </div>
          <div className="actions reveal" style={{ ["--d" as string]: "0.32s" }}>
            <BuyButton sku={track.sku} label={`Own it · ${track.price.label}`} />
            <a className="btn ghost" href="#merch" onClick={(e) => { e.preventDefault(); scrollToId("merch"); }}>
              Wear the world <Icon.arrow className="arrow" style={{ width: 14, height: 14 }} />
            </a>
          </div>
          <div className="dsp reveal" style={{ ["--d" as string]: "0.38s" }}>
            <span className="lbl">Stream</span>
            {dsps.slice(0, 3).map((d) => {
              const I = Icon[d.id];
              return (
                <a key={d.id} href={d.href} target={d.href === "#" ? undefined : "_blank"} rel="noreferrer" aria-label={`${track.title} on ${d.label}`}>
                  <I />
                  {d.label}
                </a>
              );
            })}
            <button type="button" className="share" onClick={share}>{copied ? "Link copied" : "Share"}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
