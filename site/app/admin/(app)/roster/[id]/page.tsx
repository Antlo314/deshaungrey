import Link from "next/link";
import { notFound } from "next/navigation";
import { Top } from "@/components/admin/Shell";
import { ConfirmForm } from "@/components/admin/Ui";
import { ArtistForm } from "@/components/admin/CatalogForms";
import { deleteArtistAction } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth";
import { getArtist } from "@/lib/db/repo";

export const metadata = { title: "Artist" };

export default async function ArtistEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [artist, s] = await Promise.all([isNew ? null : getArtist(id), getSession()]);
  if (!isNew && !artist) notFound();
  return (
    <>
      <Top
        title={isNew ? "New artist" : artist!.name}
        sub={isNew ? "Roster" : `/artists/${artist!.slug}`}
        actions={
          <>
            <Link href="/admin/roster" className="abtn ghost sm">
              ← Roster
            </Link>
            {!isNew && s?.role === "owner" ? (
              <ConfirmForm action={deleteArtistAction} message={`Delete ${artist!.name} from the roster? This cannot be undone.`} hidden={{ id: artist!.id }}>
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
            <ArtistForm artist={artist ?? undefined} />
          </div>
        </div>
      </div>
    </>
  );
}
