import Link from "next/link";
import { SetupForm } from "@/components/admin/AuthForms";
import { setupAllowed, userCount } from "@/lib/auth";

export const metadata = { title: "First-run setup" };

export default async function SetupPage() {
  const users = await userCount().catch(() => -1);
  const probe = await setupAllowed(process.env.ADMIN_SETUP_TOKEN ? "__probe__" : undefined);
  const needToken = !!process.env.ADMIN_SETUP_TOKEN;
  const blocked = users !== 0 || (!needToken && !probe.ok);
  return (
    <>
      <div>
        <h1>First-run setup</h1>
        <p className="sub">Create the first owner account for the MEG dashboard. This screen disappears once an owner exists.</p>
      </div>
      {blocked ? (
        <div className="f">
          <div className="msg err">{users > 0 ? "An owner already exists." : probe.reason}</div>
          <Link href="/admin/login" className="abtn ghost">
            Go to sign in
          </Link>
        </div>
      ) : (
        <SetupForm needToken={needToken} />
      )}
    </>
  );
}
