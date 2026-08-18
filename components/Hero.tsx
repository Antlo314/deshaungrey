"use client";

import { artist } from "@/lib/catalog";
import { useCinema } from "@/lib/useCinema";

export function Hero() {
  const cinema = useCinema();

  return (
    <section className="hero" id="top">
      <div className="hero-media">
        {cinema ? (
          <video
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/media/hero/hero-still.jpg"
          >
            <source src="/media/hero/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/media/hero/hero-still-m.jpg"
            srcSet="/media/hero/hero-still-m.jpg 1200w, /media/hero/hero-still.jpg 1920w"
            sizes="100vw"
            alt="Dashaun Grey"
          />
        )}
      </div>
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="kicker">MEG Enterprises · World of Grey</p>
        <h1>
          Dashaun
          <br />
          Grey
        </h1>
        <p>{artist.tagline} Singer. Rapper. Songwriter. The singles are only an introduction.</p>
      </div>
      <div className="hero-scroll">Scroll the film</div>
    </section>
  );
}
