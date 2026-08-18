import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { sku?: string };
  const sku = String(body.sku || "").trim();
  if (!sku) {
    return NextResponse.json({ ok: false, reason: "unknown_sku", message: "Missing sku." }, { status: 400 });
  }
  const origin = new URL(req.url).origin;
  const result = await createCheckoutSession(sku, origin);
  const status = result.ok
    ? 200
    : result.reason === "unknown_sku"
      ? 404
      : result.reason === "stripe_unwired"
        ? 200
        : 503;
  return NextResponse.json(result, { status });
}
