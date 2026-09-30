import type { MetadataRoute } from "next";

import { leaders } from "@/lib/leadership";
import { SITE_URL, getPublicData } from "@/lib/reach";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/programmes",
    "/opportunities",
    "/projects",
    "/leadership",
    "/requests",
    "/requests/new",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const leaderRoutes = leaders.map((leader) => ({
    url: `${SITE_URL}/leadership/${leader.slug}`,
    lastModified: new Date(),
  }));

  try {
    const { programmes, opportunities, projects } = await getPublicData();

    const contentRoutes = [
      ...programmes.map((item) => `/programmes/${item.slug}`),
      ...opportunities.map((item) => `/opportunities/${item.slug}`),
      ...projects.map((item) => `/projects/${item.slug}`),
    ].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    }));

    return [...staticRoutes, ...leaderRoutes, ...contentRoutes];
  } catch {
    return [...staticRoutes, ...leaderRoutes];
  }
}
