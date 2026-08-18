import Link from "next/link";
import { Top } from "@/components/admin/Shell";
import { allArtists } from "@/lib/db/repo";

export const metadata = { title: "Roster" };

export default async function RosterPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, artists] = await Promise.all([searchParams, allArtists()]);
  return (
    <>
      <Top
        title="Roster"
        sub={`${artists.length} artist${artists.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/roster/new" className="abtn solid sm">
            + Add artist
          </Link>
        }
      />
      <div className="adm-body">
        {saved ? <div className="f"><div className="msg">Saved “{saved}”. The public site is updated.</div></div> : null}
        <div className="card">
          <div className="body flush">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 64 }}></th>
                  <th>Artist</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th className="r">Order</th>
                  <th className="r"></th>
                </tr>
              </thead>
              <tbody>
                {artists.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.image} alt="" style={{ width: 44, height: 55, objectFit: "cover", borderRadius: 4, border: "1px solid var(--hair-soft)" }} />
                      ) : (
                        <div style={{ width: 44, height: 55, borderRadius: 4, border: "1px dashed var(--hair)" }} />
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/roster/${a.id}`} className="row">
                        <span className="t">{a.name}</span>
                        <span className="s">/artists/{a.slug}</span>
                      </Link>
                    </td>
                    <td style={{ color: "var(--mute)" }}>{a.roles}</td>
                    <td>
                      <span className={`chip ${a.status}`}>{a.status}</span>
                    </td>
                    <td>{a.featured ? <span className="chip on">home</span> : <span style={{ color: "var(--mute)" }}>—</span>}</td>
                    <td className="num mono">{a.orderIndex}</td>
                    <td className="num">
                      <Link href={`/admin/roster/${a.id}`} className="abtn ghost sm">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
