import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/Forms";
import { getSiteSettings } from "@/lib/db/repo";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact — work with MEG Enterprises",
  description: "Booking, partnerships, sponsorships, consulting and press inquiries for MEG Enterprises and its artists.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const [{ kind }, settings] = await Promise.all([searchParams, getSiteSettings()]);
  const contactEmail = settings.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const live = settings.socials.filter((s) => s.href);
  return (
    <>
      <PageHero
        kicker="Contact · Work with MEG"
        ghost="MEG"
        crumbs={[{ href: "/contact", label: "Contact" }]}
        title={
          <>
            Start a <em>conversation.</em>
          </>
        }
        lede="Booking, partnerships, sponsorships, consulting, press. Three decades of relationships across radio, television, live and brand — and a team that answers."
      />
      <section className="sec tight">
        <div className="contact-grid">
          <aside className="contact-side">
            <div className="block reveal">
              <b>{company.legal}</b>
              <p>{company.descriptor}</p>
              {settings.city ? <p style={{ color: "var(--mute)" }}>{settings.city}</p> : null}
            </div>
            {contactEmail ? (
              <div className="block reveal" style={{ ["--d" as string]: "0.06s" }}>
                <b>General</b>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </div>
            ) : null}
            {settings.bookingEmail ? (
              <div className="block reveal" style={{ ["--d" as string]: "0.1s" }}>
                <b>Booking</b>
                <a href={`mailto:${settings.bookingEmail}`}>{settings.bookingEmail}</a>
              </div>
            ) : null}
            {settings.pressEmail ? (
              <div className="block reveal" style={{ ["--d" as string]: "0.14s" }}>
                <b>Press</b>
                <a href={`mailto:${settings.pressEmail}`}>{settings.pressEmail}</a>
              </div>
            ) : null}
            {settings.phone ? (
              <div className="block reveal" style={{ ["--d" as string]: "0.16s" }}>
                <b>Phone</b>
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>{settings.phone}</a>
              </div>
            ) : null}
            {live.length ? (
              <div className="block reveal" style={{ ["--d" as string]: "0.2s" }}>
                <b>Follow</b>
                <div className="socials">
                  {live.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="block reveal" style={{ ["--d" as string]: "0.24s" }}>
              <b>Artists</b>
              <p>
                Looking for development? Use the <a href="/submit" style={{ color: "var(--gold)" }}>submission form</a> so your links land in the right place.
              </p>
            </div>
          </aside>
          <div className="reveal" style={{ ["--d" as string]: "0.1s" }}>
            <InquiryForm initialKind={kind} />
          </div>
        </div>
      </section>
    </>
  );
}
