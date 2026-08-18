"use client";

import { useActionState } from "react";
import { saveArtistAction, saveEventAction, savePostAction, saveReleaseAction, type ActionState } from "@/lib/actions/admin";
import type { Artist, EventDoc, Post, Release } from "@/lib/db/types";
import { LinksEditor, Msg, SlugField, SubmitButton } from "./Ui";

const toLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function ArtistForm({ artist }: { artist?: Artist }) {
  const [state, action] = useActionState<ActionState, FormData>(saveArtistAction, {});
  const a = artist;
  return (
    <form action={action} className="f">
      {a ? <input type="hidden" name="id" value={a.id} /> : null}
      <div className="row">
        <label className="l">
          Name
          <input type="text" name="name" defaultValue={a?.name || ""} required />
        </label>
        <SlugField from="artists" initial={a?.slug || ""} />
      </div>
      <div className="row3">
        <label className="l">
          Status
          <select name="status" defaultValue={a?.status || "active"}>
            <option value="active">Active roster</option>
            <option value="development">In development</option>
            <option value="alumni">Alumni</option>
            <option value="hidden">Hidden (not public)</option>
          </select>
        </label>
        <label className="l">
          Order
          <input type="number" name="orderIndex" defaultValue={a?.orderIndex ?? 99} />
          <span className="h">Lower shows first.</span>
        </label>
        <label className="l">
          &nbsp;
          <span className="check">
            <input type="checkbox" name="featured" defaultChecked={a?.featured ?? false} /> Featured on the home page
          </span>
        </label>
      </div>
      <div className="row">
        <label className="l">
          Roles
          <input type="text" name="roles" defaultValue={a?.roles || ""} placeholder="Singer · Songwriter · Producer" />
        </label>
        <label className="l">
          Formerly known as
          <input type="text" name="formerly" defaultValue={a?.formerly || ""} />
        </label>
      </div>
      <div className="row">
        <label className="l">
          Hometown
          <input type="text" name="hometown" defaultValue={a?.hometown || ""} />
        </label>
        <label className="l">
          Official site URL
          <input type="text" name="site" defaultValue={a?.site || ""} placeholder="https://" />
        </label>
      </div>
      <label className="l">
        Short intro (cards, search results)
        <textarea name="short" defaultValue={a?.short || ""} style={{ minHeight: 80 }} />
      </label>
      <label className="l">
        Biography
        <textarea name="bio" className="tall" defaultValue={a?.bio || ""} />
        <span className="h">Separate paragraphs with a blank line.</span>
      </label>
      <label className="l">
        Pull quote (optional)
        <textarea name="quote" defaultValue={a?.quote || ""} style={{ minHeight: 70 }} />
      </label>
      <div className="row">
        <label className="l">
          Portrait image path / URL
          <input type="text" name="image" defaultValue={a?.image || ""} placeholder="/media/roster/name.jpg" />
          <span className="h">Upload files to public/media/roster (or paste any https URL). 4:5 portrait works best.</span>
        </label>
        <label className="l">
          Wide image path / URL
          <input type="text" name="imageWide" defaultValue={a?.imageWide || ""} placeholder="/media/roster/name-wide.jpg" />
          <span className="h">Used on the big home-page card. 16:10 or wider.</span>
        </label>
      </div>
      <label className="l">
        “Now” chips (one per line)
        <textarea name="now" defaultValue={(a?.now || []).join("\n")} placeholder={"Show Me · out now\nWorld Of Grey · forthcoming"} style={{ minHeight: 80 }} />
      </label>
      <fieldset>
        <legend>Links</legend>
        <LinksEditor initial={a?.links || [{ label: "Instagram", href: "" }, { label: "Spotify", href: "" }, { label: "Apple Music", href: "" }, { label: "YouTube", href: "" }]} labelPlaceholder="Instagram" />
      </fieldset>
      <Msg state={state} />
      <div className="foot">
        <div className="left">
          <a href={a ? `/artists/${a.slug}` : "/artists"} target="_blank" rel="noreferrer" className="abtn ghost sm">
            View public page ↗
          </a>
        </div>
        <SubmitButton>{a ? "Save artist" : "Create artist"}</SubmitButton>
      </div>
    </form>
  );
}

