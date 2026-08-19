import { merch } from "./catalog";

export function printfulReady() {
  return Boolean(process.env.PRINTFUL_API_KEY);
}

export function merchStatus(sku: string) {
  const item = merch.find((m) => m.sku === sku);
  if (!item) return { wired: false, reason: "unknown_sku" as const };
  if (!printfulReady() || !item.printfulProductId) {
    return { wired: false, reason: "printful_unwired" as const };
  }
  return { wired: true, productId: item.printfulProductId };
}
