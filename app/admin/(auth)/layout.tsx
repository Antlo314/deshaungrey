import Link from "next/link";
import { Lockup, Profile } from "@/components/Mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth">
      <div className="auth-mark" aria-hidden>
        <Profile />
      </div>
      <div className="auth-card">
        <div className="lockup">
          <Lockup />
        </div>
        {children}
      </div>
      <p className="auth-foot">
        <Link href="/">← megentllc.com</Link> · Owner dashboard
      </p>
    </main>
  );
}
