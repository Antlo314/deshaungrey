"use client";

import { FormEvent, useState } from "react";

export function TourDrop() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        city: data.city,
        interest: "tour",
      }),
    });
    setStatus(res.ok ? "ok" : "err");
    if (res.ok) form.reset();
  }

  return (
    <section className="tour" id="tour">
      <p className="kicker">On the road</p>
      <h2>
        Dates
        <br />
        dropping.
      </h2>
      <p style={{ color: "var(--mute)", maxWidth: 460, lineHeight: 1.7 }}>
        Dashaun Grey is touring soon. No fake cities. When the routing locks, the list hears first —
        singles, merch restocks, and the first night on sale.
      </p>
      <form className="tour-form" onSubmit={onSubmit}>
        <input name="email" type="email" required placeholder="Email" aria-label="Email" />
        <input name="city" type="text" placeholder="Your city" aria-label="City" />
        <button className="btn solid" type="submit">
          Notify me
        </button>
      </form>
      {status === "ok" ? (
        <p className="kicker" style={{ marginTop: 18 }}>
          You&apos;re on the list.
        </p>
      ) : null}
      {status === "err" ? (
        <p className="kicker" style={{ marginTop: 18 }}>
          Try that email again.
        </p>
      ) : null}
    </section>
  );
}
