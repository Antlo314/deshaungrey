import type { MetadataRoute } from "next";
import { publicArtists, publicPosts } from "@/lib/db/repo";
import { siteUrl } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [artists, posts] = await Promise.all([publicArtists(), publicPosts()]);
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = ["", "/legacy", "/artists", "/services", "/releases", "/press", "/submit", "/contact"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...fixed,
    ...artists.map((a) => ({ url: `${base}/artists/${a.slug}`, lastModified: new Date(a.updatedAt), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${base}/press/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
