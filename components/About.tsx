import { artist } from "@/lib/catalog";

export function About() {
  return (
    <section className="about" id="about">
      <div className="about-photo">
        <img
          src="/media/about/portrait-m.jpg"
          srcSet="/media/about/portrait-m.jpg 900w, /media/about/portrait.png 1600w"
          sizes="(max-width: 900px) 100vw, 50vw"
          alt="Dashaun Grey in a windowpane tuxedo"
        />
      </div>
      <div className="about-copy">
        <p className="kicker">From Loris to the world</p>
        <h2>
          Different
          <br />
          shades.
        </h2>
        <p>
          After a season of physical, emotional, and spiritual healing, {artist.name}, formerly{" "}
          {artist.formerly}, returns with a new name and a sound that holds every dimension of his life.
        </p>
        <p>
          Born {artist.born} in {artist.hometown}. At fourteen he was already in FaSho — a Warner-adjacent
          deal, Billboard ink, a 2011 Grammy ballot. The group years built him. The solo chapter is his.
        </p>
        <p>
          The singles introduce the album {artist.album} on {artist.label}, landing {artist.albumWhen}.
          R&amp;B, hip-hop, pop, reggae, dance, Afrocentric — love, culture, celebration, evolution.
        </p>
        <blockquote>“{artist.quote}”</blockquote>
      </div>
    </section>
  );
}
