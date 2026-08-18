import Link from "next/link";
import { LoginForm } from "@/components/admin/AuthForms";
import { bootstrapOwnerFromEnv, userCount } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  let users = 0;
  let dbError = "";
  try {
    await bootstrapOwnerFromEnv();
    users = await userCount();
  } catch (e) {
    dbError = (e as Error).message;
  }
  return (
    <>
      <div>
        <h1>Sign in</h1>
        <p className="sub">Owner and team access for MEG Enterprises. Everything here is private.</p>
      </div>
      {dbError ? (
        <div className="f">
          <div className="msg err">
            Can&apos;t reach the database: <code>{dbError}</code>. Check DATABASE_URL.
          </div>
        </div>
      ) : null}
      {!dbError && users === 0 ? (
        <div className="f">
          <div className="msg">
            No owner account exists yet. <Link href="/admin/setup" style={{ color: "var(--gold)" }}>Create the first owner →</Link>
          </div>
        </div>
      ) : null}
      <LoginForm next={next} />
    </>
  );
}
