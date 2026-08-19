import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CtaBand, PressList } from "@/components/Sections";
import { publicPosts, getSiteSettings } from "@/lib/db/repo";
import { company } from "@/lib/content";
import { Arrow } from "@/components/Icons";
import Link from "next/link";

export const metadata: Metadata = {
  title: "News & Press — MEG Enterprises",
  description: "Announcements from MEG Enterprises, plus the press kit: boilerplate, logo files and press contact.",
};

export default async function PressPage() {
  const [posts, settings] = await Promise.all([publicPosts(), getSiteSettings()]);
  const pressEmail = settings.pressEmail || settings.contactEmail || "";
  return (
    <>
      <PageHero
        kicker="News & press"
        ghost="PRESS"
        crumbs={[{ href: "/press", label: "Press" }]}
        title={
          <>
            From the <em>label.</em>
          </>
        }
        lede="Announcements, milestones and collaborations — and everything a writer needs about MEG Enterprises."
      />
      <section className="sec tight">
        <PressList posts={posts} />
      </section>

      <section className="sec tight spot" id="kit">
        <div className="two-col">
          <div>
            <p className="kicker dot reveal">Press kit</p>
            <h2 className="h2 reveal" style={{ ["--d" as string]: "0.08s" }}>
              Boilerplate & <em>assets.</em>
            </h2>
            <div className="body reveal" style={{ ["--d" as string]: "0.16s", marginTop: 20 }}>
              <p>
                <strong>{company.legal}</strong> — {company.descriptor}.
              </p>
              <p>{company.intro}</p>
              <p>{company.commitment}</p>
              <p>
                <em>{company.tagline}</em>
              </p>
            </div>
          </div>
          <div className="reveal" style={{ ["--d" as string]: "0.2s" }}>
            <ul className="credits">
              <li>
                <span className="n">01</span>
                <span className="t">
                  <a href="/media/brand/logo-full.png" download>
                    Primary lockup — PNG, transparent
                  </a>
                </span>
                <span className="s">Logo</span>
              </li>
              <li>
                <span className="n">02</span>
                <span className="t">
                  <a href="/media/brand/logo-profile.png" download>
                    Profile mark — PNG, transparent
                  </a>
                </span>
                <span className="s">Logo</span>
              </li>
              <li>
                <span className="n">03</span>
                <span className="t">
                  <a href="/media/brand/profile.svg" download>
                    Profile mark — SVG
                  </a>
                </span>
                <span className="s">Vector</span>
              </li>
              <li>
                <span className="n">04</span>
                <span className="t">
                  <a href="/media/brand/logo-wordmark.png" download>
                    Wordmark — PNG, transparent
                  </a>
                </span>
                <span className="s">Logo</span>
              </li>
              <li>
                <span className="n">05</span>
                <span className="t">Founder & artist photography</span>
                <span className="s">On request</span>
              </li>
            </ul>
            <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
              <b className="kicker">Press contact</b>
              {pressEmail ? (
                <a href={`mailto:${pressEmail}`} style={{ fontSize: 16 }}>
                  {pressEmail}
                </a>
              ) : (
                <Link href="/contact?kind=press" className="arrow-link">
                  Press inquiries <Arrow />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
