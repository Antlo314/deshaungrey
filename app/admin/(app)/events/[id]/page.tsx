import Link from "next/link";
import { notFound } from "next/navigation";
import { Top } from "@/components/admin/Shell";
import { ConfirmForm } from "@/components/admin/Ui";
import { EventForm } from "@/components/admin/CatalogForms";
import { deleteEventAction } from "@/lib/actions/admin";
import { allArtists, getEvent } from "@/lib/db/repo";

export const metadata = { title: "Event" };

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [event, artists] = await Promise.all([isNew ? null : getEvent(id), allArtists()]);
  if (!isNew && !event) notFound();
  return (
    <>
      <Top
        title={isNew ? "New event" : event!.title}
        sub="Events & dates"
        actions={
          <>
            <Link href="/admin/events" className="abtn ghost sm">
              ← Events
            </Link>
            {!isNew ? (
              <ConfirmForm action={deleteEventAction} message={`Delete “${event!.title}”?`} hidden={{ id: event!.id }}>
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
            <EventForm event={event ?? undefined} artists={artists.map((a) => ({ id: a.id, name: a.name }))} />
          </div>
        </div>
      </div>
    </>
  );
}
