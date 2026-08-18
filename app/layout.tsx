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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${display.variable}`}>
      <body>
        <div className="film-grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
