"use client";

import { useActionState } from "react";
import { updateInquiryAction, updateSubmissionAction, type ActionState } from "@/lib/actions/admin";
import type { Inquiry, Submission } from "@/lib/db/types";
import { Msg, Stars, SubmitButton } from "./Ui";

export function InquiryDetailForm({ inquiry }: { inquiry: Inquiry }) {
  const [state, action] = useActionState<ActionState, FormData>(updateInquiryAction, {});
  return (
    <form action={action} className="f">
      <input type="hidden" name="id" value={inquiry.id} />
      <label className="l">
        Status
        <select name="status" defaultValue={inquiry.status}>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label className="l">
        Assigned to
        <input type="text" name="assignedTo" defaultValue={inquiry.assignedTo || ""} placeholder="name or email" />
      </label>
      <label className="l">
        Internal notes
        <textarea name="notes" defaultValue={inquiry.notes || ""} placeholder="What was said, what's next…" />
      </label>
      <Msg state={state} />
      <div className="foot">
        <div className="left">
          <a className="abtn ghost sm" href={`mailto:${inquiry.email}?subject=${encodeURIComponent("Re: your message to MEG Enterprises")}`}>
            Reply by email ↗
          </a>
        </div>
        <SubmitButton>Save</SubmitButton>
      </div>
    </form>
  );
}

export function SubmissionDetailForm({ sub }: { sub: Submission }) {
  const [state, action] = useActionState<ActionState, FormData>(updateSubmissionAction, {});
  return (
    <form action={action} className="f">
      <input type="hidden" name="id" value={sub.id} />
      <label className="l">
        Status
        <select name="status" defaultValue={sub.status}>
          <option value="new">New</option>
          <option value="listening">Listening</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="meeting">Meeting</option>
          <option value="passed">Passed</option>
          <option value="signed">Signed</option>
        </select>
      </label>
      <label className="l">
        Rating
        <Stars name="rating" initial={sub.rating || 0} />
      </label>
      <label className="l">
        A&R notes
        <textarea name="notes" defaultValue={sub.notes || ""} placeholder="Voice, writing, live, market — what stood out, what didn't." />
      </label>
      <Msg state={state} />
      <div className="foot">
        <div className="left">
          <a className="abtn ghost sm" href={`mailto:${sub.email}?subject=${encodeURIComponent(`MEG Enterprises — ${sub.artistName}`)}`}>
            Email {sub.name.split(" ")[0]} ↗
          </a>
        </div>
        <SubmitButton>Save</SubmitButton>
      </div>
    </form>
  );
}
