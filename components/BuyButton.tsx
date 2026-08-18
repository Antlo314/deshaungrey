"use client";

import { useState } from "react";

export function BuyButton({ sku, label, className = "btn solid" }: { sku: string; label: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; reason?: string };
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.reason === "stripe_unwired") {
        document.getElementById("tour")?.scrollIntoView({ behavior: "smooth" });
        setNote("Checkout wires next. Jump the tour list.");
        return;
      }
      setNote("Could not start checkout.");
    } catch {
      setNote("Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span>
      <button className={className} onClick={go} disabled={busy}>
        {busy ? "…" : label}
      </button>
      {note ? (
        <span style={{ display: "block", marginTop: 8, color: "var(--gold)", fontSize: 11, letterSpacing: "0.12em" }}>
          {note}
        </span>
      ) : null}
    </span>
  );
}
