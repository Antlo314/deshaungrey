import Link from "next/link";
import { Top } from "@/components/admin/Shell";
import { fmtDate } from "@/components/Sections";
import { quickSubmissionStatusAction } from "@/lib/actions/admin";
import { listSubmissions } from "@/lib/db/repo";

export const metadata = { title: "Submissions" };
const STATUSES = ["all", "new", "listening", "shortlisted", "meeting", "passed", "signed"] as const;

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  const all = await listSubmissions({ limit: 1000 });
  const counts = Object.fromEntries(STATUSES.map((s) => [s, s === "all" ? all.length : all.filter((i) => i.status === s).length]));
  const needle = q.trim().toLowerCase();
  const rows = all
    .filter((i) => status === "all" || i.status === status)
    .filter((i) => !needle || [i.artistName, i.name, i.email, i.city, i.genre, i.message].join(" ").toLowerCase().includes(needle));
  return (
    <>
      <Top
        title="Submissions"
        sub={`${counts.new} unheard`}
        actions={
          <form action="/admin/submissions" method="get" style={{ display: "flex", gap: 8 }}>
            <input type="hidden" name="status" value={status} />
            <input name="q" defaultValue={q} placeholder="Search…" style={{ background: "var(--ink)", border: "1px solid var(--hair-soft)", borderRadius: 6, padding: "8px 12px", color: "var(--bone)", fontSize: 13, width: 220 }} />
          </form>
        }
      />
      <div className="adm-body">
        <div className="filters">
          {STATUSES.map((s) => (
            <Link key={s} href={`/admin/submissions?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={status === s ? "on" : ""}>
              {s}
              <span className="count">{counts[s]}</span>
            </Link>
          ))}
        </div>
        <div className="card">
          <div className="body flush">
            {rows.length ? (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Artist</th>
                    <th>Genre · City</th>
                    <th>Links</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th className="r">Received</th>
                    <th className="r">Quick</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link href={`/admin/submissions/${s.id}`} className="row">
                          <span className="t">{s.artistName}</span>
                          <span className="s">
                            {s.name} · {s.email}
                          </span>
                        </Link>
                      </td>
                      <td>
                        {s.genre || "—"}
                        <span className="s">{s.city || ""}</span>
                      </td>
                      <td>
                        {s.links.slice(0, 3).map((l, i) => (
                          <a key={i} href={l} target="_blank" rel="noreferrer" style={{ display: "block", color: "var(--gold)", fontSize: 12, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {l.replace(/^https?:\/\//, "")}
                          </a>
                        ))}
                      </td>
                      <td style={{ color: "var(--gold)", letterSpacing: 2 }}>{s.rating ? "★".repeat(s.rating) : <span style={{ color: "var(--mute)" }}>—</span>}</td>
                      <td>
                        <span className={`chip ${s.status}`}>{s.status}</span>
                      </td>
                      <td className="num mono">{fmtDate(s.createdAt)}</td>
                      <td className="num">
                        <form action={quickSubmissionStatusAction} style={{ display: "inline-flex", gap: 6 }}>
                          <input type="hidden" name="id" value={s.id} />
                          {s.status === "new" ? (
                            <button className="abtn ghost sm" name="status" value="listening" type="submit">
                              Listening
                            </button>
                          ) : null}
                          {s.status !== "shortlisted" && s.status !== "signed" ? (
                            <button className="abtn ghost sm" name="status" value="shortlisted" type="submit">
                              Shortlist
                            </button>
                          ) : null}
                          {s.status !== "passed" ? (
                            <button className="abtn ghost sm" name="status" value="passed" type="submit">
                              Pass
                            </button>
                          ) : null}
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-adm">
                <b>Nothing here</b>
                {status === "all" ? "Demo links from /submit appear here." : `No ${status} submissions.`}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
