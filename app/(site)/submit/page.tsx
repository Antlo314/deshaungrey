import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SubmitForm } from "@/components/Forms";
import { getSiteSettings } from "@/lib/db/repo";
import { steps } from "@/lib/content";

export const metadata: Metadata = {
  title: "Submit your music — A&R at MEG Enterprises",
  description: "Send MEG Enterprises links to your music. Every submission is heard by a person. If it's a fit for artist development, we reach out directly.",
};

export default async function SubmitPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero
        kicker="A&R · Submissions"
        ghost="A&R"
        crumbs={[{ href: "/submit", label: "Submit" }]}
        title={
          <>
            Submit <em>your music.</em>
          </>
        }
        lede="MEG develops artists — vision, preparation, business strategy, positioning and a team committed to your long-term growth. Send us what you've got."
      />
      <section className="sec tight">
        <div className="contact-grid">
          <aside className="contact-side">
            <div className="block reveal">
              <b>What we&apos;re listening for</b>
              <p>Voice, writing, work ethic and a point of view. Polish is optional; a real record is not.</p>
            </div>
            <div className="block reveal" style={{ ["--d" as string]: "0.08s" }}>
              <b>What happens next</b>
              <p>
                {steps.map((p) => p.title).join(" → ")}. Every submission is heard. If it&apos;s a fit for development, a person reaches out — not an autoresponder.
              </p>
            </div>
            <div className="block reveal" style={{ ["--d" as string]: "0.14s" }}>
              <b>Rules</b>
              <p>Links only, no attachments. Don&apos;t send unfinished demos twice. Don&apos;t send someone else&apos;s music.</p>
            </div>
          </aside>
          <div className="reveal" style={{ ["--d" as string]: "0.1s" }}>
            <SubmitForm open={settings.submissionsOpen !== false} note={settings.submissionsNote} />
          </div>
        </div>
      </section>
    </>
  );
}
