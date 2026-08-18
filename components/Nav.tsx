"use client";

export function Nav() {
  return (
    <header className="nav">
      <a className="nav-mark" href="#top">
        Dashaun Grey
      </a>
      <nav className="nav-links" aria-label="Primary">
        <a href="#music">Music</a>
        <a href="#about">About</a>
        <a href="#merch">Merch</a>
        <a href="#tour">Tour</a>
      </nav>
      <a className="nav-ash" href="#ash">
        Talk to Ash
      </a>
    </header>
  );
}
