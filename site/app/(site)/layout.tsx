import { Effects } from "@/components/Effects";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Preloader } from "@/components/Preloader";
import { AshWidget } from "@/components/AshWidget";
import { getSiteSettings } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const contactEmail = settings.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const announce = settings.announcement?.trim();
  return (
    <div className={announce ? "has-announce" : ""} id="top">
      <Preloader />
      <Effects />
      {announce ? (
        <div className="announce" role="status">
          {settings.announcementHref ? <a href={settings.announcementHref}>{announce}</a> : announce}
        </div>
      ) : null}
      <Nav socials={settings.socials} contactEmail={contactEmail} />
      <main>{children}</main>
      <AshWidget />
      <Footer socials={settings.socials} contactEmail={contactEmail} city={settings.city} />
    </div>
  );
}