export function ReleaseForm({ release, artists }: { release?: Release; artists: { id: string; name: string }[] }) {
  const [state, action] = useActionState<ActionState, FormData>(saveReleaseAction, {});
  const r = release;
  return (
    <form action={action} className="f">
      {r ? <input type="hidden" name="id" value={r.id} /> : null}
      <div className="row">
        <label className="l">
          Title
          <input type="text" name="title" defaultValue={r?.title || ""} required />
        </label>
        <SlugField from="releases" initial={r?.slug || ""} />
      </div>
      <div className="row3">
        <label className="l">
          Artist
          <select name="artistId" defaultValue={r?.artistId || ""}>
            <option value="">— other / label —</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="l">
          Artist name (if not on roster)
          <input type="text" name="artistName" defaultValue={r?.artistName || ""} />
        </label>
        <label className="l">
          Featuring
          <input type="text" name="featuring" defaultValue={r?.featuring || ""} placeholder="ft. …" />
        </label>
      </div>
      <div className="row3">
        <label className="l">
          Type
          <select name="type" defaultValue={r?.type || "single"}>
            <option value="single">Single</option>
            <option value="ep">EP</option>
            <option value="album">Album</option>
            <option value="mixtape">Mixtape</option>
            <option value="feature">Feature</option>
          </select>
        </label>
        <label className="l">
          Status
          <select name="status" defaultValue={r?.status || "out"}>
            <option value="out">Out now</option>
            <option value="upcoming">Upcoming</option>
            <option value="catalog">Catalog</option>
          </select>
        </label>
        <label className="l">
          Release date
          <input type="text" name="releaseDate" defaultValue={r?.releaseDate || ""} placeholder="2026-09-12 or “Fall 2026”" />
        </label>
      </div>
      <div className="row">
        <label className="l">
          Cover image path / URL
          <input type="text" name="cover" defaultValue={r?.cover || ""} placeholder="/media/releases/title.jpg" />
          <span className="h">Square. Leave empty for a “coming soon” tile.</span>
        </label>
        <label className="l">
          Order
          <input type="number" name="orderIndex" defaultValue={r?.orderIndex ?? 99} />
        </label>
      </div>
      <label className="l">
        Blurb
        <textarea name="blurb" defaultValue={r?.blurb || ""} style={{ minHeight: 80 }} />
      </label>
      <label className="l">
        <span className="check">
          <input type="checkbox" name="featured" defaultChecked={r?.featured ?? true} /> Show on the home page
        </span>
      </label>
      <fieldset>
        <legend>Streaming links</legend>
        <LinksEditor initial={r?.links || [{ label: "Spotify", href: "" }, { label: "Apple Music", href: "" }, { label: "YouTube", href: "" }, { label: "Tidal", href: "" }, { label: "Amazon Music", href: "" }]} labelPlaceholder="Spotify" />
      </fieldset>
      <Msg state={state} />
      <div className="foot">
        <div className="left">
          <a href="/releases" target="_blank" rel="noreferrer" className="abtn ghost sm">
            View releases ↗
          </a>
        </div>
        <SubmitButton>{r ? "Save release" : "Create release"}</SubmitButton>
      </div>
    </form>
  );
}

