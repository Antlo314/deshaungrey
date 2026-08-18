"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";
import { Icon } from "./Icons";
import { scrollToId } from "./Effects";

type Quota = {
  remaining: number;
  cap: number;
  timeoutMs: number;
  timedOut: boolean;
};

type SessionRes = Quota & {
  ok: boolean;
  reason?: string;
  signedUrl?: string;
};

const HELLO =
  "Hey. You made it into the World of Grey. I'm ASH — Dashaun's biggest fan. You want the new singles, the merch, or you just wanna talk him?";
const TIMEOUT = "I gotta run — press play on Show Me for me. I'll be back in a few.";
const TEASE_KEY = "dg_ash_tease";

/** Types a line out character by character. */
function useTypewriter(text: string, speed = 14) {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [cur, setCur] = useState(text);
  if (cur !== text) {
    // derived-state reset during render (React-sanctioned pattern)
    setCur(text);
    setIdx(0);
  }
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setIdx((i) => {
        if (i >= text.length) {
          clearInterval(id);
          return i;
        }
        return i + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduced]);
  const out = reduced ? text : text.slice(0, idx);
  return { out, done: reduced || idx >= text.length };
}

export function AshWidget() {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState(HELLO);
  const [status, setStatus] = useState("Talk to ASH");
  const [quota, setQuota] = useState<Quota | null>(null);
  const [live, setLive] = useState(false);
  const [tease, setTease] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const greeted = useRef(false);
  const widgetHost = useRef<HTMLDivElement | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const anRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const { out: typed, done } = useTypewriter(line);

  useEffect(() => {
    fetch("/api/voice/quota")
      .then((r) => r.json())
      .then((q: Quota) => setQuota(q))
      .catch(() => undefined);
  }, []);

  // teaser bubble, once per session
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(TEASE_KEY) === "1";
    } catch {
      seen = true;
    }
    if (seen || open) return;
    const t1 = setTimeout(() => setTease(true), 5200);
    const t2 = setTimeout(() => setTease(false), 11500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      sessionStorage.setItem(TEASE_KEY, "1");
    } catch {
      /* ignore */
    }
    if (greeted.current) return;
    greeted.current = true;
    playClip("/audio/ash/hello.mp3", HELLO);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function playClip(src: string, fallback: string) {
    setLine(fallback);
    audioRef.current?.pause();
    const audio = new Audio(src);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    // audio-reactive halo
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = ctxRef.current ?? new AC();
      ctxRef.current = ctx;
      const src2 = ctx.createMediaElementSource(audio);
      const an = ctx.createAnalyser();
      an.fftSize = 64;
      an.smoothingTimeConstant = 0.7;
      src2.connect(an);
      an.connect(ctx.destination);
      anRef.current = an;
      ctx.resume().catch(() => undefined);
    } catch {
      anRef.current = null;
    }
    const start = () => {
      setSpeaking(true);
      const an = anRef.current;
      const data = an ? new Uint8Array(an.frequencyBinCount) : null;
      const loop = () => {
        let amp = 0.5;
        if (an && data) {
          an.getByteFrequencyData(data);
          let s = 0;
          for (let i = 0; i < 12; i++) s += data[i];
          amp = Math.min(1, s / (12 * 200));
        }
        root.current?.style.setProperty("--amp", amp.toFixed(3));
        rafRef.current = requestAnimationFrame(loop);
      };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    const end = () => {
      setSpeaking(false);
      cancelAnimationFrame(rafRef.current);
      root.current?.style.setProperty("--amp", "0");
    };
    audio.addEventListener("play", start);
    audio.addEventListener("ended", end);
    audio.addEventListener("pause", end);
    audio.play().catch(() => undefined);
  }

  async function startLive() {
    if (quota?.timedOut) {
      setStatus("Come back in a few");
      playClip("/audio/ash/timeout.mp3", TIMEOUT);
      return;
    }
    setStatus("Connecting");
    const res = await fetch("/api/voice/signed-url");
    const data = (await res.json()) as SessionRes;
    setQuota({
      remaining: data.remaining,
      cap: data.cap,
      timeoutMs: data.timeoutMs,
      timedOut: data.timedOut,
    });

    if (data.timedOut || data.reason === "timeout" || data.reason === "daily_cap") {
      setStatus("Come back in a few");
      playClip("/audio/ash/timeout.mp3", TIMEOUT);
      return;
    }

    if (data.ok && data.signedUrl) {
      setLive(true);
      setStatus("I'm listening");
      setLine("I'm here. Ask me about Dashaun, the singles, the merch, or the tour.");
      mountOfficialWidget(data.signedUrl);
      return;
    }

    setStatus("ASH is with you");
    setLine(
      data.reason === "agent_unwired"
        ? "I'm on the site even while my live voice is warming up. Hit Music for Show Me and Where Dem Dollars At, or jump the tour list."
        : "Give me a second — my live line is busy. The singles still play."
    );
  }

  function mountOfficialWidget(signedUrl: string) {
    const host = widgetHost.current;
    if (!host) return;
    host.innerHTML = "";
    const el = document.createElement("elevenlabs-convai");
    el.setAttribute("signed-url", signedUrl);
    el.setAttribute("variant", "full");
    el.setAttribute("avatar-image-url", "/media/ash/ash-portrait.jpg");
    el.setAttribute("avatar-orb-color-1", "#C9A46A");
    el.setAttribute("avatar-orb-color-2", "#8B1E3F");
    el.setAttribute("action-text", "Talk to ASH");
    el.setAttribute("start-call-text", "I'm listening");
    el.setAttribute("end-call-text", "That's a wrap");
    host.appendChild(el);

    if (!document.querySelector("script[data-ash-embed]")) {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      s.async = true;
      s.dataset.ashEmbed = "1";
      document.body.appendChild(s);
    }
  }

  function jump(id: string) {
    setOpen(false);
    scrollToId(id);
  }

  function playTrack(id: string) {
    setOpen(false);
    scrollToId(id === "show-me" ? "music" : id);
    setLine(id === "show-me" ? "Show Me. Candles on. Say less." : "Where Dem Dollars At — towels on, sunglasses on.");
    setTimeout(() => {
      const btn = document.querySelector<HTMLButtonElement>(`[data-track="${id}"] .player .play`);
      if (btn && btn.getAttribute("aria-label")?.startsWith("Play")) btn.click();
    }, 900);
  }

  const remaining = quota?.remaining ?? 12;
  const cap = quota?.cap ?? 12;
  const chips = [
    { l: "Play Show Me", go: () => playTrack("show-me") },
    { l: "Play WTDA", go: () => playTrack("wtda") },
    { l: "The merch", go: () => jump("merch") },
    { l: "Tour dates?", go: () => jump("tour") },
    { l: "Who is Dashaun?", go: () => jump("about") },
  ];

  return (
    <div className={`ash ${open ? "open" : ""} ${speaking ? "speaking" : ""}`} id="ash" ref={root}>
      {open ? (
        <div className="ash-panel" role="dialog" aria-label="ASH" data-lenis-prevent>
          <div className="ash-head">
            <img src="/media/ash/ash-portrait-m.jpg" alt="" />
            <div className="who">
              <div className="ash-name">ASH</div>
              <div className={`ash-status ${live ? "live" : ""}`}>
                <i aria-hidden />
                {status}
              </div>
            </div>
            <button className="ash-close" onClick={() => setOpen(false)} aria-label="Close">
              <Icon.close style={{ width: 14, height: 14 }} />
            </button>
          </div>

          <div className="ash-body">
            <p className="ash-line" aria-live="polite">
              {typed}
              {!done ? <span className="caret" aria-hidden /> : null}
            </p>

            <div className="pips" aria-hidden>
              {Array.from({ length: cap }, (_, i) => (
                <i key={i} className={i < remaining ? "on" : ""} />
              ))}
            </div>
            <div className="ash-quota">
              <span>{remaining} of {cap} live turns left</span>
              <span>{quota?.timedOut ? "Cooling down" : "This visit"}</span>
            </div>

            <div className="chips">
              {chips.map((c) => (
                <button key={c.l} type="button" onClick={c.go}>{c.l}</button>
              ))}
            </div>

            <div className="ash-actions">
              {!live ? (
                <button className="btn solid" onClick={startLive}>
                  <Icon.mic style={{ width: 13, height: 13 }} />
                  Talk live
                </button>
              ) : null}
              <button className="btn ghost" onClick={() => jump("music")}>Singles</button>
              <button className="btn ghost" onClick={() => jump("merch")}>Merch</button>
            </div>
            <div ref={widgetHost} className="ash-host" />
          </div>
          <div className="ash-foot">
            <span>Voice · ElevenLabs</span>
            <span>Only talks Dashaun</span>
          </div>
        </div>
      ) : null}

      <div className={`ash-bubble ${tease && !open ? "show" : ""}`} aria-hidden>
        Psst — I&apos;m ASH. Wanna hear the new one?
      </div>

      <button
        className="ash-orb"
        id="ash-orb"
        onClick={() => { setOpen((v) => !v); setTease(false); }}
        aria-label={open ? "Close ASH" : "Talk to ASH"}
        aria-expanded={open}
>
        <span className="halo" aria-hidden />
        <span className="halo two" aria-hidden />
        <span className="live" aria-hidden />
        <span className="conic" aria-hidden />
        <span className="core">
          <img
            src="/media/ash/ash-portrait-m.jpg"
            srcSet="/media/ash/ash-portrait-m.jpg 400w, /media/ash/ash-portrait.jpg 1024w"
            sizes="76px"
            alt=""
          />
        </span>
        <span className="x" aria-hidden>
          <Icon.close style={{ width: 16, height: 16 }} />
        </span>
      </button>
    </div>
  );
}
