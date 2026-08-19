import { singles } from "@/lib/catalog";
import { Effects } from "@/components/Effects";
import { Preloader } from "@/components/Preloader";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/Ticker";
import { Honors } from "@/components/Honors";
import { Chapter } from "@/components/Chapter";
import { Album } from "@/components/Album";
import { About } from "@/components/About";
import { Label } from "@/components/Label";
import { MerchGrid } from "@/components/MerchGrid";
import { TourDrop } from "@/components/TourDrop";
import { Footer } from "@/components/Footer";
import { MiniPlayer } from "@/components/MiniPlayer";
import { Dock } from "@/components/Dock";

export default function Page() {
  return (
    <main>
      <Preloader />
      <Effects />
      <Nav />
      <Hero />
      <Ticker />
      <Honors />
      {singles.map((track, i) => (
        <Chapter key={track.id} track={track} index={i} />
      ))}
      <Album />
      <About />
      <Label />
      <MerchGrid />
      <TourDrop />
      <Footer />
      <MiniPlayer />
      <Dock />
    </main>
  );
}
