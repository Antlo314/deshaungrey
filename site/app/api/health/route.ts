import { NextResponse } from "next/server";
import { ephemeral, store } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = store();
  const ping = await s.ping();
  return NextResponse.json({ ok: ping.ok, backend: s.backend, ephemeral: ephemeral(), detail: ping.detail, at: new Date().toISOString() });
}
