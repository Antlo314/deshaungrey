"use client";

import { useEffect, useRef, useState } from "react";
import { claimAudio, publish, releaseAudio } from "@/lib/player-store";
import type { Single } from "@/lib/catalog";
import { Icon } from "./Icons";

const PREVIEW_CAP = 30;
const BARS = 28;
const R = 26; // ring radius
const C = 2 * Math.PI * R;

export function Player({ track }: { track: Single }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const wave = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [cssWave, setCssWave] = useState(false);

  // wire audio events once
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const onTime = () => {
      setT(el.currentTime);
      publish({ time: el.currentTime });
      if (el.currentTime >= PREVIEW_CAP) {
        el.pause();
        el.currentTime = 0;
        stop();
      }
    };
    const stop = () => {
      setPlaying(false);
      publish({ playing: false });
    };
    const onEnd = () => stop();
    const onYield = () => stop();
    const onPause = () => stop();
    const onToggle = () => toggle();
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    el.addEventListener("pause", onPause);
    el.addEventListener("dg-yield", onYield);
    el.addEventListener("dg-toggle", onToggle);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("dg-yield", onYield);
      el.removeEventListener("dg-toggle", onToggle);
      releaseAudio(el);
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // analyser loop
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const bars = wave.current?.children;
    if (!bars) return;
    if (!playing) {
      for (let i = 0; i < bars.length; i++) (bars[i] as HTMLElement).style.transform = "scaleY(0.18)";
      return;
    }
    const an = analyserRef.current;
    if (!an) return;
    const data = new Uint8Array(an.frequencyBinCount);
    const loop = () => {
      an.getByteFrequencyData(data);
      const n = bars.length;
      for (let i = 0; i < n; i++) {
        // log-ish spread across the useful low/mid range, skip the DC bins
        const idx = Math.min(data.length - 1, Math.floor(Math.pow(i / n, 1.5) * data.length * 0.55) + 2);
        const v = Math.pow(data[idx] / 255, 1.5);
        const s = Math.min(1, 0.12 + v * 0.95);
        (bars[i] as HTMLElement).style.transform = `scaleY(${s.toFixed(3)})`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  function ensureAnalyser(el: HTMLAudioElement) {
    if (analyserRef.current || cssWave) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(el);
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      an.smoothingTimeConstant = 0.82;
      src.connect(an);
      an.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = an;
    } catch {
      setCssWave(true);
    }
  }

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      setPlaying(false);
      publish({ playing: false });
      return;
    }
    claimAudio(el);
    ensureAnalyser(el);
    ctxRef.current?.resume().catch(() => undefined);
    el.play()
      .then(() => {
        setPlaying(true);
        publish({ track, playing: true, el, cap: PREVIEW_CAP, time: el.currentTime });
      })
      .catch(() => setPlaying(false));
  }

  const remain = Math.max(0, PREVIEW_CAP - t);
  const mm = `0:${String(Math.ceil(remain)).padStart(2, "0")}`;
  const p = Math.min(1, t / PREVIEW_CAP);

  return (
    <div className={`player ${playing ? "playing" : ""} ${cssWave ? "css-wave" : ""}`}>
      <div className="player-art-wrap">
        <img
          className="player-art disc"
          src={track.coverMobile}
          srcSet={`${track.coverMobile} 800w, ${track.cover} 2048w`}
          sizes="76px"
          alt={`${track.title} cover`}
        />
      </div>
      <div className="player-meta">
        <div className="player-title">{track.title}</div>
        <div className="player-sub">
          <span>30s preview</span>·<b>{mm}</b>·<span>{track.explicit ? "explicit" : "clean"}</span>
        </div>
        <div className="wave" ref={wave} aria-hidden>
          {Array.from({ length: BARS }, (_, i) => (
            <i key={i} style={{ animationDuration: `${0.7 + (i % 5) * 0.08}s` }} />
          ))}
        </div>
      </div>
      <button
        className="play"
        onClick={toggle}
        aria-label={playing ? "Pause preview" : "Play preview"}
>
        <svg className="ring" viewBox="0 0 56 56" aria-hidden>
          <circle className="bg" cx="28" cy="28" r={R} />
          <circle
            className="fg"
            cx="28"
            cy="28"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - p)}
          />
        </svg>
        {playing ? <Icon.pause className="ic" /> : <Icon.play className="ic" style={{ marginLeft: 2 }} />}
      </button>
      <audio ref={audio} src={track.preview} preload="metadata" crossOrigin="anonymous" />
    </div>
  );
}
