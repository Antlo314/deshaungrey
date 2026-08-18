"use client";

import { useEffect, useRef, useState } from "react";

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
const TIMEOUT =
  "I gotta run — press play on Show Me for me. I'll be back in a few.";

export function AshWidget() {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState(HELLO);
  const [status, setStatus] = useState("TALK TO ASH");
  const [quota, setQuota] = useState<Quota | null>(null);
  const [live, setLive] = useState(false);
  const greeted = useRef(false);
  const widgetHost = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/voice/quota")
      .then((r) => r.json())
      .then((q: Quota) => setQuota(q))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!open || greeted.current) return;
    greeted.current = true;
    playClip("/audio/ash/hello.mp3", HELLO);
  }, [open]);

  function playClip(src: string, fallback: string) {
    setLine(fallback);
    const audio = new Audio(src);
    audio.play().catch(() => undefined);
  }

  async function startLive() {
    if (quota?.timedOut) {
      setStatus("COME BACK IN A FEW");
      playClip("/audio/ash/timeout.mp3", TIMEOUT);
      return;
    }
    setStatus("CONNECTING");
    const res = await fetch("/api/voice/signed-url");
    const data = (await res.json()) as SessionRes;
    setQuota({
      remaining: data.remaining,
      cap: data.cap,
      timeoutMs: data.timeoutMs,
      timedOut: data.timedOut,
    });

    if (data.timedOut || data.reason === "timeout" || data.reason === "daily_cap") {
      setStatus("COME BACK IN A FEW");
      playClip("/audio/ash/timeout.mp3", TIMEOUT);
      return;
    }

    if (data.ok && data.signedUrl) {
      setLive(true);
      setStatus("I'M LISTENING");
      setLine("I'm here. Ask me about Dashaun, the singles, the merch, or the tour.");
      mountOfficialWidget(data.signedUrl);
      return;
    }

    setStatus("ASH IS WITH YOU");
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

    if (!document.querySelector('script[data-ash-embed]')) {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      s.async = true;
      s.dataset.ashEmbed = "1";
      document.body.appendChild(s);
    }
  }

  function jump(id: string) {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  const remaining = quota?.remaining ?? 12;
  const cap = quota?.cap ?? 12;
  const pct = Math.max(0, Math.min(100, (remaining / cap) * 100));

  return (
    <div className="ash" id="ash">
      {open ? (
        <div className="ash-panel">
          <div className="ash-top">
            <div>
              <div className="ash-status">{status}</div>
              <div className="ash-name">ASH</div>
            </div>
            <button className="ash-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <p className="ash-line">{line}</p>
          <div className="ash-meter" aria-hidden>
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="kicker" style={{ marginBottom: 12 }}>
            {remaining} of {cap} left this visit
          </p>
          <div className="ash-actions">
            {!live ? (
              <button className="btn solid" onClick={startLive}>
                Start
              </button>
            ) : null}
            <button className="btn" onClick={() => jump("music")}>
              Singles
            </button>
            <button className="btn" onClick={() => jump("merch")}>
              Merch
            </button>
          </div>
          <div ref={widgetHost} style={{ marginTop: 14 }} />
        </div>
      ) : null}
      <button
        className="ash-orb"
        onClick={() => setOpen((v) => !v)}
        aria-label="Talk to ASH"
      >
        <img src="/media/ash/ash-portrait.jpg" alt="ASH" />
      </button>
    </div>
  );
}
