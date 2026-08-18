import { findSku } from "./catalog";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: "stripe_unwired" | "unknown_sku" | "stripe_error"; message: string };

export function stripeReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function createCheckoutSession(
  sku: string,
  origin: string
): Promise<CheckoutResult> {
  const item = findSku(sku);
  if (!item) {
    return { ok: false, reason: "unknown_sku", message: "That item is not in the catalog." };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return {
      ok: false,
      reason: "stripe_unwired",
      message: "Checkout wires tomorrow. Join the drop list.",
    };
  }

  try {
    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", `${origin}/?checkout=success&sku=${encodeURIComponent(sku)}`);
    body.set("cancel_url", `${origin}/#music`);
    body.set("line_items[0][quantity]", "1");
    body.set("line_items[0][price_data][currency]", "usd");
    body.set("line_items[0][price_data][unit_amount]", String(item.price.cents));
    body.set("line_items[0][price_data][product_data][name]", item.title);
    body.set("metadata[sku]", sku);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = (await res.json()) as { url?: string; error?: { message?: string } };
    if (!res.ok || !data.url) {
      return {
        ok: false,
        reason: "stripe_error",
        message: data.error?.message || "Stripe declined the session.",
      };
    }
    return { ok: true, url: data.url };
  } catch {
    return { ok: false, reason: "stripe_error", message: "Could not reach Stripe." };
  }
}
