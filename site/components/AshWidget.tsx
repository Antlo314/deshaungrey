"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";
import { Icon } from "./Icons";
import { useRouter } from "next/navigation";
import { GREETING } from "@/lib/ash-brain";

type Quota = { remaining: number; cap: number; timeoutMs: number; timedOut: boolean };
type SessionRes = Quota & { ok: boolean; reason?: string; signedUrl?: string };
type Msg = { role: "you" | "ash"; text: string };
// NB: bubble modifier classes are prefixed — a bare `.ash` would collide with the
// widget root rule (.ash { position: fixed }) and fling replies out of the panel.

const HELLO = GREETING;
const TIMEOUT = "I have to step away for a moment. Have a look around — the roster is on the Artists page.";
const TEASE_KEY = "meg_ash_tease";

/** Types a line out character by character. */
function useTypewriter(text: string, speed = 14) {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [cur, setCur] = useState(text);
  if (cur !== text) {
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
  return { out: reduced ? text : text.slice(0, idx), done: reduced || idx >= text.length };
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechCtor = new () => SpeechRec;

export function AshWidget() {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState(HELLO);
  const [log, setLog] = useState<Msg[]>([]);
  const router = useRouter();
  const [status, setStatus] = useState("Talk to ASH");
  const [quota, setQuota] = useState<Quota | null>(null);
  const [live, setLive] = useState(false);
  const [tease, setTease] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  // Her voice costs ElevenLabs credit, so it is a toggle and it is capped per visit.
  // Text answers are always free and always available.
  const [voiceOn, setVoiceOn] = useState(true);
  const [voiceLeft, setVoiceLeft] = useState<number | null>(null);
  const [voiceCap, setVoiceCap] = useState(10);
  const [voiceWired, setVoiceWired] = useState(true);
  // a live ElevenLabs call needs ELEVENLABS_AGENT_ID; TTS only needs the voice id
  const [agentWired, setAgentWired] = useState(false);
  // read once during render: speech support is a static browser capability
  const [canListen] = useState(() => {
    if (typeof window === "undefined") return false;
    const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  });

  const greeted = useRef(false);
  const widgetHost = useRef<HTMLDivElement | null>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const envRef = useRef<Float32Array | null>(null);   // amplitude envelope of the current clip
  // The mic path captures callbacks for the lifetime of a recognition session, so
  // anything speak() reads must come from a ref or it will be a stale snapshot.
  const voiceOnRef = useRef(true);
  const voiceLeftRef = useRef<number | null>(null);
  const voiceWiredRef = useRef(true);
  const rafRef = useRef(0);
  const recRef = useRef<SpeechRec | null>(null);

  const { out: typed, done } = useTypewriter(line);
  voiceOnRef.current = voiceOn;
  voiceLeftRef.current = voiceLeft;
  voiceWiredRef.current = voiceWired;

  useEffect(() => {
    fetch("/api/voice/quota")
      .then((r) => r.json())
      .then((q: Quota & { agentWired?: boolean }) => {
        setQuota(q);
        setAgentWired(Boolean(q.agentWired));
      })
      .catch(() => undefined);
    fetch("/api/ash/speak")
      .then((r) => r.json())
      .then((v: { left: number; cap: number; wired: boolean }) => {
        setVoiceLeft(v.left);
        setVoiceCap(v.cap);
        setVoiceWired(v.wired);
      })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [log, thinking]);

  // ---------------------------------------------------------------- audio
  /** Must be called from a user gesture, or the context stays suspended. */
  function primeAudio() {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctxRef.current) ctxRef.current = new AC();
      if (ctxRef.current.state !== "running") void ctxRef.current.resume();
    } catch {
      ctxRef.current = null;
    }
  }

  /** Wires an <audio> through an analyser so the orb pulses with her voice. */
  /**
   * Builds an amplitude envelope for a clip WITHOUT routing playback through the
   * AudioContext. Routing was the bug: opening the microphone for speech
   * recognition can suspend the context, and a suspended graph silently swallows
   * whatever is routed into it — she went mute for exactly that reason. The
   * <audio> element now always plays straight to the speakers, and the orb reads
   * this pre-computed envelope instead.
   */
  async function buildEnvelope(buf: ArrayBuffer) {
    try {
      const ctx = ctxRef.current;
      if (!ctx) return null;
      const decoded = await ctx.decodeAudioData(buf.slice(0));
      const ch = decoded.getChannelData(0);
      const step = Math.max(1, Math.floor(decoded.sampleRate / 30)); // ~30 buckets/sec
      const out = new Float32Array(Math.ceil(ch.length / step));
      let peak = 0.0001;
      for (let i = 0, b = 0; i < ch.length; i += step, b++) {
        let sum = 0;
        const end = Math.min(i + step, ch.length);
        for (let j = i; j < end; j++) sum += ch[j] * ch[j];
        const rms = Math.sqrt(sum / Math.max(1, end - i));
        out[b] = rms;
        if (rms > peak) peak = rms;
      }
      for (let i = 0; i < out.length; i++) out[i] = Math.min(1, (out[i] / peak) * 1.15);
      return out;
    } catch {
      return null;
    }
  }

  /** Drives --amp from the envelope when we have one, else a believable synthetic pulse. */
  function pulseWhile(audio: HTMLAudioElement) {
    const start = () => {
      setSpeaking(true);
      const loop = () => {
        const env = envRef.current;
        let amp;
        if (env && env.length) {
          const idx = Math.min(env.length - 1, Math.floor(audio.currentTime * 30));
          amp = env[idx] || 0;
        } else {
          amp = 0.35 + Math.abs(Math.sin(audio.currentTime * 7)) * 0.5;
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
    audio.addEventListener("error", end);
  }

  function playClip(src: string, fallback: string) {
    setLine(fallback);
    if (!voiceOnRef.current) return;   // cached clips are free but respect the toggle
    audioRef.current?.pause();
    const audio = new Audio(src);
    audioRef.current = audio;
    envRef.current = null;             // synthetic pulse is fine for the cached clips
    pulseWhile(audio);
    audio.play().catch(() => undefined);
  }

  /** Speaks the answer. Voice leads — this runs for every answer until the budget
   *  is spent, after which she keeps replying in text. */
  async function speak(text: string) {
    if (!voiceOnRef.current || !voiceWiredRef.current) return;
    if (voiceLeftRef.current === 0) return;   // known-empty; the server is the authority otherwise
    try {
      const res = await fetch("/api/ash/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          setVoiceLeft(0);
          voiceLeftRef.current = 0;
        }
        return;
      }
      const left = res.headers.get("X-Ash-Voice-Left");
      if (left !== null) {
        setVoiceLeft(Number(left));
        voiceLeftRef.current = Number(left);
      }

      const buf = await res.arrayBuffer();
      envRef.current = await buildEnvelope(buf);

      const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      pulseWhile(audio);              // never routed through the AudioContext
      audio.addEventListener("ended", () => URL.revokeObjectURL(url));
      await audio.play().catch(() => undefined);
    } catch {
      /* text still shows */
    }
  }

  // ---------------------------------------------------------------- ask
  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    setLog((l) => [...l, { role: "you", text: q }]);
    setThinking(true);
    setStatus("Thinking");
    try {
      const res = await fetch("/api/ash/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history: log.slice(-6) }),
      });
      const data = (await res.json()) as { answer?: string };
      const answer = data.answer || "Say that again for me?";
      setLog((l) => [...l, { role: "ash", text: answer }]);
      setLine(answer);
      setStatus("Ask me anything");
      speak(answer);
    } catch {
      const answer = "My line glitched. Ask me again?";
      setLog((l) => [...l, { role: "ash", text: answer }]);
      setLine(answer);
    } finally {
      setThinking(false);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    primeAudio();
    const el = inputRef.current;
    if (!el) return;
    const v = el.value;
    el.value = "";
    ask(v);
  }

  /** Voice input via the browser's speech recognition, where available. */
  function toggleMic() {
    primeAudio();
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const said = e.results?.[0]?.[0]?.transcript || "";
      if (said) ask(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    setStatus("Listening");
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }

  // ---------------------------------------------------------------- live agent
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
    // No live agent wired: fall back to the text + TTS path, and say so out loud
    // rather than going silent.
    const fallback =
      "My live line isn't up yet, but I'm right here — type it or hit the mic and I'll answer you.";
    setStatus("Ask me anything");
    setLine(fallback);
    setLog((l) => [...l, { role: "ash", text: fallback }]);
    speak(fallback);
  }

  function mountOfficialWidget(signedUrl: string) {
    const host = widgetHost.current;
    if (!host) return;
    host.innerHTML = "";
    const el = document.createElement("elevenlabs-convai");
    el.setAttribute("signed-url", signedUrl);
    el.setAttribute("variant", "full");
    // no avatar image on purpose — ASH is an orb, never a face
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

  /** She is a guide: chips take you to the page rather than just talking about it. */
  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const remaining = quota?.remaining ?? 12;
  const cap = quota?.cap ?? 12;
  const chips = [
    { l: "What is MEG?", go: () => ask("What is MEG Enterprises?") },
    { l: "The roster", go: () => go("/artists") },
    { l: "Submit music", go: () => go("/submit") },
    { l: "What do you do?", go: () => ask("What does MEG do for artists?") },
    { l: "The founder", go: () => ask("Who founded MEG?") },
    { l: "Contact", go: () => go("/contact") },
  ];

  return (
    <div className={`ash ${open ? "open" : ""} ${speaking ? "speaking" : ""}`} id="ash" ref={root}>
      {open ? (
        <div className="ash-panel" role="dialog" aria-label="ASH" data-lenis-prevent>
          <div className="ash-head">
            <span className="orb-sm" aria-hidden>
              <span className="orb" />
            </span>
            <div className="who">
              <div className="ash-name">ASH</div>
              <div className={`ash-status ${live || speaking ? "live" : ""}`}>
                <i aria-hidden />
                {status}
              </div>
            </div>
            <button
              className={`ash-voice ${voiceOn && voiceWired ? "on" : ""}`}
              onClick={() => {
                primeAudio();
                setVoiceOn((v) => !v);
              }}
              aria-pressed={voiceOn}
              disabled={!voiceWired}
              title={
                !voiceWired
                  ? "Voice not configured"
                  : voiceOn
                    ? "Mute ASH's voice"
                    : "Let ASH speak"
              }
              aria-label={voiceOn ? "Mute ASH's voice" : "Let ASH speak"}
            >
              {voiceOn && voiceWired ? (
                <Icon.speaker style={{ width: 15, height: 15 }} />
              ) : (
                <Icon.speakerOff style={{ width: 15, height: 15 }} />
              )}
            </button>
            <button className="ash-close" onClick={() => setOpen(false)} aria-label="Close">
              <Icon.close style={{ width: 14, height: 14 }} />
            </button>
          </div>

          <div className="ash-body">
            <div className="ash-scroll" ref={scroller}>
              {log.length === 0 ? (
                <p className="ash-line" aria-live="polite">
                  {typed}
                  {!done ? <span className="caret" aria-hidden /> : null}
                </p>
              ) : (
                <>
                  {log.map((m, i) => (
                    <p key={i} className={`bubble from-${m.role}`}>
                      {m.text}
                    </p>
                  ))}
                  {thinking ? (
                    <p className="bubble from-ash thinking" aria-live="polite">
                      <i /><i /><i />
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="chips">
              {chips.map((c) => (
                <button key={c.l} type="button" onClick={c.go}>
                  {c.l}
                </button>
              ))}
            </div>

            <form className="ash-ask" onSubmit={onSubmit}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask me about MEG…"
                aria-label="Ask ASH about MEG Enterprises"
                maxLength={300}
                autoComplete="off"
              />
              {canListen ? (
                <button
                  type="button"
                  className={`ash-mic ${listening ? "on" : ""}`}
                  onClick={toggleMic}
                  aria-label={listening ? "Stop listening" : "Speak to ASH"}
                >
                  <Icon.mic style={{ width: 15, height: 15 }} />
                </button>
              ) : null}
              <button type="submit" className="ash-send" aria-label="Send" disabled={thinking}>
                <Icon.arrow style={{ width: 15, height: 15 }} />
              </button>
            </form>

            {agentWired && !live ? (
              <button className="btn ghost ash-livebtn" onClick={startLive}>
                Start a live call
              </button>
            ) : null}
            <div ref={widgetHost} className="ash-host" />

            <div className="pips" aria-hidden>
              {Array.from({ length: voiceCap }, (_, i) => (
                <i key={i} className={i < (voiceLeft ?? voiceCap) ? "on" : ""} />
              ))}
            </div>
            <div className="ash-quota">
              <span>
                {!voiceWired
                  ? "Text answers · voice not configured"
                  : voiceLeft === 0
                    ? "Voice budget spent · text answers"
                    : `${voiceLeft ?? voiceCap} of ${voiceCap} spoken replies left`}
              </span>
              <span>{voiceOn ? "Voice on" : "Voice off"}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`ash-bubble ${tease && !open ? "show" : ""}`} aria-hidden>
        Psst — I&apos;m ASH. Ask me anything about him.
      </div>

      <button
        className="ash-orb"
        id="ash-orb"
        onClick={() => {
          primeAudio();
          setOpen((v) => !v);
          setTease(false);
        }}
        aria-label={open ? "Close ASH" : "Talk to ASH"}
        aria-expanded={open}
      >
        <span className="halo" aria-hidden />
        <span className="halo two" aria-hidden />
        <span className="live" aria-hidden />
        <span className="conic" aria-hidden />
        <span className="core">
          <span className="orb" />
        </span>
        <span className="x" aria-hidden>
          <Icon.close style={{ width: 16, height: 16 }} />
        </span>
      </button>
    </div>
  );
}
