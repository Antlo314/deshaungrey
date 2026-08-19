import Link from "next/link";
import { Top } from "@/components/admin/Shell";
import { fmtDate } from "@/components/Sections";
import { quickInquiryStatusAction } from "@/lib/actions/admin";
import { listInquiries } from "@/lib/db/repo";

export const metadata = { title: "Inbox" };
const STATUSES = ["all", "new", "reviewing", "replied", "archived"] as const;

function SearchBox({ action, status, q }: { action: string; status: string; q: string }) {
  return (
    <form action={action} method="get" style={{ display: "flex", gap: 8 }}>
      <input type="hidden" name="status" value={status} />
      <input name="q" defaultValue={q} placeholder="Search…" style={{ background: "var(--ink)", border: "1px solid var(--hair-soft)", borderRadius: 6, padding: "8px 12px", color: "var(--bone)", fontSize: 13, width: 220 }} />
    </form>
  );
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  const all = await listInquiries({ limit: 1000 });
  const counts = Object.fromEntries(STATUSES.map((s) => [s, s === "all" ? all.length : all.filter((i) => i.status === s).length]));
  const needle = q.trim().toLowerCase();
  const rows = all
    .filter((i) => status === "all" || i.status === status)
    .filter((i) => !needle || [i.name, i.email, i.company, i.message, i.kind].join(" ").toLowerCase().includes(needle));
  return (
    <>
      <Top title="Inbox" sub={`${counts.new} new`} actions={<SearchBox action="/admin/inbox" status={status} q={q} />} />
      <div className="adm-body">
        <div className="filters">
          {STATUSES.map((s) => (
            <Link key={s} href={`/admin/inbox?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={status === s ? "on" : ""}>
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
                    <th>From</th>
                    <th>About</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th className="r">Received</th>
                    <th className="r">Quick</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <Link href={`/admin/inbox/${i.id}`} className="row">
                          <span className="t">{i.name}</span>
                          <span className="s">
                            {i.email}
                            {i.company ? ` · ${i.company}` : ""}
                          </span>
                        </Link>
                      </td>
                      <td style={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>{i.kind.replace("-", " ")}</td>
                      <td style={{ maxWidth: 420, color: "var(--mute)" }}>
                        {i.message.slice(0, 140)}
                        {i.message.length > 140 ? "…" : ""}
                      </td>
                      <td>
                        <span className={`chip ${i.status}`}>{i.status}</span>
                      </td>
                      <td className="num mono">{fmtDate(i.createdAt)}</td>
                      <td className="num">
                        <form action={quickInquiryStatusAction} style={{ display: "inline-flex", gap: 6 }}>
                          <input type="hidden" name="id" value={i.id} />
                          {i.status !== "replied" ? (
                            <button className="abtn ghost sm" name="status" value="replied" type="submit">
                              Replied
                            </button>
                          ) : null}
                          {i.status !== "archived" ? (
                            <button className="abtn ghost sm" name="status" value="archived" type="submit">
                              Archive
                            </button>
                          ) : (
                            <button className="abtn ghost sm" name="status" value="new" type="submit">
                              Reopen
                            </button>
                          )}
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-adm">
                <b>Nothing here</b>
                {status === "all" ? "Messages from the contact form appear here." : `No ${status} inquiries.`}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
