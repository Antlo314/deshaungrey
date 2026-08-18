import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Oswald } from "next/font/google";
import { company, siteUrl } from "@/lib/content";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
const cond = Oswald({ variable: "--font-cond", subsets: ["latin"], weight: ["400", "500", "600"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

const TITLE = "MEG Enterprises — Independent Record Label · Artist Development";
const DESC =
  "MEG Enterprises, LLC is an independent record label and family-founded entertainment company built on more than three decades of music, artist development, management, promotion and entertainment business strategy. Independent Music. Developing Artists. Building Brands. Creating Legacy.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: TITLE, template: "%s — MEG Enterprises" },
  description: DESC,
  applicationName: "MEG Enterprises",
  keywords: ["independent record label", "artist development", "artist management", "MEG Enterprises", "Dashaun Grey", "Dr. Glenda S. Williams", "Atlanta record label", "music promotion"],
  openGraph: {
    type: "website",
    siteName: "MEG Enterprises",
    title: TITLE,
    description: company.tagline,
    images: [{ url: "/media/og.jpg", width: 1200, height: 630, alt: "MEG Enterprises" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: company.tagline, images: ["/media/og.jpg"] },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legal,
  alternateName: ["MEG Enterprises", "M.E.G Enterprises"],
  url: siteUrl(),
  logo: `${siteUrl()}/media/brand/logo-full.png`,
  description: company.intro,
  founder: { "@type": "Person", name: company.founder },
  slogan: company.tagline,
  knowsAbout: ["Artist development", "Artist management", "Music promotion", "Record label", "Entertainment consulting"],
  areaServed: ["US"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${display.variable} ${cond.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <noscript>
          <style>{`.st>span,.reveal,.reveal-clip,.reveal-x,.hero-fade,.hero-mark{opacity:1!important;transform:none!important;clip-path:none!important}.reveal-lines .l>span{transform:none!important}.pre{display:none!important}`}</style>
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
