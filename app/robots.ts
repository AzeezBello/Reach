import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/reach";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/requests/new"],
      disallow: ["/superadmin", "/dashboard", "/api/", "/auth/", "/requests/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
