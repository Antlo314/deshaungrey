import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({
  kicker,
  title,
  lede,
  ghost,
  crumbs,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  ghost?: string;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      {ghost ? (
        <span className="ghost" aria-hidden>
          {ghost}
        </span>
      ) : null}
      {crumbs?.length ? (
        <nav className="crumbs hero-fade" aria-label="Breadcrumb" style={{ ["--d" as string]: "0.1s" }}>
          <Link href="/">MEG</Link>
          {crumbs.map((c) => (
            <span key={c.href} style={{ display: "contents" }}>
              <i />
              <Link href={c.href}>{c.label}</Link>
            </span>
          ))}
        </nav>
      ) : null}
      <p className="kicker dot hero-fade" style={{ ["--d" as string]: "0.15s" }}>
        {kicker}
      </p>
      <h1 className="hero-fade" style={{ ["--d" as string]: "0.25s" }}>
        {title}
      </h1>
      {lede ? (
        <p className="lede hero-fade" style={{ ["--d" as string]: "0.4s" }}>
          {lede}
        </p>
      ) : null}
      {children}
    </section>
  );
}
