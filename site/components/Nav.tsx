"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/content";
import { Lockup } from "./Mark";

type Social = { label: string; href: string };

export function Nav({ socials, contactEmail }: { socials: Social[]; contactEmail?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname();

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

  // close on route change (state adjusted during render — no effect needed) + esc; lock scroll while open
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) {
      document.documentElement.classList.remove("lenis-stopped");
      return;
    }
    document.documentElement.classList.add("lenis-stopped");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [open]);

  const live = socials.filter((s) => s.href);

  return (
    <>
      <header className={`nav ${scrolled ? "scrolled" : ""} ${hidden ? "hidden" : ""} ${open ? "menu-open" : ""}`}>
        <Link className="nav-mark" href="/" aria-label="MEG Enterprises — home">
          <Lockup />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {nav.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href || pathname.startsWith(l.href + "/") ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-right">
          <Link href="/submit" className="btn sm">
            Submit music
          </Link>
          <button type="button" className={`nav-burger ${open ? "open" : ""}`} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`menu ${open ? "open" : ""}`} aria-hidden={!open} data-lenis-prevent>
        <nav className="menu-links" aria-label="Menu">
          {[{ href: "/", label: "Home", sub: "MEG Enterprises" }, ...nav, { href: "/submit", label: "Submit music", sub: "A&R" }].map((l, i) => (
            <Link key={l.href} href={l.href} style={{ ["--i" as string]: i }} tabIndex={open ? 0 : -1}>
              <span>{l.label}</span>
              <small>{l.sub}</small>
            </Link>
          ))}
        </nav>
        <div className="menu-side">
          <div>
            <p className="kicker">MEG Enterprises, LLC</p>
            <p>
              Independent Record Label · Music · Artist Development · Management · Entertainment.
              <br />
              Independent Music. Developing Artists. Building Brands. Creating Legacy.
            </p>
          </div>
          {contactEmail ? (
            <div>
              <p className="kicker">Reach us</p>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          ) : null}
          {live.length ? (
            <div className="socials">
              {live.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
