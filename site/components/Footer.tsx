"use client";

import Link from "next/link";
import { company, nav } from "@/lib/content";
import { Lockup } from "./Mark";
import { Arrow } from "./Icons";

type Social = { label: string; href: string };
const YEAR = new Date().getFullYear();

export function Footer({ socials, contactEmail, city }: { socials: Social[]; contactEmail?: string; city?: string }) {
  const live = socials.filter((s) => s.href);
  return (
    <footer className="footer">
      <div className="footer-ghost" aria-hidden>
        M<i>.</i>E<i>.</i>G
      </div>
      <div className="footer-grid">
        <div className="brand">
          <Link href="/" className="mark" aria-label="MEG Enterprises">
            <Lockup />
          </Link>
          <p>{company.descriptor}</p>
          <p className="gold" style={{ fontFamily: "var(--display)", fontSize: 18, fontStyle: "italic", marginTop: 12 }}>
            {company.tagline}
          </p>
        </div>
        <div>
          <p className="kicker">Company</p>
          <ul>
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/submit">Submit music</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="kicker">Roster</p>
          <ul>
            <li>
              <Link href="/artists/dashaun-grey">Dashaun Grey</Link>
            </li>
            <li>
              <Link href="/releases">World of Grey</Link>
            </li>
            <li>
              <Link href="/releases">Releases</Link>
            </li>
            <li>
              <Link href="/artists">The roster</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="kicker">Connect</p>
          <ul>
            {contactEmail ? (
              <li>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </li>
            ) : (
              <li>
                <Link href="/contact">Work with MEG</Link>
              </li>
            )}
            {city ? <li style={{ color: "var(--mute)", fontSize: 13 }}>{city}</li> : null}
            {live.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/press#kit">Press kit</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {YEAR} {company.legal}. All rights reserved.</span>
        <span>{company.closing}</span>
        <a
          href="#top"
          className="totop"
          onClick={(e) => {
            e.preventDefault();
            if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 });
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Back to top <Arrow />
        </a>
      </div>
    </footer>
  );
}
