"use client";

import { artist } from "@/lib/catalog";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-media">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero/hero-still.jpg"
          preload="auto"
        >
          <source src="/media/hero/hero.mp4" type="video/mp4" />
        </video>
        <img src="/media/hero/hero-still.jpg" alt="" />
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
