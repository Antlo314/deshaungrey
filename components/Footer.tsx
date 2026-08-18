import { artist, socials } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        {artist.name} · {artist.label} · {new Date().getFullYear()}
      </div>
      <nav aria-label="Social">
        {socials.map((s) => (
          <a key={s.id} href={s.href}>
            {s.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
