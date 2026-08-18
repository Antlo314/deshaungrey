"use client";

import { useFormStatus } from "react-dom";
import { useState, type ReactNode } from "react";

export function SubmitButton({ children, className = "abtn solid", pending: pendingLabel = "Saving…" }: { children: ReactNode; className?: string; pending?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** A form that asks before submitting — for deletes and other one-way doors. */
export function ConfirmForm({ action, message, children, className, hidden }: { action: (fd: FormData) => void | Promise<void>; message: string; children: ReactNode; className?: string; hidden?: Record<string, string> }) {
  return (
    <form
      action={action}
      className={className}
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {hidden ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      {children}
    </form>
  );
}

export function Msg({ state }: { state: { error?: string; message?: string } }) {
  if (state.error) return <div className="msg err" role="alert">{state.error}</div>;
  if (state.message) return <div className="msg" role="status">{state.message}</div>;
  return null;
}

/** Label/href pairs, up to `max`. Field names: {prefix}_label_i / {prefix}_href_i */
export function LinksEditor({ prefix = "link", initial, max = 8, labelPlaceholder = "Label", hrefPlaceholder = "https://" }: { prefix?: string; initial: { label: string; href: string }[]; max?: number; labelPlaceholder?: string; hrefPlaceholder?: string }) {
  const [rows, setRows] = useState<{ label: string; href: string }[]>(initial.length ? initial : [{ label: "", href: "" }]);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((r, i) => (
        <div className="links-grid" key={i}>
          <input type="text" className="k" name={`${prefix}_label_${i}`} defaultValue={r.label} placeholder={labelPlaceholder} />
          <input type="text" name={`${prefix}_href_${i}`} defaultValue={r.href} placeholder={hrefPlaceholder} />
        </div>
      ))}
      {rows.length < max ? (
        <button type="button" className="abtn ghost sm" style={{ justifySelf: "start" }} onClick={() => setRows((r) => [...r, { label: "", href: "" }])}>
          + Add link
        </button>
      ) : null}
    </div>
  );
}

export function Stars({ name, initial }: { name: string; initial: number }) {
  const [v, setV] = useState(initial);
  return (
    <div className="stars" role="radiogroup" aria-label="Rating">
      <input type="hidden" name={name} value={v} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={v === n} className={n <= v ? "on" : ""} onClick={() => setV(v === n ? 0 : n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
          ★
        </button>
      ))}
    </div>
  );
}

export function SlugField({ from, initial }: { from: string; initial: string }) {
  const [v, setV] = useState(initial);
  return (
    <label className="l">
      Slug
      <input type="text" name="slug" value={v} onChange={(e) => setV(e.target.value)} placeholder="auto from title" />
      <span className="h">Public URL: /{from}/{v || "…"}</span>
    </label>
  );
}
