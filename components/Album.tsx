"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { artist } from "@/lib/catalog";
import { useCinema } from "@/lib/useCinema";
import { Icon } from "./Icons";

const GENRES = ["R&B", "Hip-Hop", "Pop", "Reggae", "Dance", "Afrocentric", "Love", "Life", "Culture", "Celebration", "Evolution"];

/** World of Grey — the album teaser. Notify goes to /api/notify with interest=album. */
export function Album() {
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const cinema = useCinema();
  const section = useRef<HTMLElement | null>(null);
  // only fetch the 1.5MB ink loop once the section is nearly in view
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el || !cinema) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "60% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cinema]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") || "");
    setStatus("busy");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, interest: "album" }),
      });
      setStatus(res.ok ? "ok" : "err");
      if (res.ok) form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <section className="album" id="album" ref={section}>
      {near ? (
        <video
          className="album-video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/media/album/world-of-grey-poster.jpg"
          aria-hidden
        >
          <source src="/media/album/world-of-grey.mp4" type="video/mp4" />
        </video>
      ) : null}
      <div className="album-shades" aria-hidden />
      <div className="album-inner">
        <div>
          <p className="kicker dot reveal">The album · {artist.albumWhen}</p>
          <h2 className="reveal" style={{ ["--d" as string]: "0.08s" }}>
            World
            <br />
            of <em>Grey.</em>
          </h2>
          <p className="reveal" style={{ ["--d" as string]: "0.16s" }}>
            Many shades of one man. R&amp;B, hip-hop, pop, reggae, dance, Afrocentric — love, life, culture,
            celebration, evolution. The two singles are the door. The album is the house.
          </p>
        </div>
        <div className="album-side reveal" style={{ ["--d" as string]: "0.24s" }}>
          <div className="swatches" aria-label="The shades">
            {[
              ["#8b1e3f", "Burgundy"],
              ["#c9a46a", "Gold"],
              ["#f2c1c8", "Pink"],
              ["#6b6b70", "Grey"],
              ["#e8e2d6", "Bone"],
              ["#111114", "Void"],
            ].map(([c, n]) => (
              <span key={n} style={{ ["--c" as string]: c }}>
                <i />
                {n}
              </span>
            ))}
          </div>
          <div className="album-meta">
            <div><small>Artist</small>{artist.name}</div>
            <div><small>Label</small>{artist.label}</div>
            <div><small>Lead singles</small>Show Me · Where Dem Dollars At</div>
            <div><small>Status</small>In the studio</div>
          </div>
          <form className={`notify-line ${status === "ok" ? "ok" : ""}`} onSubmit={onSubmit}>
            <input name="email" type="email" required placeholder="Email for the first listen" aria-label="Email" />
            <button type="submit" disabled={status === "busy"}>
              {status === "ok" ? "You're first" : status === "busy" ? "…" : "Notify me"}
              <Icon.arrow style={{ width: 14, height: 14 }} />
            </button>
          </form>
          {status === "err" ? <p className="kicker">Try that email again.</p> : null}
        </div>
      </div>
      <div className="genres" aria-hidden>
        <div className="genres-track">
          {[...GENRES, ...GENRES].map((g, i) => (
            <span key={`${g}-${i}`}>{g}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
