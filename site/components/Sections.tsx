import Link from "next/link";
import { company, disciplines, legacy, record } from "@/lib/content";
import type { Artist, Post, Release } from "@/lib/db/types";
import { Arrow, ArrowUpRight, DiscIcon } from "./Icons";
import { FounderPortrait } from "./FounderPortrait";

const d = (s: string) => ({ ["--d" as string]: s });

/* ---------- ticker ---------- */
const WORDS = ["Artist Development", "Management", "Release Strategy", "Branding", "Promotion & Radio", "Distribution", "Sync & Placements", "Live & Touring", "Consulting"];
export function Ticker() {
  const list = [...WORDS, ...WORDS];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {list.map((w, i) => (
          <span key={i}>
            {w}
            <i />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- manifesto ---------- */
export function Manifesto() {
  return (
    <section className="sec spot">
      <div className="manifesto">
        <p className="kicker dot reveal">What we believe</p>
        <h2 className="h2 reveal" style={d("0.1s")}>
          Successful artist development requires more than recording great music. It requires <em>vision</em>, preparation, business strategy, creative development, proper positioning — and a team committed to the artist&apos;s <em>long-term growth</em>.
        </h2>
        <div className="orn reveal" style={d("0.25s")}>
          <i />
        </div>
        <p className="sig reveal" style={d("0.3s")}>
          {company.legal} · {company.closing}
        </p>
      </div>
    </section>
  );
}

/* ---------- disciplines ---------- */
export function Disciplines({ compact = false }: { compact?: boolean }) {
  return (
    <section className="sec tight" id="development">
      <div className="sec-head split">
        <div>
          <p className="kicker dot reveal">Development · What we do</p>
          <h2 className="h2 reveal" style={d("0.08s")}>
            The whole picture, <em>not just a track.</em>
          </h2>
        </div>
        <p className="lede reveal" style={d("0.16s")}>
          {company.commitment}
        </p>
      </div>
      <div className="disc">
        {disciplines.map((s, i) => (
          <Link key={s.slug} href={`/services#${s.slug}`} className="disc-item reveal" style={d(`${0.05 * i}s`)}>
            <DiscIcon name={s.icon} className="ico" />
            <span className="n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.short}</p>
            {!compact ? (
              <div className="tags">
                {s.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- roster spotlight ---------- */
export function RosterSpotlight({ artists }: { artists: Artist[] }) {
  const lead = artists.find((a) => a.featured) ?? artists[0];
  return (
    <section className="sec spot" id="roster">
      <div className="sec-head split">
        <div>
          <p className="kicker dot reveal">The roster</p>
          <h2 className="h2 reveal" style={d("0.08s")}>
            Artists we <em>develop.</em>
          </h2>
        </div>
        <p className="lede reveal" style={d("0.16s")}>
          {company.newEra}
        </p>
      </div>
      <div className="roster-grid">
        {lead ? <ArtistCard artist={lead} big /> : null}
        <div className="roster-side">
          <div className="roster-note reveal" style={d("0.1s")}>
            <p className="kicker">Now · a new era</p>
            <h3 className="h3">
              The reintroduction of <em>Dashaun Grey.</em>
            </h3>
            <p>
              Formerly known professionally as Que Williams. His upcoming music represents a new chapter for both the artist and the MEG Enterprises legacy — including the singles “Where Dem Dollars At” and “Show Me” featuring Juiicy 2xs, leading toward his forthcoming solo project, World Of Grey.
            </p>
            <Link href="/releases" className="arrow-link">
              Releases <Arrow />
            </Link>
          </div>
          <div className="roster-slot reveal" style={d("0.2s")}>
            <div>
              <p className="kicker">Development</p>
              <h3 className="h3">
                Your name <em>here.</em>
              </h3>
              <p>We listen to everything. Send links, not attachments. If it&apos;s a fit, a person answers.</p>
              <Link href="/submit" className="btn sm">
                Submit music
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ArtistCard({ artist, big = false }: { artist: Artist; big?: boolean }) {
  const [first, ...rest] = artist.name.split(" ");
  return (
    <article className={`artist-card reveal ${big ? "" : "small"}`}>
      {artist.imageWide || artist.image ? <img src={big ? artist.imageWide || artist.image : artist.image || artist.imageWide} alt={artist.name} loading="lazy" /> : null}
      <div className="tag">
        <span className="live" aria-hidden />
        <span className="kicker">{artist.status === "active" ? "Active roster" : artist.status === "development" ? "In development" : "Alumni"}</span>
      </div>
      <div>
        <h3 className="name">
          {first} <em>{rest.join(" ")}</em>
        </h3>
        <p className="roles">{artist.roles}</p>
        {artist.now?.length ? (
          <div className="now">
            {artist.now.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        ) : null}
        <div className="actions">
          <Link href={`/artists/${artist.slug}`} className="btn solid sm">
            Profile <Arrow />
          </Link>
          {artist.site ? (
            <a href={artist.site} className="btn bone sm" target="_blank" rel="noreferrer">
              Official site <ArrowUpRight />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ---------- track record ---------- */
export function Record({ full = false }: { full?: boolean }) {
  return (
    <section className="sec record" id="record">
      <div className="sec-head">
        <p className="kicker dot reveal">The track record</p>
        <h2 className="h2 reveal" style={d("0.08s")}>
          Milestones, <em>not marketing.</em>
        </h2>
      </div>
      <div className="record-grid">
        {record.headline.map((r, i) => (
          <div key={r.label} className="record-item reveal" style={d(`${0.08 * i}s`)}>
            <b className="metal-text">{r.big}</b>
            <span>{r.label}</span>
            <small>{r.detail}</small>
          </div>
        ))}
      </div>
      {full ? (
        <div className="two-col" style={{ marginTop: 60 }}>
          <div>
            <p className="kicker reveal" style={{ marginBottom: 14 }}>
              Under Dr. Williams&apos; leadership
            </p>
            <p className="body reveal" style={d("0.1s")}>
              MEG Enterprises has contributed to numerous career and project milestones, including Billboard chart recognition, Grammy ballot consideration, award-show performances, the B.B. King Award, magazine features, apparel sponsorships, music distribution opportunities, and song placements for radio and television.
            </p>
            <p className="body reveal" style={{ ...d("0.16s"), marginTop: 18 }}>
              As an independent record label, MEG Enterprises&apos; work extends beyond traditional artist management. The company approaches entertainment through a combination of artist development, project management, branding, marketing strategy, music production coordination, release management, digital distribution, promotional planning, and strategic industry relationships. The company has also collaborated with other entertainment professionals and organizations to expand opportunities for its artists and projects.
            </p>
          </div>
          <ul className="credits">
            {record.credits.map((c, i) => (
              <li key={c.t} className="reveal" style={d(`${0.04 * i}s`)}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span className="t">{c.t}</span>
                <span className="s">{c.s}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="reveal" style={{ marginTop: 40 }}>
          <Link href="/legacy#record" className="arrow-link">
            The full record <Arrow />
          </Link>
        </div>
      )}
    </section>
  );
}

/* ---------- legacy teaser ---------- */
export function LegacyTeaser() {
  return (
    <section className="sec spot" id="legacy">
      <div className="legacy-grid">
        <div className="legacy-portrait reveal">
          <FounderPortrait />
          <div className="cap">
            <b>{company.founder}</b>
            <span>{company.founderRole}</span>
          </div>
        </div>
        <div className="legacy-copy">
          <p className="kicker dot reveal">{legacy.title}</p>
          <h2 className="h2 reveal" style={d("0.08s")}>
            Three decades. <em>One family.</em> A next generation already at the helm.
          </h2>
          <div className="body reveal" style={d("0.16s")}>
            <p>{legacy.paragraphs[0]}</p>
            <p>{legacy.paragraphs[1]}</p>
          </div>
          <blockquote className="legacy-quote reveal" style={d("0.22s")}>
            “{legacy.quote}”
          </blockquote>
          <div className="body reveal" style={d("0.28s")}>
            <p>{legacy.nextGen.body}</p>
          </div>
          <div className="reveal" style={{ ...d("0.34s"), marginTop: 30 }}>
            <Link href="/legacy" className="btn">
              The full story <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- releases ---------- */
export function ReleaseCard({ r, i = 0 }: { r: Release; i?: number }) {
  const live = r.links.filter((l) => l.href);
  return (
    <article className="rel reveal" style={d(`${0.08 * i}s`)}>
      <div className="cover">
        {r.cover ? (
          <img src={r.cover} alt={`${r.title} — ${r.artistName}`} loading="lazy" />
        ) : (
          <div className="soon">
            <div>
              <b>{r.title}</b>
              <span>{r.releaseDate || "Forthcoming"}</span>
            </div>
          </div>
        )}
        <span className={`badge ${r.status === "out" ? "red" : ""}`}>{r.status === "out" ? "Out now" : r.status === "upcoming" ? "Coming" : "Catalog"}</span>
      </div>
      <div className="meta">
        <b>
          {r.title}
          {r.featuring ? <small>{r.featuring}</small> : null}
        </b>
        <span>
          {r.type}
          {r.releaseDate ? ` · ${r.releaseDate}` : ""}
        </span>
      </div>
      <p className="who">{r.artistName}</p>
      {r.blurb ? <p className="who">{r.blurb}</p> : null}
      <div className="links">
        {live.length ? (
          live.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))
        ) : (
          <a className="off">Links coming</a>
        )}
      </div>
    </article>
  );
}
export function ReleasesSection({ releases, all = false }: { releases: Release[]; all?: boolean }) {
  const list = all ? releases : releases.filter((r) => r.featured).slice(0, 3);
  return (
    <section className="sec" id="releases">
      <div className="sec-head split">
        <div>
          <p className="kicker dot reveal">Releases</p>
          <h2 className="h2 reveal" style={d("0.08s")}>
            Independent, <em>on purpose.</em>
          </h2>
        </div>
        {!all ? (
          <div className="reveal" style={{ ...d("0.16s"), justifySelf: "end", marginBottom: 8 }}>
            <Link href="/releases" className="arrow-link">
              Full catalog <Arrow />
            </Link>
          </div>
        ) : null}
      </div>
      {list.length ? (
        <div className="rel-grid">
          {list.map((r, i) => (
            <ReleaseCard key={r.id} r={r} i={i} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <b>Nothing listed yet</b>
          Releases appear here as the owners add them.
        </div>
      )}
    </section>
  );
}

/* ---------- press ---------- */
export function PressList({ posts, limit }: { posts: Post[]; limit?: number }) {
  const list = limit ? posts.slice(0, limit) : posts;
  if (!list.length)
    return (
      <div className="empty">
        <b>No news yet</b>
        Announcements and press appear here.
      </div>
    );
  return (
    <ul className="press-list">
      {list.map((p, i) => (
        <li key={p.id} className="reveal" style={d(`${0.05 * i}s`)}>
          <Link href={`/press/${p.slug}`}>
            <time dateTime={p.publishedAt}>{fmtDate(p.publishedAt)}</time>
            <div>
              {p.kicker ? <p className="kicker" style={{ marginBottom: 8 }}>{p.kicker}</p> : null}
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </div>
            <Arrow className="arr" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
export function PressSection({ posts }: { posts: Post[] }) {
  return (
    <section className="sec tight" id="press">
      <div className="sec-head split">
        <div>
          <p className="kicker dot reveal">News & press</p>
          <h2 className="h2 reveal" style={d("0.08s")}>
            From the <em>label.</em>
          </h2>
        </div>
        <div className="reveal" style={{ ...d("0.16s"), justifySelf: "end", marginBottom: 8 }}>
          <Link href="/press" className="arrow-link">
            All news <Arrow />
          </Link>
        </div>
      </div>
      <PressList posts={posts} limit={3} />
    </section>
  );
}

/* ---------- cta band ---------- */
export function CtaBand() {
  return (
    <section className="cta-band" aria-label="Get in touch">
      <div className="cta-half">
        <span className="ghost" aria-hidden>
          A&R
        </span>
        <p className="kicker dot">Artists</p>
        <h2 className="h2">
          Submit <em>your music.</em>
        </h2>
        <p>Links only. Every submission is heard. If it&apos;s a fit for development, a person reaches out — not a form.</p>
        <Link href="/submit" className="btn solid">
          Submit music <Arrow />
        </Link>
      </div>
      <div className="cta-half alt">
        <span className="ghost" aria-hidden>
          MEG
        </span>
        <p className="kicker dot">Partners · Brands · Press</p>
        <h2 className="h2">
          Work <em>with MEG.</em>
        </h2>
        <p>Booking, partnerships, sponsorships, consulting and press. Three decades of relationships across radio, television, live and brand.</p>
        <Link href="/contact" className="btn">
          Start a conversation <Arrow />
        </Link>
      </div>
    </section>
  );
}

export function fmtDate(iso?: string) {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
