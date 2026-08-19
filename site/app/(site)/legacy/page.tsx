import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand, Record } from "@/components/Sections";
import { FounderPortrait } from "@/components/FounderPortrait";
import { Arrow } from "@/components/Icons";
import { company, legacy } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Legacy — Dr. Glenda S. Williams & the story of MEG Enterprises",
  description:
    "A native of South Carolina whose connection to music began at seven, Dr. Glenda S. Williams built MEG Enterprises on three decades of music, television, radio, live entertainment and business — and passed the reins to the next generation in 2019.",
};

const d = (s: string) => ({ ["--d" as string]: s });

export default function LegacyPage() {
  return (
    <>
      <PageHero
        kicker="The legacy · Since the beginning"
        ghost="LEGACY"
        title={
          <>
            A legacy <em>built in music.</em>
          </>
        }
        lede={company.intro}
      />

      <section className="sec tight" id="founder">
        <div className="legacy-grid">
          <div className="legacy-portrait reveal">
            <FounderPortrait />
            <div className="cap">
              <b>{company.founder}</b>
              <span>{company.founderRole}</span>
            </div>
            <div style={{ marginTop: 22, display: "grid", gap: 8, color: "var(--mute)", fontSize: 13.5, lineHeight: 1.6 }}>
              <span>South Carolina native · Singer & songwriter · Artist manager · Contract negotiator · Regional concert promoter · Tour coordinator · Project manager · Entertainment consultant</span>
              <span>Markets: {company.markets.join(" · ")} and beyond</span>
            </div>
          </div>
          <div className="legacy-copy">
            <p className="kicker dot reveal">The founder</p>
            <h2 className="h2 reveal" style={d("0.08s")}>
              From a church choir at seven to <em>three decades</em> of building careers.
            </h2>
            <div className="body reveal" style={d("0.16s")}>
              {legacy.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <blockquote className="legacy-quote reveal" style={d("0.2s")}>
              “{legacy.quote}”
            </blockquote>
            <p className="kicker dot reveal" style={{ marginTop: 40 }}>
              {legacy.nextGen.title} · {company.handoffYear}
            </p>
            <h3 className="h3 reveal" style={{ ...d("0.08s"), marginTop: 14 }}>
              More than a change in leadership — <em>the foundation itself.</em>
            </h3>
            <div className="body reveal" style={{ ...d("0.16s"), marginTop: 16 }}>
              <p>{legacy.nextGen.body}</p>
              <p>{company.newEra}</p>
            </div>
            <div className="reveal" style={{ ...d("0.2s"), marginTop: 26 }}>
              <Link href="/artists/dashaun-grey" className="arrow-link">
                Meet Dashaun Grey <Arrow />
              </Link>
            </div>

            <ol className="timeline">
              {legacy.timeline.map((t, i) => (
                <li key={t.when + i} className={`reveal ${t.now ? "now" : ""}`} style={d(`${0.05 * i}s`)}>
                  <div className="when">
                    {t.when}
                    <small>{t.sub}</small>
                  </div>
                  <div className="what">{t.what}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Record full />

      <section className="sec tight spot" id="values">
        <div className="manifesto">
          <p className="kicker dot reveal">More than music</p>
          <h2 className="h2 reveal" style={d("0.08s")}>
            {company.today}
          </h2>
          <div className="orn reveal" style={d("0.2s")}>
            <i />
          </div>
          <p className="sig reveal" style={d("0.26s")}>
            {company.tagline}
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
