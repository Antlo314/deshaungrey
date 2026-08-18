import { singles } from "@/lib/catalog";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/Ticker";
import { Chapter } from "@/components/Chapter";
import { About } from "@/components/About";
import { MerchGrid } from "@/components/MerchGrid";
import { TourDrop } from "@/components/TourDrop";
import { Footer } from "@/components/Footer";
import { AshWidget } from "@/components/AshWidget";

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <Ticker />
      {singles.map((track, i) => (
        <Chapter key={track.id} track={track} index={i} />
      ))}
      <About />
      <MerchGrid />
      <TourDrop />
      <Footer />
      <AshWidget />
    </main>
  );
}
