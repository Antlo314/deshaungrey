import Link from "next/link";
import { Top } from "@/components/admin/Shell";
import { fmtDate } from "@/components/Sections";
import { allPosts } from "@/lib/db/repo";

export const metadata = { title: "News & press" };

export default async function PressAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, posts] = await Promise.all([searchParams, allPosts()]);
  return (
    <>
      <Top
        title="News & press"
        sub={`${posts.filter((p) => p.published).length} published · ${posts.filter((p) => !p.published).length} draft`}
        actions={
          <Link href="/admin/press/new" className="abtn solid sm">
            + New post
          </Link>
        }
      />
      <div className="adm-body">
        {saved ? <div className="f"><div className="msg">Saved “{saved}”.</div></div> : null}
        <div className="card">
          <div className="body flush">
            {posts.length ? (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Kicker</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th className="r">Updated</th>
                    <th className="r"></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/admin/press/${p.id}`} className="row">
                          <span className="t">{p.title}</span>
                          <span className="s">/press/{p.slug}</span>
                        </Link>
                      </td>
                      <td>{p.kicker || "—"}</td>
                      <td>{p.published ? <span className="chip on">published</span> : <span className="chip off">draft</span>}</td>
                      <td className="mono">{p.publishedAt ? fmtDate(p.publishedAt) : "—"}</td>
                      <td className="num mono">{fmtDate(p.updatedAt)}</td>
                      <td className="num">
                        <Link href={`/admin/press/${p.id}`} className="abtn ghost sm">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-adm">
                <b>No posts yet</b>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
