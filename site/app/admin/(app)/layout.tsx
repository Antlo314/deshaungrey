import { redirect } from "next/navigation";
import { Shell } from "@/components/admin/Shell";
import { getSession } from "@/lib/auth";
import { ephemeral, store } from "@/lib/db";
import { overviewCounts } from "@/lib/db/repo";
import { secretIsWeak } from "@/lib/session-token";

export const dynamic = "force-dynamic";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  let counts = { inqNew: 0, subNew: 0 };
  let dbErr = "";
  try {
    const c = await overviewCounts();
    counts = { inqNew: c.inqNew, subNew: c.subNew };
  } catch (e) {
    dbErr = (e as Error).message;
  }

  const banners: React.ReactNode[] = [];
  if (dbErr) {
    banners.push(
      <div className="adm-banner" key="db">
        <b>Database unreachable.</b> {dbErr} — check <code>DATABASE_URL</code>.
      </div>
    );
  }
  if (ephemeral()) {
    banners.push(
      <div className="adm-banner" key="eph">
        <b>No database connected.</b> This deployment is running on temporary storage — anything you save here will be lost on the next deploy. In Vercel: Storage → Create Database (Neon Postgres) → connect to this project. It sets <code>DATABASE_URL</code> automatically.
      </div>
    );
  }
  if (process.env.NODE_ENV === "production" && secretIsWeak()) {
    banners.push(
      <div className="adm-banner warn" key="secret">
        <b>Set SESSION_SECRET.</b> Sessions are signed with a placeholder. Add a 32+ character <code>SESSION_SECRET</code> in Vercel → Environment Variables.
      </div>
    );
  }
  if (store().backend === "json" && process.env.NODE_ENV !== "production") {
    banners.push(
      <div className="adm-banner warn" key="json">
        <b>Local mode.</b> Data lives in <code>data/meg-db.json</code>. Set <code>DATABASE_URL</code> to use Postgres.
      </div>
    );
  }

  return (
    <Shell user={{ name: session.user.name, email: session.user.email, role: session.user.role }} counts={counts} banner={banners.length ? <>{banners}</> : null}>
      {children}
    </Shell>
  );
}
