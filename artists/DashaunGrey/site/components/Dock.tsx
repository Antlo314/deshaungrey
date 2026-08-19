"use client";

import { useActiveSection } from "@/lib/motion";
import { scrollToId } from "./Effects";

const ITEMS = [
  { id: "music", label: "Music" },
  { id: "merch", label: "Merch" },
  { id: "tour", label: "Tour" },
];

/** Mobile-only floating dock (bottom-left). ASH keeps bottom-right. */
export function Dock() {
  const active = useActiveSection(ITEMS.map((i) => i.id));
  return (
    <nav className="dock" aria-label="Quick navigation">
      {ITEMS.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          className={active === i.id ? "active" : ""}
          onClick={(e) => { e.preventDefault(); scrollToId(i.id); }}
        >
          {i.label}
        </a>
      ))}
    </nav>
  );
}
