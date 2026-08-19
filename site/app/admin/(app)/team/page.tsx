import { Top } from "@/components/admin/Shell";
import { ChangeMyPasswordForm, CreateUserForm, ResetPasswordForm } from "@/components/admin/CompanyForms";
import { ConfirmForm } from "@/components/admin/Ui";
import { fmtDate } from "@/components/Sections";
import { setUserAction } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth";
import { store } from "@/lib/db";
import type { AdminUser } from "@/lib/db/types";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const s = (await getSession())!;
  const users = (await store().list<AdminUser>("user", { orderBy: "createdAt", dir: "asc" })).map((u) => ({ ...u, passwordHash: "" }));
  const owner = s.role === "owner";
  return (
    <>
      <Top title="Team" sub={`${users.length} ${users.length === 1 ? "person" : "people"} with access`} />
      <div className="adm-body">
        <div className="card">
          <div className="head">
            <h2>Who can sign in</h2>
          </div>
          <div className="body flush">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last sign-in</th>
                  {owner ? <th className="r">Manage</th> : null}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="t">{u.name}</span>
                      {u.id === s.uid ? <span className="s">you</span> : null}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`chip ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.disabled ? <span className="chip off">disabled</span> : <span className="chip on">active</span>}</td>
                    <td className="mono">{u.lastLoginAt ? fmtDate(u.lastLoginAt) : "never"}</td>
                    {owner ? (
                      <td className="num">
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          {u.id !== s.uid ? (
                            <>
                              <form action={setUserAction} style={{ display: "inline" }}>
                                <input type="hidden" name="id" value={u.id} />
                                <select name="op" defaultValue="" onChange={undefined} style={{ background: "var(--ink)", border: "1px solid var(--hair-soft)", color: "var(--bone)", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}>
                                  <option value="" disabled>
                                    Role…
                                  </option>
                                  <option value="role:owner">Make owner</option>
                                  <option value="role:admin">Make admin</option>
                                  <option value="role:viewer">Make viewer</option>
                                </select>{" "}
                                <button className="abtn ghost sm" type="submit">
                                  Apply
                                </button>
                              </form>
                              {u.disabled ? (
                                <ConfirmForm action={setUserAction} message={`Re-enable ${u.email}?`} hidden={{ id: u.id, op: "enable" }}>
                                  <button className="abtn ghost sm" type="submit">
                                    Enable
                                  </button>
                                </ConfirmForm>
                              ) : (
                                <ConfirmForm action={setUserAction} message={`Disable ${u.email}? They will be signed out everywhere.`} hidden={{ id: u.id, op: "disable" }}>
                                  <button className="abtn ghost sm" type="submit">
                                    Disable
                                  </button>
                                </ConfirmForm>
                              )}
                              <ConfirmForm action={setUserAction} message={`Remove ${u.email} permanently?`} hidden={{ id: u.id, op: "delete" }}>
                                <button className="abtn danger sm" type="submit">
                                  Remove
                                </button>
                              </ConfirmForm>
                            </>
                          ) : (
                            <ConfirmForm action={setUserAction} message="Sign out all your other sessions?" hidden={{ id: u.id, op: "signout" }}>
                              <button className="abtn ghost sm" type="submit">
                                Sign out other devices
                              </button>
                            </ConfirmForm>
                          )}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid2">
          {owner ? (
            <div className="card">
              <div className="head">
                <h2>Add a teammate</h2>
              </div>
              <div className="body">
                <CreateUserForm />
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="head">
                <h2>Access</h2>
              </div>
              <div className="body" style={{ color: "var(--mute)", fontSize: 13.5 }}>
                Only owners can add or remove people. Ask an owner if you need a change.
              </div>
            </div>
          )}
          <div style={{ display: "grid", gap: 20 }}>
            <div className="card">
              <div className="head">
                <h2>Your password</h2>
              </div>
              <div className="body">
                <ChangeMyPasswordForm />
              </div>
            </div>
            {owner ? (
              <div className="card">
                <div className="head">
                  <h2>Reset someone&apos;s password</h2>
                </div>
                <div className="body" style={{ display: "grid", gap: 18 }}>
                  {users
                    .filter((u) => u.id !== s.uid)
                    .map((u) => (
                      <ResetPasswordForm key={u.id} id={u.id} email={u.email} />
                    ))}
                  {users.length <= 1 ? <div style={{ color: "var(--mute)", fontSize: 13 }}>Add a teammate first.</div> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
