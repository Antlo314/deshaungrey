import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PressList, fmtDate } from "@/components/Sections";
import { Arrow } from "@/components/Icons";
import { publicPostBySlug, publicPosts } from "@/lib/db/repo";
import { siteUrl } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await publicPostBySlug(slug);
  if (!p) return { title: "Not found" };
  return { title: p.title, description: p.excerpt, openGraph: { title: p.title, description: p.excerpt, type: "article", publishedTime: p.publishedAt } };
}

/** Body format: paragraphs separated by blank lines; "## " starts a heading. */
function renderBody(body: string) {
  return body.split(/\n\s*\n/).map((block, i) => {
    const t = block.trim();
    if (!t) return null;
    if (t.startsWith("## ")) return <h3 key={i}>{t.slice(3)}</h3>;
    return <p key={i}>{t}</p>;
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = await publicPostBySlug(slug);
  if (!p) notFound();
  const more = (await publicPosts()).filter((x) => x.id !== p.id).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.publishedAt,
    dateModified: p.updatedAt,
    author: { "@type": "Organization", name: p.authorName || "MEG Enterprises" },
    publisher: { "@type": "Organization", name: "MEG Enterprises, LLC", logo: { "@type": "ImageObject", url: `${siteUrl()}/media/brand/logo-full.png` } },
    mainEntityOfPage: `${siteUrl()}/press/${p.slug}`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="page-hero">
        <div className="article">
          <nav className="crumbs hero-fade" aria-label="Breadcrumb" style={{ ["--d" as string]: "0.1s" }}>
            <Link href="/">MEG</Link>
            <i />
            <Link href="/press">Press</Link>
          </nav>
          {p.kicker ? (
            <p className="kicker dot hero-fade" style={{ ["--d" as string]: "0.15s" }}>
              {p.kicker}
            </p>
          ) : null}
          <h1 className="h2 hero-fade" style={{ ["--d" as string]: "0.25s", marginTop: 18 }}>
            {p.title}
          </h1>
          <time className="kicker hero-fade" dateTime={p.publishedAt} style={{ ["--d" as string]: "0.35s", display: "block", marginTop: 22, color: "var(--mute)" }}>
            {fmtDate(p.publishedAt)} · {p.authorName || "MEG Enterprises"}
          </time>
          <div className="body hero-fade" style={{ ["--d" as string]: "0.45s", marginTop: 34, fontSize: 17 }}>
            {renderBody(p.body)}
          </div>
          {p.image ? (
            <div className="reveal-img reveal" style={{ marginTop: 34 }}>
              <img src={p.image} alt="" />
            </div>
          ) : null}
          <div style={{ marginTop: 40 }}>
            <Link href="/press" className="arrow-link">
              All news <Arrow />
            </Link>
          </div>
        </div>
      </section>
      {more.length ? (
        <section className="sec tight">
          <p className="kicker dot reveal" style={{ marginBottom: 20 }}>
            More from the label
          </p>
          <PressList posts={more} />
        </section>
      ) : null}
      <CtaBand />
    </>
  );
}
