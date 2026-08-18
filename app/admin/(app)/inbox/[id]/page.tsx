import Link from "next/link";
import { notFound } from "next/navigation";
import { Top } from "@/components/admin/Shell";
import { ConfirmForm } from "@/components/admin/Ui";
import { InquiryDetailForm } from "@/components/admin/InboundForms";
import { fmtDate } from "@/components/Sections";
import { deleteInquiryAction } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth";
import { getInquiry } from "@/lib/db/repo";

export const metadata = { title: "Inquiry" };

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [i, s] = await Promise.all([getInquiry(id), getSession()]);
  if (!i) notFound();
  return (
    <>
      <Top
        title={i.name}
        sub={i.kind.replace("-", " ")}
        actions={
          <>
            <Link href="/admin/inbox" className="abtn ghost sm">
              ← Inbox
            </Link>
            {s?.role === "owner" ? (
              <ConfirmForm action={deleteInquiryAction} message="Delete this inquiry permanently?" hidden={{ id: i.id }}>
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
              <h2>Message</h2>
              <span className={`chip ${i.status}`}>{i.status}</span>
            </div>
            <div className="body">
              <dl style={{ marginBottom: 18 }}>
                <dt>From</dt>
                <dd>
                  {i.name} · <a href={`mailto:${i.email}`}>{i.email}</a>
                </dd>
                {i.phone ? (
                  <>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${i.phone}`}>{i.phone}</a>
                    </dd>
                  </>
                ) : null}
                {i.company ? (
                  <>
                    <dt>Company</dt>
                    <dd>{i.company}</dd>
                  </>
                ) : null}
                <dt>Received</dt>
                <dd>
                  {fmtDate(i.createdAt)} · {new Date(i.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </dd>
                <dt>Source</dt>
                <dd>
                  {i.source || "site"}
                  {i.ip ? ` · ${i.ip}` : ""}
                </dd>
              </dl>
              <div className="msgbox">{i.message}</div>
            </div>
          </div>
          <div className="card">
            <div className="head">
              <h2>Handle</h2>
            </div>
            <div className="body">
              <InquiryDetailForm inquiry={i} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
