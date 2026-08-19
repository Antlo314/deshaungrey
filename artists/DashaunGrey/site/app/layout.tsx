import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070708",
};

export const metadata: Metadata = {
  title: "Dashaun Grey — World of Grey",
  description:
    "New name. New chapter. Different shades. Stream previews of Show Me and Where Dem Dollars At. Merch, tour drops, and ASH — Dashaun Grey's biggest fan.",
  metadataBase: new URL("https://dashaungrey.com"),
  openGraph: {
    title: "Dashaun Grey — World of Grey",
    description: "New name. New chapter. Different shades.",
    images: ["/media/og.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashaun Grey — World of Grey",
    images: ["/media/og.jpg"],
  },
  icons: { icon: "/favicon.svg" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "Dashaun Grey",
  alternateName: "Que Williams",
  url: "https://dashaungrey.com",
  image: "https://dashaungrey.com/media/og.jpg",
  genre: ["R&B", "Hip-Hop", "Pop", "Reggae", "Dance"],
  foundingLocation: { "@type": "Place", name: "Loris, South Carolina" },
  recordLabel: { "@type": "Organization", name: "MEG Enterprises, LLC" },
  track: [
    { "@type": "MusicRecording", name: "Show Me", byArtist: { "@type": "MusicGroup", name: "Dashaun Grey" } },
    { "@type": "MusicRecording", name: "Where Dem Dollars At", byArtist: { "@type": "MusicGroup", name: "Dashaun Grey" } },
  ],
  album: { "@type": "MusicAlbum", name: "World of Grey" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${display.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <noscript>
          <style>{`.st>span,.reveal,.reveal-clip,.reveal-x,.hero-fade{opacity:1!important;transform:none!important;clip-path:none!important}.reveal-lines .l>span{transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <div className="film-grain" aria-hidden />
        <div className="vignette" aria-hidden />
        {children}
      </body>
    </html>
  );
}
