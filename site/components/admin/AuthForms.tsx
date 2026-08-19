"use client";

import { useActionState } from "react";
import { loginAction, setupOwnerAction, type AuthState } from "@/lib/actions/auth";
import { Msg, SubmitButton } from "./Ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <form action={action} className="f">
      <input type="hidden" name="next" value={next || "/admin"} />
      <label className="l">
        Email
        <input type="email" name="email" autoComplete="username" required autoFocus />
      </label>
      <label className="l">
        Password
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <Msg state={state} />
      <SubmitButton pending="Signing in…">Sign in</SubmitButton>
    </form>
  );
}

export function SetupForm({ needToken }: { needToken: boolean }) {
  const [state, action] = useActionState<AuthState, FormData>(setupOwnerAction, {});
  return (
    <form action={action} className="f">
      {needToken ? (
        <label className="l">
          Setup token
          <input type="password" name="token" required />
          <span className="h">The ADMIN_SETUP_TOKEN value from your environment.</span>
        </label>
      ) : null}
      <label className="l">
        Your name
        <input type="text" name="name" required autoComplete="name" />
      </label>
      <label className="l">
        Email
        <input type="email" name="email" required autoComplete="username" />
      </label>
      <div className="row">
        <label className="l">
          Password
          <input type="password" name="password" required autoComplete="new-password" />
        </label>
        <label className="l">
          Confirm
          <input type="password" name="confirm" required autoComplete="new-password" />
        </label>
      </div>
      <p className="hint">At least 10 characters, letters and numbers. You can add more owners and admins from Team once you&apos;re in.</p>
      <Msg state={state} />
      <SubmitButton pending="Creating…">Create owner account</SubmitButton>
    </form>
  );
}
