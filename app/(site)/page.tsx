import { Hero } from "@/components/Hero";
import { CtaBand, Disciplines, LegacyTeaser, Manifesto, PressSection, Record, ReleasesSection, RosterSpotlight, Ticker } from "@/components/Sections";
import { publicArtists, publicPosts, publicReleases } from "@/lib/db/repo";

export default async function Home() {
  const [artists, releases, posts] = await Promise.all([publicArtists(), publicReleases(), publicPosts()]);
  return (
    <>
      <Hero />
      <Ticker />
      <Manifesto />
      <Disciplines />
      <RosterSpotlight artists={artists} />
      <Record />
      <LegacyTeaser />
      <ReleasesSection releases={releases} />
      <PressSection posts={posts} />
      <CtaBand />
    </>
  );
}
