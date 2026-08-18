"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Lockup } from "@/components/Mark";
import { logoutAction } from "@/lib/actions/auth";

export type Counts = { inqNew: number; subNew: number };
type User = { name: string; email: string; role: string };

const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard" }] },
  {
    group: "Inbound",
    items: [
      { href: "/admin/inbox", label: "Inbox", count: "inqNew" as const },
      { href: "/admin/submissions", label: "Submissions", count: "subNew" as const },
    ],
  },
  {
    group: "Catalog",
    items: [
      { href: "/admin/roster", label: "Roster" },
      { href: "/admin/releases", label: "Releases" },
      { href: "/admin/events", label: "Events & dates" },
      { href: "/admin/press", label: "News & press" },
    ],
  },
  {
    group: "Company",
    items: [
      { href: "/admin/team", label: "Team" },
      { href: "/admin/settings", label: "Site settings" },
    ],
  },
];

const MenuCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });

export function Shell({ user, counts, banner, children }: { user: User; counts: Counts; banner?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  return (
    <MenuCtx.Provider value={{ open, setOpen }}>
      <div className={`adm ${open ? "side-open" : ""}`}>
        <aside className="adm-side">
          <Link href="/admin" className="lockup" aria-label="MEG dashboard" onClick={() => setOpen(false)}>
            <Lockup />
          </Link>
          {NAV.map((g) => (
            <div className="group" key={g.group}>
              <p className="kicker">{g.group}</p>
              <nav className="adm-nav">
                {g.items.map((it) => {
                  const n = "count" in it && it.count ? counts[it.count] : 0;
                  return (
                    <Link key={it.href} href={it.href} className={isActive(it.href) ? "active" : ""} onClick={() => setOpen(false)}>
                      {it.label}
                      {n ? <span className="n">{n}</span> : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          <div className="foot">
            <div className="who">
              <i>{(user.name || user.email).slice(0, 1).toUpperCase()}</i>
              <div>
                <b>{user.name}</b>
                <small>{user.role}</small>
              </div>
            </div>
            <a href="/" target="_blank" rel="noreferrer">
              View public site ↗
            </a>
            <form action={logoutAction}>
              <button type="submit">Sign out</button>
            </form>
          </div>
        </aside>
        <div className="adm-main">
          {banner}
          {children}
        </div>
        {open ? <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.5)" }} aria-hidden /> : null}
      </div>
    </MenuCtx.Provider>
  );
}

/** Page header inside the shell. */
export function Top({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  const { open, setOpen } = useContext(MenuCtx);
  return (
    <header className="adm-top">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="button" className="abtn ghost sm adm-menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
          ☰
        </button>
        <h1>
          {title}
          {sub ? <small>{sub}</small> : null}
        </h1>
      </div>
      <div className="actions">{actions}</div>
    </header>
  );
}
