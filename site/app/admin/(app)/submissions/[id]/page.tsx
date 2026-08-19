import Link from "next/link";
import { notFound } from "next/navigation";
import { Top } from "@/components/admin/Shell";
import { ConfirmForm } from "@/components/admin/Ui";
import { SubmissionDetailForm } from "@/components/admin/InboundForms";
import { fmtDate } from "@/components/Sections";
import { deleteSubmissionAction } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth";
import { getSubmission } from "@/lib/db/repo";

export const metadata = { title: "Submission" };

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [s, sess] = await Promise.all([getSubmission(id), getSession()]);
  if (!s) notFound();
  return (
    <>
      <Top
        title={s.artistName}
        sub={s.genre || "submission"}
        actions={
          <>
            <Link href="/admin/submissions" className="abtn ghost sm">
              ← Submissions
            </Link>
            {sess?.role === "owner" ? (
              <ConfirmForm action={deleteSubmissionAction} message="Delete this submission permanently?" hidden={{ id: s.id }}>
                <button className="abtn danger sm" type="submit">
                  Delete
                </button>
              </ConfirmForm>
            ) : null}
          </>
        }
      />
      <div className="adm-body">
        <div className="detail">
          <div className="card">
            <div className="head">
              <h2>Submission</h2>
              <span className={`chip ${s.status}`}>{s.status}</span>
            </div>
            <div className="body">
              <dl style={{ marginBottom: 18 }}>
                <dt>Contact</dt>
                <dd>
                  {s.name} · <a href={`mailto:${s.email}`}>{s.email}</a>
                  {s.phone ? ` · ${s.phone}` : ""}
                </dd>
                <dt>City · Genre</dt>
                <dd>{[s.city, s.genre].filter(Boolean).join(" · ") || "—"}</dd>
                <dt>Links</dt>
                <dd>
                  {s.links.map((l, i) => (
                    <a key={i} href={l} target="_blank" rel="noreferrer" style={{ display: "block" }}>
                      {l}
                    </a>
                  ))}
                </dd>
                <dt>Received</dt>
                <dd>
                  {fmtDate(s.createdAt)}
                  {s.ip ? ` · ${s.ip}` : ""}
                </dd>
              </dl>
              {s.message ? <div className="msgbox">{s.message}</div> : <div style={{ color: "var(--mute)", fontSize: 13 }}>No message.</div>}
            </div>
          </div>
          <div className="card">
            <div className="head">
              <h2>A&amp;R</h2>
            </div>
            <div className="body">
              <SubmissionDetailForm sub={s} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
