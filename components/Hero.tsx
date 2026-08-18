"use client";

import { artist, dsps, press } from "@/lib/catalog";
import { useCinema } from "@/lib/useCinema";
import { letters } from "@/lib/motion";
import { Icon } from "./Icons";
import { scrollToId } from "./Effects";

export function Hero() {
  const cinema = useCinema();

  const first = letters("Dashaun");
  const last = letters("Grey", first.length);

  return (
    <section className="hero" id="top">
      <div className="hero-media">
        {cinema ? (
          <video autoPlay muted playsInline loop preload="auto" poster="/media/hero/hero-still.jpg">
            <source src="/media/hero/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/media/hero/hero-still-m.jpg"
            srcSet="/media/hero/hero-still-m.jpg 1200w, /media/hero/hero-still.jpg 1920w, /media/hero/hero-still-4k.jpg 3840w"
            sizes="100vw"
            alt="Dashaun Grey"
            fetchPriority="high"
          />
        )}
      </div>
      <div className="hero-shade" />

      <div className="hero-badge hero-fade" style={{ ["--d" as string]: "1.1s" }}>
        <i aria-hidden />
        New singles <b>out now</b>
      </div>

      <div className="hero-side hero-fade" style={{ ["--d" as string]: "1.3s" }}>
        World of Grey · The album · Coming {artist.albumWhen}
      </div>

      <div className="hero-copy">
        <p className="kicker dot hero-fade" style={{ ["--d" as string]: "0.35s" }}>
          MEG Enterprises presents · World of Grey
        </p>
        <h1 aria-label={artist.name}>
          <span className="row" aria-hidden>
            {first.map((l) => (
              <span className="st" key={l.key}>
                <span style={{ ["--i" as string]: l.i, ["--d" as string]: "0.25s" }}>{l.ch}</span>
              </span>
            ))}
          </span>
          <span className="row" aria-hidden>
            {last.map((l) => (
              <span className="st" key={l.key}>
                <span style={{ ["--i" as string]: l.i, ["--d" as string]: "0.25s" }}>{l.ch}</span>
              </span>
            ))}
          </span>
        </h1>
        <p className="hero-fade" style={{ ["--d" as string]: "0.9s" }}>
          {artist.tagline} Singer. Rapper. Songwriter. The singles are only an introduction.
        </p>
        <div className="hero-cta hero-fade" style={{ ["--d" as string]: "1.05s" }}>
          <a
            className="btn solid"
            href="#music"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("music");
            }}
          >
            <Icon.play style={{ width: 11, height: 11, fill: "currentColor" }} />
            Hear the singles
          </a>
          <div className="dsp" aria-label="Stream on">
            {dsps.slice(0, 3).map((d) => {
              const I = Icon[d.id];
              return (
                <a key={d.id} href={d.href} target={d.href === "#" ? undefined : "_blank"} rel="noreferrer" aria-label={d.label}>
                  <I />
                  {d.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hero-scroll hero-fade" style={{ ["--d" as string]: "1.4s" }} aria-hidden>
        Scroll
        <i />
      </div>

      <div className="hero-press hero-fade" style={{ ["--d" as string]: "1.5s" }} aria-label="As seen">
        <span className="lbl">As seen</span>
        <div className="marks">
          {press.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
