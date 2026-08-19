import Link from "next/link";
import { Top } from "@/components/admin/Shell";
import { fmtDate } from "@/components/Sections";
import { allEvents } from "@/lib/db/repo";
import { nowMs } from "@/lib/time";

export const metadata = { title: "Events & dates" };

export default async function EventsAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; show?: string }> }) {
  const [{ saved, show = "upcoming" }, events] = await Promise.all([searchParams, allEvents()]);
  const nowT = nowMs();
  const rows = events.filter((e) => (show === "all" ? true : show === "past" ? Date.parse(e.startsAt) < nowT : Date.parse(e.startsAt) >= nowT - 3600e3));
  return (
    <>
      <Top
        title="Events & dates"
        sub={`${rows.length} ${show}`}
        actions={
          <Link href="/admin/events/new" className="abtn solid sm">
            + Add event
          </Link>
        }
      />
      <div className="adm-body">
        {saved ? <div className="f"><div className="msg">Saved “{saved}”.</div></div> : null}
        <div className="filters">
          {["upcoming", "past", "all"].map((s) => (
            <Link key={s} href={`/admin/events?show=${s}`} className={show === s ? "on" : ""}>
              {s}
            </Link>
          ))}
        </div>
        <div className="card">
          <div className="body flush">
            {rows.length ? (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Event</th>
                    <th>Kind</th>
                    <th>Where</th>
                    <th>Visibility</th>
                    <th>Status</th>
                    <th className="r"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id}>
                      <td className="mono" style={{ whiteSpace: "nowrap" }}>
                        {fmtDate(e.startsAt)}
                        <span className="s">{new Date(e.startsAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                      </td>
                      <td>
                        <Link href={`/admin/events/${e.id}`} className="row">
                          <span className="t">{e.title}</span>
                          {e.url ? <span className="s">{e.url}</span> : null}
                        </Link>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{e.kind}</td>
                      <td>{[e.venue, e.city].filter(Boolean).join(", ") || "—"}</td>
                      <td>{e.isPublic ? <span className="chip on">public</span> : <span className="chip off">private</span>}</td>
                      <td>
                        <span className={`chip ${e.status}`}>{e.status}</span>
                      </td>
                      <td className="num">
                        <Link href={`/admin/events/${e.id}`} className="abtn ghost sm">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-adm">
                <b>Nothing {show === "all" ? "yet" : show}</b>
                Shows, appearances, release days, press and internal meetings.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
