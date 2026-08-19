import Link from "next/link";
import { Top } from "@/components/admin/Shell";
import { fmtDate } from "@/components/Sections";
import { getSession } from "@/lib/auth";
import { store } from "@/lib/db";
import { allEvents, listInquiries, listSubmissions, overviewCounts, publicReleases, recentAudit } from "@/lib/db/repo";
import { nowDate, nowMs } from "@/lib/time";

export const metadata = { title: "Dashboard" };

const rel = (iso: string) => {
  const d = nowMs() - Date.parse(iso);
  const m = Math.round(d / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export default async function Overview() {
  const session = (await getSession())!;
  const [counts, inq, subs, events, releases, auditRows, ping] = await Promise.all([
    overviewCounts(),
    listInquiries({ limit: 6 }),
    listSubmissions({ limit: 6 }),
    allEvents(),
    publicReleases(),
    recentAudit(8),
    store().ping(),
  ]);
  const nowT = nowMs();
  const upcoming = events.filter((e) => e.status !== "cancelled" && Date.parse(e.startsAt) > nowT - 3600e3).slice(0, 5);
  const nextRelease = releases.find((r) => r.status === "upcoming");
  const hour = nowDate().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <Top
        title={`${greet}, ${session.user.name.split(" ")[0]}.`}
        sub="Overview"
        actions={
          <>
            <Link href="/admin/press/new" className="abtn ghost sm">
              + News
            </Link>
            <Link href="/admin/releases/new" className="abtn ghost sm">
              + Release
            </Link>
            <Link href="/admin/events/new" className="abtn solid sm">
              + Event
            </Link>
          </>
        }
      />
      <div className="adm-body">
        <div className="tiles">
          <div className={`tile ${counts.inqNew ? "hot" : ""}`}>
            <span className="k">Inbox</span>
            <span className="v">{counts.inqNew}</span>
            <span className="s">
              new of {counts.inqAll} total {counts.inqNew ? <b>· needs a reply</b> : null}
            </span>
            <Link href="/admin/inbox" className="go">
              Open →
            </Link>
          </div>
          <div className={`tile ${counts.subNew ? "hot" : ""}`}>
            <span className="k">Submissions</span>
            <span className="v">{counts.subNew}</span>
            <span className="s">unheard of {counts.subAll} total</span>
            <Link href="/admin/submissions" className="go">
              Listen →
            </Link>
          </div>
          <div className="tile">
            <span className="k">Roster · Releases</span>
            <span className="v metal">
              {counts.artists} · {counts.releases}
            </span>
            <span className="s">{nextRelease ? `Next: ${nextRelease.title} (${nextRelease.releaseDate || "TBA"})` : "No upcoming release scheduled"}</span>
            <Link href="/admin/releases" className="go">
              Manage →
            </Link>
          </div>
          <div className="tile">
            <span className="k">Upcoming events</span>
            <span className="v">{upcoming.length}</span>
            <span className="s">{upcoming[0] ? `${fmtDate(upcoming[0].startsAt)} · ${upcoming[0].title}` : "Nothing on the calendar"}</span>
            <Link href="/admin/events" className="go">
              Calendar →
            </Link>
          </div>
        </div>

        <div className="grid2">
          <div style={{ display: "grid", gap: 20 }}>
            <div className="card">
              <div className="head">
                <h2>Latest inquiries</h2>
                <Link href="/admin/inbox" className="abtn ghost sm">
                  All
                </Link>
              </div>
              <div className="body flush">
                {inq.length ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>About</th>
                        <th>Status</th>
                        <th className="r">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inq.map((i) => (
                        <tr key={i.id}>
                          <td>
                            <Link href={`/admin/inbox/${i.id}`} className="row">
                              <span className="t">{i.name}</span>
                              <span className="s">{i.company || i.email}</span>
                            </Link>
                          </td>
                          <td>
                            <span className="t" style={{ textTransform: "capitalize" }}>
                              {i.kind.replace("-", " ")}
                            </span>
                            <span className="s">{i.message.slice(0, 80)}{i.message.length > 80 ? "…" : ""}</span>
                          </td>
                          <td>
                            <span className={`chip ${i.status}`}>{i.status}</span>
                          </td>
                          <td className="num mono">{rel(i.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-adm">
                    <b>Inbox is clear</b>
                    Inquiries from the contact form land here.
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="head">
                <h2>Latest submissions</h2>
                <Link href="/admin/submissions" className="abtn ghost sm">
                  All
                </Link>
              </div>
              <div className="body flush">
                {subs.length ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Artist</th>
                        <th>Genre · City</th>
                        <th>Status</th>
                        <th className="r">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <Link href={`/admin/submissions/${s.id}`} className="row">
                              <span className="t">{s.artistName}</span>
                              <span className="s">{s.name} · {s.email}</span>
                            </Link>
                          </td>
                          <td>
                            {s.genre || "—"}
                            <span className="s">{s.city || ""}</span>
                          </td>
                          <td>
                            <span className={`chip ${s.status}`}>{s.status}</span>
                          </td>
                          <td className="num mono">{rel(s.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-adm">
                    <b>No submissions yet</b>
                    Demo links from /submit land here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <div className="card">
              <div className="head">
                <h2>Coming up</h2>
                <Link href="/admin/events/new" className="abtn ghost sm">
                  + Add
                </Link>
              </div>
              <div className="body">
                {upcoming.length ? (
                  <ul className="audit">
                    {upcoming.map((e) => (
                      <li key={e.id}>
                        <time>{fmtDate(e.startsAt)}</time>
                        <span>
                          <Link href={`/admin/events/${e.id}`}>
                            <b>{e.title}</b>
                          </Link>
                          {e.city ? ` · ${e.city}` : ""} {e.isPublic ? "" : "· private"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-adm">
                    <b>Calendar is open</b>
                    Shows, appearances, release dates and meetings.
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="head">
                <h2>Quick actions</h2>
              </div>
              <div className="body quick">
                <Link href="/admin/roster/new" className="abtn ghost sm">
                  + Artist
                </Link>
                <Link href="/admin/releases/new" className="abtn ghost sm">
                  + Release
                </Link>
                <Link href="/admin/press/new" className="abtn ghost sm">
                  + News post
                </Link>
                <Link href="/admin/settings" className="abtn ghost sm">
                  Announcement bar
                </Link>
                <Link href="/admin/team" className="abtn ghost sm">
                  Invite teammate
                </Link>
                <a href="/press#kit" target="_blank" rel="noreferrer" className="abtn ghost sm">
                  Press kit ↗
                </a>
              </div>
            </div>

            <div className="card">
              <div className="head">
                <h2>System</h2>
              </div>
              <div className="body" style={{ fontSize: 13, display: "grid", gap: 8 }}>
                <div>
                  <span className={`status-dot ${ping.ok ? "ok" : "bad"}`} />
                  Database: {store().backend} — <span style={{ color: "var(--mute)" }}>{ping.detail}</span>
                </div>
                <div>
                  <span className={`status-dot ${process.env.NOTIFY_WEBHOOK ? "ok" : ""}`} />
                  Notifications webhook: {process.env.NOTIFY_WEBHOOK ? "connected" : "not set (inbox only)"}
                </div>
                <div>
                  <span className={`status-dot ${process.env.NEXT_PUBLIC_SITE_URL ? "ok" : ""}`} />
                  Site URL: {process.env.NEXT_PUBLIC_SITE_URL || "default"}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="head">
                <h2>Recent activity</h2>
              </div>
              <div className="body">
                {auditRows.length ? (
                  <ul className="audit">
                    {auditRows.map((a) => (
                      <li key={a.id}>
                        <time>{rel(a.createdAt)}</time>
                        <span>
                          <b>{a.actor.split("@")[0]}</b> {a.action}
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
