import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Dashboard — MEG Enterprises", template: "%s — MEG Dashboard" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
