"use client";

import { artist, dsps, label, socials } from "@/lib/catalog";
import { Icon } from "./Icons";
import { scrollToId } from "./Effects";

const SOCIAL_ICON: Record<string, keyof typeof Icon> = {
  instagram: "instagram",
  tiktok: "tiktok",
  spotify: "spotify",
  apple: "apple",
  youtube: "youtube",
};

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="foot-grid">
        <div className="foot-brand reveal">
          <h4>{artist.name}</h4>
          <p>
            {artist.tagline} Singer, rapper, songwriter from {artist.hometown}. The album {artist.album} arrives {artist.albumWhen} on {artist.label}.
          </p>
          <div className="foot-social">
            {socials.map((s) => {
              const I = Icon[SOCIAL_ICON[s.id] ?? "spotify"];
              return (
                <a key={s.id} href={s.href} aria-label={s.label} target={s.href === "#" ? undefined : "_blank"} rel="noreferrer">
                  <I />
                </a>
              );
            })}
          </div>
        </div>
        <div className="reveal" style={{ ["--d" as string]: "0.08s" }}>
          <h4>Explore</h4>
          {[
            ["music", "Music"],
            ["album", "World of Grey"],
            ["about", "About"],
            ["label", "MEG Enterprises"],
            ["merch", "Merch"],
            ["tour", "Tour"],
          ].map(([id, l]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToId(id); }}>{l}</a>
          ))}
        </div>
        <div className="reveal" style={{ ["--d" as string]: "0.16s" }}>
          <h4>Stream</h4>
          {dsps.map((d) => (
            <a key={d.id} href={d.href} target={d.href === "#" ? undefined : "_blank"} rel="noreferrer">{d.label}</a>
          ))}
        </div>
        <div className="reveal" style={{ ["--d" as string]: "0.24s" }}>
          <h4>The label</h4>
          <p>{label.name}</p>
          <p style={{ color: "var(--mute)", fontSize: 12 }}>{label.tagline}</p>
          <p style={{ color: "var(--mute)", fontSize: 12 }}>Founded by {label.founder}</p>
        </div>
      </div>

      <div className="foot-mark reveal-clip" aria-hidden>GREY</div>

      <div className="foot-bottom">
        <div>
          © {new Date().getFullYear()} {artist.name} · {artist.label}
        </div>
        <nav aria-label="Social">
          {socials.map((s) => (
            <a key={s.id} href={s.href}>{s.label}</a>
          ))}
        </nav>
        <button className="to-top" onClick={() => scrollToId("top")}>
          Back to top
          <i><Icon.up /></i>
        </button>
      </div>
    </footer>
  );
}
