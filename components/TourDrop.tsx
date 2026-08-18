"use client";

import { FormEvent, useRef, useState } from "react";

const HINTS = ["Atlanta", "Charlotte", "Myrtle Beach", "Columbia", "Charleston", "Houston", "Los Angeles", "New York"];

export function TourDrop() {
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const city = useRef<HTMLInputElement | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("busy");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, city: data.city, interest: "tour" }),
      });
      setStatus(res.ok ? "ok" : "err");
      if (res.ok) form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <section className="tour" id="tour">
      <div className="tour-ghost" aria-hidden>
        <span>ON THE ROAD · ON THE ROAD · ON THE ROAD · </span>
      </div>
      <div className="tour-inner">
        <div>
          <p className="kicker dot reveal">On the road</p>
          <h2 className="reveal" style={{ ["--d" as string]: "0.08s" }}>
            Dates
            <br />
            <em>dropping.</em>
          </h2>
          <p className="lead reveal" style={{ ["--d" as string]: "0.16s" }}>
            Dashaun Grey is touring soon. No fake cities. When the routing locks, the list hears first —
            singles, merch restocks, and the first night on sale.
          </p>
          <div className="tour-note reveal" style={{ ["--d" as string]: "0.24s" }}>
            <span><b>Cities</b> · TBA</span>
            <span><b>Presale</b> · List first</span>
            <span><b>Merch</b> · At the venue</span>
          </div>
        </div>

        <form className="tour-form reveal" style={{ ["--d" as string]: "0.2s" }} onSubmit={onSubmit}>
          <div className="field">
            <input id="tour-email" name="email" type="email" required placeholder=" " autoComplete="email" />
            <label htmlFor="tour-email">Email</label>
          </div>
          <div className="field">
            <input id="tour-city" name="city" type="text" placeholder=" " ref={city} autoComplete="address-level2" />
            <label htmlFor="tour-city">Your city</label>
          </div>
          <div className="tour-cities" aria-label="Quick pick a city">
            {HINTS.map((h) => (
              <span
                key={h}
                role="button"
                tabIndex={0}
                onClick={() => { if (city.current) city.current.value = h; }}
                onKeyDown={(e) => { if (e.key === "Enter" && city.current) city.current.value = h; }}
              >
                {h}
              </span>
            ))}
          </div>
          <button className="btn solid" type="submit" disabled={status === "busy"}>
            {status === "busy" ? "…" : "Put me on the list"}
          </button>
          {status === "ok" ? (
            <div className="tour-ok" role="status">
              <svg viewBox="0 0 28 28" aria-hidden>
                <circle cx="14" cy="14" r="12.5" />
                <path d="M8.5 14.5l4 4 7-8" />
              </svg>
              You&apos;re on the list.
            </div>
          ) : null}
          {status === "err" ? <p className="kicker" role="status">Try that email again.</p> : null}
        </form>
      </div>
    </section>
  );
}
