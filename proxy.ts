import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/session-token";

/**
 * Optimistic gate for the owner dashboard. Signature + expiry only — the admin
 * layout does the full user lookup. Public routes are untouched.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const open = pathname === "/admin/login" || pathname === "/admin/setup";
  const token = req.cookies.get("meg_admin")?.value;
  const session = token ? await verifyToken(token) : null;

  if (open) {
    if (session && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/admin/login", req.url);
    const next = pathname + (search || "");
    if (next !== "/admin") url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
