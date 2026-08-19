import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CtaBand, ReleaseCard } from "@/components/Sections";
import { publicReleases, publicEvents } from "@/lib/db/repo";
import { fmtDate } from "@/components/Sections";
import { nowMs } from "@/lib/time";

export const metadata: Metadata = {
  title: "Releases — music from MEG Enterprises",
  description: "Show Me ft. Juiicy 2xs, Where Dem Dollars At, and the forthcoming World Of Grey — released independently by MEG Enterprises.",
};

export default async function ReleasesPage() {
  const [releases, events] = await Promise.all([publicReleases(), publicEvents()]);
  const out = releases.filter((r) => r.status === "out");
  const upcoming = releases.filter((r) => r.status === "upcoming");
  const catalog = releases.filter((r) => r.status === "catalog");
  const nowT = nowMs();
  const future = events.filter((e) => Date.parse(e.startsAt) > nowT - 86400000);
  return (
    <>
      <PageHero
        kicker="Releases"
        ghost="MUSIC"
        crumbs={[{ href: "/releases", label: "Releases" }]}
        title={
          <>
            Independent, <em>on purpose.</em>
          </>
        }
        lede="Every release is a campaign: timing, sequencing, digital distribution, promotion and placement — coordinated so the music lands with intention."
      />
      {upcoming.length ? (
        <section className="sec tight" id="upcoming">
          <p className="kicker dot reveal" style={{ marginBottom: 24 }}>
            Forthcoming
          </p>
          <div className="rel-grid">
            {upcoming.map((r, i) => (
              <ReleaseCard key={r.id} r={r} i={i} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="sec tight" id="out">
        <p className="kicker dot reveal" style={{ marginBottom: 24 }}>
          Out now
        </p>
        {out.length ? (
          <div className="rel-grid">
            {out.map((r, i) => (
              <ReleaseCard key={r.id} r={r} i={i} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <b>Nothing out yet</b>
          </div>
        )}
      </section>
      {catalog.length ? (
        <section className="sec tight" id="catalog">
          <p className="kicker dot reveal" style={{ marginBottom: 24 }}>
            Catalog
          </p>
          <div className="rel-grid">
            {catalog.map((r, i) => (
              <ReleaseCard key={r.id} r={r} i={i} />
            ))}
          </div>
        </section>
      ) : null}
      {future.length ? (
        <section className="sec tight" id="dates">
          <p className="kicker dot reveal" style={{ marginBottom: 24 }}>
            Dates & appearances
          </p>
          <ul className="credits">
            {future.map((e) => (
              <li key={e.id} className="reveal">
                <span className="n">{fmtDate(e.startsAt)}</span>
                <span className="t">
                  {e.title}
                  {e.venue ? ` — ${e.venue}` : ""}
                  {e.city ? `, ${e.city}` : ""}
                </span>
                <span className="s">{e.url ? <a href={e.url} target="_blank" rel="noreferrer">Details ↗</a> : e.kind}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <CtaBand />
    </>
  );
}
