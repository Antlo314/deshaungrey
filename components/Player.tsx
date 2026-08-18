"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { claimAudio, releaseAudio } from "@/lib/player-store";
import type { Single } from "@/lib/catalog";

const PREVIEW_CAP = 30;

export function Player({ track }: { track: Single }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const bars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => 28 + ((i * 37) % 72)),
    []
  );

  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const onTime = () => {
      setT(el.currentTime);
      if (el.currentTime >= PREVIEW_CAP) {
        el.pause();
        el.currentTime = 0;
        setPlaying(false);
      }
    };
    const onEnd = () => setPlaying(false);
    const onYield = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    el.addEventListener("dg-yield", onYield);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("dg-yield", onYield);
      releaseAudio(el);
    };
  }, []);

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    claimAudio(el);
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }

  const remain = Math.max(0, PREVIEW_CAP - t);
  const mm = `0:${String(Math.ceil(remain)).padStart(2, "0")}`;

  return (
    <div className={`player ${playing ? "playing" : ""}`}>
      <img
        className={`player-art ${playing ? "spin" : ""}`}
        src={track.cover}
        alt={`${track.title} cover`}
      />
      <div className="player-meta">
        <div className="player-title">{track.title}</div>
        <div className="player-sub">
          30s preview · {mm} · {track.explicit ? "explicit" : "clean"}
        </div>
        <div className="wave" aria-hidden>
          {bars.map((h, i) => (
            <i key={i} style={{ height: `${h}%`, animationDuration: `${0.7 + (i % 5) * 0.08}s` }} />
          ))}
        </div>
      </div>
      <button className="play" onClick={toggle} aria-label={playing ? "Pause preview" : "Play preview"}>
        {playing ? "Ⅱ" : "▶"}
      </button>
      <audio ref={audio} src={track.preview} preload="metadata" />
    </div>
  );
}
