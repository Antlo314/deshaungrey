import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Covers and portraits are served from /public; artist links may point at
    // external hosts, which we render as plain <img>. Nothing remote is
    // optimised through next/image yet, so no remotePatterns are needed.
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/about", destination: "/legacy", permanent: true },
      { source: "/roster", destination: "/artists", permanent: true },
      { source: "/music", destination: "/releases", permanent: true },
      { source: "/news", destination: "/press", permanent: true },
      { source: "/dashboard", destination: "/admin", permanent: false },
      { source: "/login", destination: "/admin/login", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
