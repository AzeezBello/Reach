import type { NextConfig } from "next";

const ONE_YEAR = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Never ship browser source maps to production.
  productionBrowserSourceMaps: false,

  // Drop the X-Powered-By header.
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  turbopack: {
    root: process.cwd(),
  },

  experimental: {
    // Only the icons that are actually imported end up in the bundle.
    optimizePackageImports: ["lucide-react"],
  },

  // Media in /public never changes without a new filename, so let browsers
  // and the CDN keep it for a year.
  async headers() {
    return [
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
