import Link from "next/link";
import { notFound } from "next/navigation";
import { Top } from "@/components/admin/Shell";
import { ConfirmForm } from "@/components/admin/Ui";
import { ReleaseForm } from "@/components/admin/CatalogForms";
import { deleteReleaseAction } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth";
import { allArtists, getRelease } from "@/lib/db/repo";

export const metadata = { title: "Release" };

export default async function ReleaseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [release, artists, s] = await Promise.all([isNew ? null : getRelease(id), allArtists(), getSession()]);
  if (!isNew && !release) notFound();
  return (
    <>
      <Top
        title={isNew ? "New release" : release!.title}
        sub={isNew ? "Releases" : release!.artistName}
        actions={
          <>
            <Link href="/admin/releases" className="abtn ghost sm">
              ← Releases
            </Link>
            {!isNew && s?.role === "owner" ? (
              <ConfirmForm action={deleteReleaseAction} message={`Delete “${release!.title}”? This cannot be undone.`} hidden={{ id: release!.id }}>
                <button className="abtn danger sm" type="submit">
                  Delete
                </button>
              </ConfirmForm>
            ) : null}
          </>
        }
      />
      <div className="adm-body">
        <div className="card">
          <div className="body">
            <ReleaseForm release={release ?? undefined} artists={artists.map((a) => ({ id: a.id, name: a.name }))} />
          </div>
        </div>
      </div>
    </>
  );
}
