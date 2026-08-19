"use client";

import { useState } from "react";
import { Profile } from "./Mark";

export const FOUNDER_PORTRAIT = "/media/legacy/founder.jpg";

/**
 * Founder portrait slot. Drop the real photograph at public/media/legacy/founder.jpg
 * (4:5) and it replaces the mark automatically — until then the traced profile
 * stands in. Never generate her face; see ASSET-PROMPTS.md §3.
 */
export function FounderPortrait({ alt = "Dr. Glenda S. Williams" }: { alt?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [dead, setDead] = useState(false);
  return (
    <div className="frame">
      {!loaded ? (
        <div className="ph" aria-hidden>
          <Profile />
        </div>
      ) : null}
      {!dead ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={FOUNDER_PORTRAIT} alt={alt} onLoad={() => setLoaded(true)} onError={() => setDead(true)} style={{ opacity: loaded ? 1 : 0, transition: "opacity 1.2s var(--ease-out)", position: "absolute", inset: 0 }} />
      ) : null}
    </div>
  );
}
