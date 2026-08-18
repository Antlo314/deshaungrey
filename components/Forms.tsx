"use client";

import { useState, type FormEvent } from "react";
import { genres, inquiryKinds } from "@/lib/content";
import { Arrow } from "./Icons";

function Done({ title, body }: { title: string; body: string }) {
  return (
    <div className="form-done reveal in">
      <svg className="check" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r="30" />
        <path d="M20 33l8 8 16-18" />
      </svg>
      <h3 className="h3">{title}</h3>
      <p>{body}</p>
    </div>
  );
}

async function post(url: string, data: Record<string, unknown>) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !json.ok) throw new Error(json.message || "Something went wrong. Try again.");
  return json;
}

/* ---------- inquiry / contact ---------- */
export function InquiryForm({ initialKind = "general" }: { initialKind?: string }) {
  const [kind, setKind] = useState(inquiryKinds.some((k) => k.id === initialKind) ? initialKind : "general");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    try {
      await post("/api/inquiries", { ...data, kind, source: "contact" });
      setDone(true);
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <Done title="Received." body="Thank you — a person will read this and reply. Not a form." />;

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field static">
        <label>What is this about?</label>
        <div className="chips" role="radiogroup" aria-label="Inquiry type">
          {inquiryKinds.map((k) => (
            <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} className={`chip ${kind === k.id ? "on" : ""}`} onClick={() => setKind(k.id)}>
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <input id="name" name="name" placeholder=" " required autoComplete="name" />
          <label htmlFor="name">Your name</label>
        </div>
        <div className="field">
          <input id="email" name="email" type="email" placeholder=" " required autoComplete="email" inputMode="email" />
          <label htmlFor="email">Email</label>
        </div>
        <div className="field">
          <input id="company" name="company" placeholder=" " autoComplete="organization" />
          <label htmlFor="company">Company / outlet (optional)</label>
        </div>
        <div className="field">
          <input id="phone" name="phone" placeholder=" " autoComplete="tel" inputMode="tel" />
          <label htmlFor="phone">Phone (optional)</label>
        </div>
        <div className="field full">
          <textarea id="message" name="message" placeholder=" " required rows={5} />
          <label htmlFor="message">
            {kind === "booking" ? "Event, date, city, budget range — what you know so far" : kind === "press" ? "Outlet, angle, deadline" : "Tell us what you have in mind"}
          </label>
        </div>
      </div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
      {err ? (
        <div className="form-msg err" role="alert">
          {err}
        </div>
      ) : null}
      <div className="form-foot">
        <small>We read every message. Booking and press go straight to the right desk. Nothing here is shared or sold.</small>
        <button className="btn solid" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send"} <Arrow />
        </button>
      </div>
    </form>
  );
}

/* ---------- A&R submission ---------- */
export function SubmitForm({ open = true, note }: { open?: boolean; note?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [genre, setGenre] = useState("");
  const [links, setLinks] = useState<string[]>([""]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    try {
      await post("/api/submissions", { ...data, genre, links: links.filter(Boolean) });
      setDone(true);
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <div className="form-msg" role="status">
        Submissions are closed right now. Follow the label for the next open window.
      </div>
    );
  if (done) return <Done title="We'll listen." body="Every submission is heard by a person at MEG. If it's a fit for development, you'll hear from us directly." />;

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field">
          <input id="artistName" name="artistName" placeholder=" " required />
          <label htmlFor="artistName">Artist / act name</label>
        </div>
        <div className="field">
          <input id="sname" name="name" placeholder=" " required autoComplete="name" />
          <label htmlFor="sname">Your name</label>
        </div>
        <div className="field">
          <input id="semail" name="email" type="email" placeholder=" " required autoComplete="email" inputMode="email" />
          <label htmlFor="semail">Email</label>
        </div>
        <div className="field">
          <input id="sphone" name="phone" placeholder=" " autoComplete="tel" inputMode="tel" />
          <label htmlFor="sphone">Phone (optional)</label>
        </div>
        <div className="field">
          <input id="city" name="city" placeholder=" " autoComplete="address-level2" />
          <label htmlFor="city">City</label>
        </div>
        <div className="field static">
          <label>Genre</label>
          <div className="chips" role="radiogroup" aria-label="Genre">
            {genres.map((g) => (
              <button key={g} type="button" role="radio" aria-checked={genre === g} className={`chip ${genre === g ? "on" : ""}`} onClick={() => setGenre(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="field static full">
          <label>Links to your music (Spotify, YouTube, SoundCloud, private links)</label>
          <div style={{ display: "grid", gap: 10 }}>
            {links.map((l, i) => (
              <div className="field" key={i}>
                <input
                  value={l}
                  placeholder=" "
                  inputMode="url"
                  onChange={(e) => setLinks((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                  aria-label={`Link ${i + 1}`}
                />
                <label>Link {i + 1}</label>
              </div>
            ))}
          </div>
          {links.length < 6 ? (
            <button type="button" className="chip" style={{ marginTop: 12 }} onClick={() => setLinks((arr) => [...arr, ""])}>
              + Add another link
            </button>
          ) : null}
        </div>
        <div className="field full">
          <textarea id="smessage" name="message" placeholder=" " rows={4} />
          <label htmlFor="smessage">Where you are, what you want to build (optional)</label>
        </div>
      </div>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
      {err ? (
        <div className="form-msg err" role="alert">
          {err}
        </div>
      ) : null}
      <div className="form-foot">
        <small>{note || "Links only — no attachments. If it's a fit, you'll hear from a person, not a form."}</small>
        <button className="btn solid" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Submit"} <Arrow />
        </button>
      </div>
    </form>
  );
}
