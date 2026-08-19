import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ArtistCard, CtaBand } from "@/components/Sections";
import { publicArtists } from "@/lib/db/repo";

export const metadata: Metadata = {
  title: "Artists — the MEG Enterprises roster",
  description: "The artists MEG Enterprises develops, manages and releases independently — led by the reintroduction of Dashaun Grey.",
};

export default async function ArtistsPage() {
  const artists = await publicArtists();
  const active = artists.filter((a) => a.status === "active");
  const dev = artists.filter((a) => a.status === "development");
  const alumni = artists.filter((a) => a.status === "alumni");
  return (
    <>
      <PageHero
        kicker="The roster"
        ghost="ROSTER"
        crumbs={[{ href: "/artists", label: "Artists" }]}
        title={
          <>
            Artists we <em>develop.</em>
          </>
        }
        lede="MEG gives artists an environment that supports creative development, professional growth, strategic release planning, branding, promotion and long-term career development — while keeping an entrepreneurial approach to the business of music."
      />
      <section className="sec tight">
        {active.length ? (
          <div className="roster-grid" style={{ marginBottom: 40 }}>
            {active.map((a, i) => (
              <div key={a.id} style={{ gridColumn: active.length === 1 ? "span 12" : "span 6", display: "grid" }}>
                <ArtistCard artist={a} big={i === 0} />
              </div>
            ))}
          </div>
        ) : null}
        {dev.length ? (
          <>
            <p className="kicker dot" style={{ margin: "40px 0 20px" }}>
              In development
            </p>
            <div className="roster-grid">
              {dev.map((a) => (
                <div key={a.id} style={{ gridColumn: "span 6", display: "grid" }}>
                  <ArtistCard artist={a} />
                </div>
              ))}
            </div>
          </>
        ) : null}
        {alumni.length ? (
          <>
            <p className="kicker dot" style={{ margin: "40px 0 20px" }}>
              Alumni
            </p>
            <ul className="credits">
              {alumni.map((a, i) => (
                <li key={a.id}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t">
                    <Link href={`/artists/${a.slug}`}>{a.name}</Link>
                  </span>
                  <span className="s">{a.roles}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <div className="roster-slot reveal" style={{ marginTop: 40, minHeight: 200 }}>
          <div>
            <p className="kicker">Development</p>
            <h3 className="h3">
              Your name <em>here.</em>
            </h3>
            <p>Send links, not attachments. Every submission is heard.</p>
            <Link href="/submit" className="btn sm">
              Submit music
            </Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
