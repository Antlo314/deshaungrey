import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { CtaBand, ReleaseCard } from "@/components/Sections";
import { Arrow, ArrowUpRight } from "@/components/Icons";
import { publicArtistBySlug, publicReleases } from "@/lib/db/repo";
import { siteUrl } from "@/lib/content";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await publicArtistBySlug(slug);
  if (!a) return { title: "Artist not found" };
  return {
    title: `${a.name} — ${a.roles.split("·")[0].trim()} · MEG Enterprises`,
    description: a.short,
    openGraph: { title: a.name, description: a.short, images: a.image ? [{ url: a.image }] : undefined },
  };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const a = await publicArtistBySlug(slug);
  if (!a) notFound();
  const releases = (await publicReleases()).filter((r) => r.artistId === a.id || r.artistName === a.name);
  const [first, ...rest] = a.name.split(" ");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: a.name,
    alternateName: a.formerly,
    url: `${siteUrl()}/artists/${a.slug}`,
    image: a.image ? `${siteUrl()}${a.image}` : undefined,
    recordLabel: { "@type": "Organization", name: "MEG Enterprises, LLC" },
    sameAs: a.links.filter((l) => l.href).map((l) => l.href),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        kicker={a.status === "active" ? "Active roster" : a.status === "development" ? "In development" : "Alumni"}
        ghost={first.toUpperCase()}
        crumbs={[
          { href: "/artists", label: "Artists" },
          { href: `/artists/${a.slug}`, label: a.name },
        ]}
        title={
          <>
            {first} <em>{rest.join(" ")}</em>
          </>
        }
        lede={a.short}
      />

      <section className="sec tight">
        <div className="profile">
          <div className="reveal">
            <div className="portrait">{a.image ? <img src={a.image} alt={a.name} /> : null}</div>
          </div>
          <div>
            <p className="kicker dot reveal">About</p>
            <div className="body reveal" style={{ ["--d" as string]: "0.1s", marginTop: 16 }}>
              {a.bio.split(/\n\s*\n/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {a.quote ? (
              <blockquote className="legacy-quote reveal" style={{ ["--d" as string]: "0.16s" }}>
                “{a.quote}”
              </blockquote>
            ) : null}
            <div className="facts reveal" style={{ ["--d" as string]: "0.2s" }}>
              <div>
                <b>Roles</b>
                <span>{a.roles}</span>
              </div>
              {a.hometown ? (
                <div>
                  <b>Hometown</b>
                  <span>{a.hometown}</span>
                </div>
              ) : null}
              {a.formerly ? (
                <div>
                  <b>Formerly known as</b>
                  <span>{a.formerly}</span>
                </div>
              ) : null}
              <div>
                <b>Label</b>
                <span>MEG Enterprises, LLC</span>
              </div>
            </div>
            {a.now?.length ? (
              <div className="reveal" style={{ ["--d" as string]: "0.24s" }}>
                <b className="kicker">Now</b>
                <div className="chips" style={{ marginTop: 10 }}>
                  {a.now.map((n) => (
                    <span key={n} className="chip" style={{ cursor: "default" }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {a.links.filter((l) => l.href).length ? (
              <div className="links reveal" style={{ ["--d" as string]: "0.28s", marginTop: 26 }}>
                {a.links
                  .filter((l) => l.href)
                  .map((l) => (
                    <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                      {l.label} ↗
                    </a>
                  ))}
              </div>
            ) : null}
            <div className="actions reveal" style={{ ["--d" as string]: "0.32s" }}>
              {a.site ? (
                <a href={a.site} className="btn solid" target="_blank" rel="noreferrer">
                  Enter the official site <ArrowUpRight />
                </a>
              ) : null}
              <Link href="/contact?kind=booking" className="btn">
                Book {first} <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {releases.length ? (
        <section className="sec tight" id="music">
          <div className="sec-head">
            <p className="kicker dot reveal">Music</p>
            <h2 className="h2 reveal" style={{ ["--d" as string]: "0.08s" }}>
              Releases by <em>{a.name}.</em>
            </h2>
          </div>
          <div className="rel-grid">
            {releases.map((r, i) => (
              <ReleaseCard key={r.id} r={r} i={i} />
            ))}
          </div>
        </section>
      ) : null}
      <CtaBand />
    </>
  );
}
