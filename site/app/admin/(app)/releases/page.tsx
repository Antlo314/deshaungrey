import Link from "next/link";
import { Top } from "@/components/admin/Shell";
import { allReleases } from "@/lib/db/repo";

export const metadata = { title: "Releases" };

export default async function ReleasesAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, releases] = await Promise.all([searchParams, allReleases()]);
  return (
    <>
      <Top
        title="Releases"
        sub={`${releases.length} in catalog`}
        actions={
          <Link href="/admin/releases/new" className="abtn solid sm">
            + Add release
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
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Links</th>
                  <th className="r">Order</th>
                  <th className="r"></th>
                </tr>
              </thead>
              <tbody>
                {releases.map((r) => {
                  const live = r.links.filter((l) => l.href).length;
                  return (
                    <tr key={r.id}>
                      <td>
                        {r.cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.cover} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4, border: "1px solid var(--hair-soft)" }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 4, border: "1px dashed var(--hair)" }} />
                        )}
                      </td>
                      <td>
                        <Link href={`/admin/releases/${r.id}`} className="row">
                          <span className="t">{r.title}</span>
                          <span className="s">{r.featuring || `/releases#${r.slug}`}</span>
                        </Link>
                      </td>
                      <td>{r.artistName}</td>
                      <td style={{ textTransform: "capitalize" }}>{r.type}</td>
                      <td>
                        <span className={`chip ${r.status}`}>{r.status}</span>
                      </td>
                      <td className="mono">{r.releaseDate || "—"}</td>
                      <td>{live ? `${live} live` : <span style={{ color: "var(--red)" }}>none</span>}</td>
                      <td className="num mono">{r.orderIndex}</td>
                      <td className="num">
                        <Link href={`/admin/releases/${r.id}`} className="abtn ghost sm">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
