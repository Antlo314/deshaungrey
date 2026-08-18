"use client";

import { useActionState } from "react";
import { changeMyPasswordAction, createUserAction, resetPasswordAction, saveSettingsAction, type ActionState } from "@/lib/actions/admin";
import type { SiteSettings } from "@/lib/db/types";
import { LinksEditor, Msg, SubmitButton } from "./Ui";

export function CreateUserForm() {
  const [state, action] = useActionState<ActionState, FormData>(createUserAction, {});
  return (
    <form action={action} className="f">
      <div className="row">
        <label className="l">
          Name
          <input type="text" name="name" required />
        </label>
        <label className="l">
          Email
          <input type="email" name="email" required autoComplete="off" />
        </label>
      </div>
      <div className="row">
        <label className="l">
          Role
          <select name="role" defaultValue="admin">
            <option value="owner">Owner — everything, incl. team & deletes</option>
            <option value="admin">Admin — content, inbox, settings</option>
            <option value="viewer">Viewer — read only</option>
          </select>
        </label>
        <label className="l">
          Temporary password
          <input type="text" name="password" required autoComplete="off" placeholder="10+ chars, letters + numbers" />
          <span className="h">Share it privately. They can change it after signing in.</span>
        </label>
      </div>
      <Msg state={state} />
      <div className="foot">
        <div className="left" />
        <SubmitButton>Add teammate</SubmitButton>
      </div>
    </form>
  );
}

export function ResetPasswordForm({ id, email }: { id: string; email: string }) {
  const [state, action] = useActionState<ActionState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="f" style={{ gap: 10 }}>
      <input type="hidden" name="id" value={id} />
      <label className="l">
        New password for {email}
        <input type="text" name="password" required autoComplete="off" />
      </label>
      <Msg state={state} />
      <SubmitButton className="abtn ghost sm">Set password</SubmitButton>
    </form>
  );
}

export function ChangeMyPasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(changeMyPasswordAction, {});
  return (
    <form action={action} className="f">
      <label className="l">
        Current password
        <input type="password" name="current" required autoComplete="current-password" />
      </label>
      <label className="l">
        New password
        <input type="password" name="password" required autoComplete="new-password" />
      </label>
      <Msg state={state} />
      <div className="foot">
        <div className="left" />
        <SubmitButton>Change password</SubmitButton>
      </div>
    </form>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettingsAction, {});
  const s = settings;
  return (
    <form action={action} className="f">
      <fieldset>
        <legend>Contact routing</legend>
        <div className="row3">
          <label className="l">
            General email
            <input type="email" name="contactEmail" defaultValue={s.contactEmail} placeholder="info@megentllc.com" />
            <span className="h">Shown in the footer, menu and contact page.</span>
          </label>
          <label className="l">
            Booking email
            <input type="email" name="bookingEmail" defaultValue={s.bookingEmail} />
          </label>
          <label className="l">
            Press email
            <input type="email" name="pressEmail" defaultValue={s.pressEmail} />
          </label>
        </div>
        <div className="row">
          <label className="l">
            Phone (optional)
            <input type="text" name="phone" defaultValue={s.phone} />
          </label>
          <label className="l">
            City / base (optional)
            <input type="text" name="city" defaultValue={s.city} placeholder="Atlanta, Georgia" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Announcement bar</legend>
        <div className="row">
          <label className="l">
            Text (empty = hidden)
            <input type="text" name="announcement" defaultValue={s.announcement} placeholder="World Of Grey — coming soon" />
          </label>
          <label className="l">
            Link (optional)
            <input type="text" name="announcementHref" defaultValue={s.announcementHref} placeholder="/releases" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Submissions</legend>
        <label className="l">
          <span className="check">
            <input type="checkbox" name="submissionsOpen" defaultChecked={s.submissionsOpen} /> Accepting music submissions
          </span>
        </label>
        <label className="l">
          Note under the form
          <input type="text" name="submissionsNote" defaultValue={s.submissionsNote} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Social links (label → URL)</legend>
        <LinksEditor prefix="social" initial={s.socials} labelPlaceholder="Instagram" />
      </fieldset>

      <fieldset>
        <legend>Label streaming profiles (label → URL)</legend>
        <LinksEditor prefix="dsp" initial={s.dsps} labelPlaceholder="Spotify" />
      </fieldset>

      <Msg state={state} />
      <div className="foot">
        <div className="left">
          <a href="/" target="_blank" rel="noreferrer" className="abtn ghost sm">
            View site ↗
          </a>
        </div>
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </form>
  );
}
