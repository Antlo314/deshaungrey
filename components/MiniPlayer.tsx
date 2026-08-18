"use client";

import { useEffect, useState } from "react";
import { subscribe, toggleCurrent, type NowPlaying } from "@/lib/player-store";
import { Icon } from "./Icons";

/**
 * Persistent now-playing bar. Appears once a preview has started and its
 * source player has scrolled out of view.
 */
export function MiniPlayer() {
  const [s, setS] = useState<NowPlaying | null>(null);
  const [seen, setSeen] = useState(false);
  const [srcVisible, setSrcVisible] = useState(true);

  useEffect(() => subscribe((n) => {
    setS(n);
    if (n.track) setSeen(true);
  }), []);

  // watch the owning .player; hide the mini bar while it's on screen
  const el = s?.el ?? null;
  useEffect(() => {
    const src = el?.closest(".player");
    if (!src) return;
    const io = new IntersectionObserver(
      (entries) => setSrcVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.2 }
    );
    io.observe(src);
    return () => io.disconnect();
  }, [el]);

  const track = s?.track;
  const on = Boolean(seen && track && s?.el && !srcVisible);
  const remain = Math.max(0, (s?.cap ?? 30) - (s?.time ?? 0));
  const p = s ? Math.min(1, (s.time ?? 0) / (s.cap ?? 30)) : 0;

  return (
    <div className={`mini ${on ? "on" : ""}`} aria-live="polite" aria-hidden={!on}>
      {track ? (
        <>
          <img src={track.coverMobile} alt="" />
          <div className="mini-meta">
            <div className="mini-title">{track.title}{track.featured ? ` ${track.featured}` : ""}</div>
            <div className="mini-sub">
              {s?.playing ? "Now playing" : "Paused"} · <b>0:{String(Math.ceil(remain)).padStart(2, "0")}</b>
            </div>
          </div>
          <button className="play" onClick={toggleCurrent} aria-label={s?.playing ? "Pause" : "Play"} tabIndex={on ? 0 : -1}>
            {s?.playing ? <Icon.pause className="ic" /> : <Icon.play className="ic" style={{ marginLeft: 2 }} />}
          </button>
          <span className="mini-bar" style={{ ["--p" as string]: p }} />
        </>
      ) : null}
    </div>
  );
}
