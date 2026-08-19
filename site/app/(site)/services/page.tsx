import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/Sections";
import { DiscIcon, Arrow } from "@/components/Icons";
import { company, disciplines, steps } from "@/lib/content";

export const metadata: Metadata = {
  title: "Artist Development — what MEG Enterprises does",
  description:
    "Artist development, management, release strategy and distribution, branding and marketing, promotion and radio, production coordination, sync placements and consulting — the whole picture, not just a track.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Development · What we do"
        ghost="DEVELOP"
        crumbs={[{ href: "/services", label: "Development" }]}
        title={
          <>
            The whole picture, <em>not just a track.</em>
          </>
        }
        lede={company.belief}
      />

      <section className="sec tight" id="process">
        <div className="sec-head">
          <p className="kicker dot reveal">How the work runs</p>
          <h2 className="h2 reveal" style={{ ["--d" as string]: "0.08s" }}>
            Five verbs. <em>One team.</em>
          </h2>
        </div>
        <div className="process">
          {steps.map((p) => (
            <div key={p.n} className="process-step">
              <div className="n">{p.n}</div>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sec tight" id="disciplines">
        <div className="services-list">
          {disciplines.map((s) => (
            <div key={s.slug} className="svc reveal" id={s.slug}>
              <div className="n">{s.n}</div>
              <div>
                <DiscIcon name={s.icon} className="ico" style={{ width: 30, height: 30, color: "var(--gold)", marginBottom: 16 }} />
                <h3>
                  {s.title}
                  <small>{s.short}</small>
                </h3>
              </div>
              <div>
                <p>{s.body}</p>
                <ul>
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="reveal" style={{ marginTop: 40, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/submit" className="btn solid">
            Submit music <Arrow />
          </Link>
          <Link href="/contact?kind=artist-development" className="btn">
            Ask about development
          </Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
