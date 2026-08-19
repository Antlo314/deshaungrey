import { Top } from "@/components/admin/Shell";
import { SettingsForm } from "@/components/admin/CompanyForms";
import { store } from "@/lib/db";
import { getSiteSettings, recentAudit } from "@/lib/db/repo";
import { nowMs } from "@/lib/time";

export const metadata = { title: "Site settings" };

const rel = (iso: string) => {
  const m = Math.round((nowMs() - Date.parse(iso)) / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export default async function SettingsPage() {
  const [settings, auditRows, ping] = await Promise.all([getSiteSettings(), recentAudit(40), store().ping()]);
  const env = (k: string) => (process.env[k] ? "set" : "not set");
  return (
    <>
      <Top title="Site settings" sub="megentllc.com" />
      <div className="adm-body">
        <div className="grid2">
          <div className="card">
            <div className="head">
              <h2>Public site</h2>
            </div>
            <div className="body">
              <SettingsForm settings={settings} />
            </div>
          </div>
          <div style={{ display: "grid", gap: 20 }}>
            <div className="card">
              <div className="head">
                <h2>Environment</h2>
              </div>
              <div className="body" style={{ fontSize: 13, display: "grid", gap: 8 }}>
                <div>
                  <span className={`status-dot ${ping.ok ? "ok" : "bad"}`} />
                  Database ({store().backend}) — <span style={{ color: "var(--mute)" }}>{ping.detail}</span>
                </div>
                <div>
                  <span className={`status-dot ${process.env.SESSION_SECRET ? "ok" : ""}`} />
                  SESSION_SECRET — {env("SESSION_SECRET")}
                </div>
                <div>
                  <span className={`status-dot ${process.env.NOTIFY_WEBHOOK ? "ok" : ""}`} />
                  NOTIFY_WEBHOOK — {env("NOTIFY_WEBHOOK")}
                </div>
                <div>
                  <span className={`status-dot ${process.env.NEXT_PUBLIC_SITE_URL ? "ok" : ""}`} />
                  NEXT_PUBLIC_SITE_URL — {process.env.NEXT_PUBLIC_SITE_URL || "default (megentllc.com in production)"}
                </div>
                <div>
                  <span className={`status-dot ${process.env.NEXT_PUBLIC_DASHAUN_URL ? "ok" : ""}`} />
                  NEXT_PUBLIC_DASHAUN_URL — {process.env.NEXT_PUBLIC_DASHAUN_URL || "default (dashaungrey.com)"}
                </div>
                <p style={{ color: "var(--mute)", marginTop: 6, lineHeight: 1.6 }}>
                  Change these in Vercel → Project → Settings → Environment Variables, then redeploy. Media (portraits, covers, hero video) goes in <code>public/media</code> in the repo.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="head">
                <h2>Audit log</h2>
              </div>
              <div className="body">
                {auditRows.length ? (
                  <ul className="audit">
                    {auditRows.map((a) => (
                      <li key={a.id}>
                        <time>{rel(a.createdAt)}</time>
                        <span>
                          <b>{a.actor}</b> {a.action}
                          {a.target ? ` — ${a.target}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-adm">Nothing yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