export function PostForm({ post, author }: { post?: Post; author: string }) {
  const [state, action] = useActionState<ActionState, FormData>(savePostAction, {});
  const p = post;
  return (
    <form action={action} className="f">
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <label className="l">
        Title
        <input type="text" name="title" defaultValue={p?.title || ""} required />
      </label>
      <div className="row3">
        <SlugField from="press" initial={p?.slug || ""} />
        <label className="l">
          Kicker
          <input type="text" name="kicker" defaultValue={p?.kicker || ""} placeholder="Company · Roster · Release · Press" />
        </label>
        <label className="l">
          Author
          <input type="text" name="authorName" defaultValue={p?.authorName || author} />
        </label>
      </div>
      <label className="l">
        Excerpt (list + share text)
        <textarea name="excerpt" defaultValue={p?.excerpt || ""} style={{ minHeight: 80 }} />
      </label>
      <label className="l">
        Body
        <textarea name="body" className="tall" defaultValue={p?.body || ""} />
        <span className="h">Paragraphs separated by a blank line. Start a line with “## ” for a heading.</span>
      </label>
      <div className="row3">
        <label className="l">
          Image path / URL (optional)
          <input type="text" name="image" defaultValue={p?.image || ""} placeholder="/media/press/…" />
        </label>
        <label className="l">
          Publish date
          <input type="datetime-local" name="publishedAt" defaultValue={toLocal(p?.publishedAt)} />
          <span className="h">Empty = now, when published.</span>
        </label>
        <label className="l">
          &nbsp;
          <span className="check">
            <input type="checkbox" name="published" defaultChecked={p?.published ?? false} /> Published (visible on the site)
          </span>
        </label>
      </div>
      <Msg state={state} />
      <div className="foot">
        <div className="left">
          {p ? (
            <a href={`/press/${p.slug}`} target="_blank" rel="noreferrer" className="abtn ghost sm">
              View ↗
            </a>
          ) : null}
        </div>
        <SubmitButton>{p ? "Save post" : "Create post"}</SubmitButton>
      </div>
    </form>
  );
}

export function EventForm({ event, artists }: { event?: EventDoc; artists: { id: string; name: string }[] }) {
  const [state, action] = useActionState<ActionState, FormData>(saveEventAction, {});
  const e = event;
  return (
    <form action={action} className="f">
      {e ? <input type="hidden" name="id" value={e.id} /> : null}
      <div className="row">
        <label className="l">
          Title
          <input type="text" name="title" defaultValue={e?.title || ""} required placeholder="Show · Appearance · Release day · Meeting" />
        </label>
        <label className="l">
          Kind
          <select name="kind" defaultValue={e?.kind || "show"}>
            <option value="show">Show</option>
            <option value="appearance">Appearance</option>
            <option value="release">Release</option>
            <option value="press">Press</option>
            <option value="meeting">Meeting (internal)</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>
      <div className="row3">
        <label className="l">
          Starts
          <input type="datetime-local" name="startsAt" defaultValue={toLocal(e?.startsAt)} required />
        </label>
        <label className="l">
          Ends (optional)
          <input type="datetime-local" name="endsAt" defaultValue={toLocal(e?.endsAt)} />
        </label>
        <label className="l">
          Status
          <select name="status" defaultValue={e?.status || "upcoming"}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <div className="row3">
        <label className="l">
          City
          <input type="text" name="city" defaultValue={e?.city || ""} />
        </label>
        <label className="l">
          Venue
          <input type="text" name="venue" defaultValue={e?.venue || ""} />
        </label>
        <label className="l">
          Artist
          <select name="artistId" defaultValue={e?.artistId || ""}>
            <option value="">— label —</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="l">
        Link (tickets / details)
        <input type="text" name="url" defaultValue={e?.url || ""} placeholder="https://" />
      </label>
      <label className="l">
        Notes (internal)
        <textarea name="notes" defaultValue={e?.notes || ""} />
      </label>
      <label className="l">
        <span className="check">
          <input type="checkbox" name="isPublic" defaultChecked={e?.isPublic ?? true} /> Public — show on the Releases page under “Dates &amp; appearances”
        </span>
      </label>
      <Msg state={state} />
      <div className="foot">
        <div className="left" />
        <SubmitButton>{e ? "Save event" : "Create event"}</SubmitButton>
      </div>
    </form>
  );
}
