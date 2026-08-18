"use client";

import { useEffect, useRef, useState } from "react";
import { dsps } from "@/lib/catalog";
import { useActiveSection } from "@/lib/motion";
import { Icon } from "./Icons";
import { scrollToId } from "./Effects";

const LINKS = [
  { id: "music", label: "Music" },
  { id: "album", label: "Album" },
  { id: "about", label: "About" },
  { id: "label", label: "Label" },
  { id: "merch", label: "Merch" },
  { id: "tour", label: "Tour" },
];
const IDS = LINKS.map((l) => l.id);

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(IDS);
  const lastY = useRef(0);
  const menu = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 40);
        const goingDown = y > lastY.current + 4;
        const goingUp = y < lastY.current - 4;
        if (y > 320 && goingDown) setHidden(true);
        else if (goingUp || y <= 320) setHidden(false);
        lastY.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!menu.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function go(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    scrollToId(id);
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""} ${hidden ? "hidden" : ""}`}>
      <a className="nav-mark" href="#top" onClick={(e) => go(e, "top")}>
        <span className="mono">G</span>
        Dashaun Grey
      </a>
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className={active === l.id ? "active" : ""}
            onClick={(e) => go(e, l.id)}
          >
            {l.label}
          </a>
        ))}
      </nav>
      <div className="nav-right">
        <div className={`nav-listen ${open ? "open" : ""}`} ref={menu}>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu">
            <span className="eq" aria-hidden>
              <i /><i /><i />
            </span>
            Listen
          </button>
          <div className="nav-menu" role="menu">
            <div className="head">Stream Dashaun Grey</div>
            {dsps.map((d) => {
              const I = Icon[d.id];
              return (
                <a key={d.id} href={d.href} role="menuitem" target={d.href === "#" ? undefined : "_blank"} rel="noreferrer">
                  <I />
                  {d.label}
                </a>
              );
            })}
          </div>
        </div>
        <a className="nav-ash" href="#ash" onClick={(e) => { e.preventDefault(); document.getElementById("ash-orb")?.click(); }}>
          <i aria-hidden />
          Talk to Ash
        </a>
      </div>
    </header>
  );
}
